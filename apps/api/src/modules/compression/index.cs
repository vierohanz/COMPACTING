namespace Compacting.Api.Modules.Compression;

public static class CompressionModule
{
    public static IServiceCollection AddCompressionModule(this IServiceCollection services)
    {
        services.AddScoped<ICompressionService, CompressionService>();
        return services;
    }
}
