using Compacting.Api.Modules.ApiKeys;

namespace Compacting.Api.Middleware;

public class ApiKeyAuthMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ApiKeyAuthMiddleware> _logger;

    public ApiKeyAuthMiddleware(RequestDelegate next, ILogger<ApiKeyAuthMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, IApiKeyService apiKeyService)
    {
        string? apiKey = null;

        if (
            context.Request.Headers.TryGetValue("X-API-Key", out var headerVal)
            && !string.IsNullOrWhiteSpace(headerVal)
        )
        {
            apiKey = headerVal.ToString();
        }
        else if (context.Request.Headers.TryGetValue("Authorization", out var authVal))
        {
            var authHeader = authVal.ToString();
            if (authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                apiKey = authHeader["Bearer ".Length..].Trim();
            }
        }

        if (!string.IsNullOrWhiteSpace(apiKey))
        {
            var validatedKey = await apiKeyService.ValidateKeyAsync(apiKey, context.RequestAborted);
            if (validatedKey != null)
            {
                context.Items["ApiKeyId"] = validatedKey.Id;
                context.Items["ApiKeyName"] = validatedKey.Name;
            }
            else
            {
                _logger.LogWarning("Invalid or expired API Key used: {Path}", context.Request.Path);
            }
        }

        await _next(context);
    }
}
