namespace Compacting.Api.Modules.Storage;

public record StoredFileDto(
    string FileId,
    string FileName,
    string ContentType,
    long SizeBytes,
    string FilePath,
    DateTime CreatedAt
);
