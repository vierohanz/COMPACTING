using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace Compacting.Api.Modules.ApiKeys;

[ApiController]
[Route("api/v1/apikeys")]
public class ApiKeyController : ControllerBase
{
    private readonly IApiKeyService _apiKeyService;

    public ApiKeyController(IApiKeyService apiKeyService)
    {
        _apiKeyService = apiKeyService;
    }

    /// <summary>
    /// Retrieve all registered API keys for current user or platform.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<ApiKeyDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        Guid? currentUserId = GetCurrentUserId();
        var keys = await _apiKeyService.GetAllKeysAsync(currentUserId, cancellationToken);
        return Ok(keys);
    }

    /// <summary>
    /// Create a new API Key for external integration.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiKeyCreatedResponseDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create(
        [FromBody] CreateApiKeyRequest request,
        CancellationToken cancellationToken
    )
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        Guid? currentUserId = GetCurrentUserId();
        var result = await _apiKeyService.CreateKeyAsync(request, currentUserId, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, result);
    }

    /// <summary>
    /// Revoke an existing API Key.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Revoke(Guid id, CancellationToken cancellationToken)
    {
        Guid? currentUserId = GetCurrentUserId();
        bool success = await _apiKeyService.RevokeKeyAsync(id, currentUserId, cancellationToken);
        if (!success)
        {
            return NotFound(new { error = "API key not found or not authorized." });
        }

        return NoContent();
    }

    private Guid? GetCurrentUserId()
    {
        var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value;
        if (!string.IsNullOrEmpty(sub) && Guid.TryParse(sub, out var uid))
        {
            return uid;
        }
        return null;
    }
}
