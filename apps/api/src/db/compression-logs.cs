namespace Compacting.Api.Db;

public class CompressionLogEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? UserId { get; set; }
    public Guid? ApiKeyId { get; set; }
    public string OriginalFileName { get; set; } = string.Empty;
    public string SourceFormat { get; set; } = string.Empty;
    public string TargetFormat { get; set; } = string.Empty;
    public long OriginalSizeBytes { get; set; }
    public long CompressedSizeBytes { get; set; }
    public long BytesSaved { get; set; }
    public double CompressionRatioPercent { get; set; }
    public int DurationMs { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? ClientIp { get; set; }
}
