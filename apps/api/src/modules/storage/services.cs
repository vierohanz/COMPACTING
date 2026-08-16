namespace Compacting.Api.Modules.Storage;

public interface IStorageService
{
    Task<StoredFileDto> SaveTemporaryFileAsync(byte[] data, string fileName, string contentType, CancellationToken cancellationToken = default);
    Task<byte[]?> GetFileAsync(string fileId, CancellationToken cancellationToken = default);
    Task CleanupOldFilesAsync(TimeSpan olderThan, CancellationToken cancellationToken = default);
}

public class LocalStorageService : IStorageService
{
    private readonly string _storageDirectory;
    private readonly ILogger<LocalStorageService> _logger;

    public LocalStorageService(IWebHostEnvironment environment, ILogger<LocalStorageService> logger)
    {
        _logger = logger;
        _storageDirectory = Path.Combine(environment.ContentRootPath, "App_Data", "Storage");
        Directory.CreateDirectory(_storageDirectory);
    }

    public async Task<StoredFileDto> SaveTemporaryFileAsync(byte[] data, string fileName, string contentType, CancellationToken cancellationToken = default)
    {
        string fileId = Guid.NewGuid().ToString("N");
        string safeFileName = $"{fileId}_{Path.GetFileName(fileName)}";
        string filePath = Path.Combine(_storageDirectory, safeFileName);

        await File.WriteAllBytesAsync(filePath, data, cancellationToken);

        return new StoredFileDto(
            FileId: fileId,
            FileName: fileName,
            ContentType: contentType,
            SizeBytes: data.Length,
            FilePath: filePath,
            CreatedAt: DateTime.UtcNow
        );
    }

    public async Task<byte[]?> GetFileAsync(string fileId, CancellationToken cancellationToken = default)
    {
        var files = Directory.GetFiles(_storageDirectory, $"{fileId}_*");
        if (files.Length == 0) return null;

        return await File.ReadAllBytesAsync(files[0], cancellationToken);
    }

    public Task CleanupOldFilesAsync(TimeSpan olderThan, CancellationToken cancellationToken = default)
    {
        try
        {
            var cutoff = DateTime.UtcNow - olderThan;
            var directoryInfo = new DirectoryInfo(_storageDirectory);

            foreach (var file in directoryInfo.GetFiles())
            {
                if (file.CreationTimeUtc < cutoff)
                {
                    file.Delete();
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to cleanup old storage files.");
        }

        return Task.CompletedTask;
    }
}
