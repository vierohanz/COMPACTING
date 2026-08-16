using System.ComponentModel.DataAnnotations;

namespace Compacting.Api.Modules.Compression;

public enum OutputFormat
{
    Auto,
    WebP,
    Jpeg,
    Png,
    Gif
}

public enum ResizeModeOption
{
    None,
    Max,
    Crop,
    Pad,
    Stretch
}

public class CompressionOptionsDto
{
    [Range(1, 100)]
    public int Quality { get; set; } = 80;

    public OutputFormat Format { get; set; } = OutputFormat.Auto;

    [Range(1, 10000)]
    public int? MaxWidth { get; set; }

    [Range(1, 10000)]
    public int? MaxHeight { get; set; }

    public ResizeModeOption ResizeMode { get; set; } = ResizeModeOption.Max;

    public bool StripMetadata { get; set; } = true;

    public bool Lossless { get; set; } = false;

    public bool ReturnBase64 { get; set; } = false;
}

public record CompressionResultDto(
    bool Success,
    string FileName,
    string SourceFormat,
    string TargetFormat,
    string ContentType,
    long OriginalSizeBytes,
    long CompressedSizeBytes,
    long BytesSaved,
    double CompressionRatioPercent,
    int Width,
    int Height,
    int DurationMs,
    string? Base64Data = null,
    string? ErrorMessage = null
);

public class CompressionProcessedFile
{
    public required byte[] Data { get; set; }
    public required string ContentType { get; set; }
    public required string FileName { get; set; }
    public required CompressionResultDto Metadata { get; set; }
}
