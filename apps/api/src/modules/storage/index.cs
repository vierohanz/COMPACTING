namespace Compacting.Api.Modules.Storage;

public static class StorageModule
{
    public static IServiceCollection AddStorageModule(this IServiceCollection services)
    {
        services.AddSingleton<IStorageService, LocalStorageService>();
        return services;
    }
}
