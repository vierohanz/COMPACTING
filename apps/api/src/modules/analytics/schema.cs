namespace Compacting.Api.Modules.Analytics;

public record AnalyticsSummaryDto(
    long TotalImagesCompressed,
    long TotalOriginalBytes,
    long TotalCompressedBytes,
    long TotalBytesSaved,
    double AverageSavingsPercentage,
    double AverageDurationMs,
    long TotalActiveApiKeys
);

public record RecentCompressionItemDto(
    Guid Id,
    string FileName,
    string SourceFormat,
    string TargetFormat,
    long OriginalSizeBytes,
    long CompressedSizeBytes,
    long BytesSaved,
    double CompressionRatioPercent,
    int DurationMs,
    DateTime CreatedAt
);

public record FormatBreakdownDto(
    string Format,
    int Count,
    long TotalBytesSaved
);
