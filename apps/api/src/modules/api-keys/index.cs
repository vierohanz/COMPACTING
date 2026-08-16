namespace Compacting.Api.Modules.ApiKeys;

public static class ApiKeyModule
{
    public static IServiceCollection AddApiKeyModule(this IServiceCollection services)
    {
        services.AddScoped<IApiKeyService, ApiKeyService>();
        return services;
    }
}
