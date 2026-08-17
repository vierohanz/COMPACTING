using Compacting.Api.Db;
using Microsoft.EntityFrameworkCore;

namespace Compacting.Api.Modules.Analytics;

public interface IAnalyticsService
{
    Task<AnalyticsSummaryDto> GetSummaryAsync(CancellationToken cancellationToken = default);
    Task<List<RecentCompressionItemDto>> GetRecentCompressionsAsync(
        int limit = 20,
        CancellationToken cancellationToken = default
    );
    Task<List<FormatBreakdownDto>> GetFormatBreakdownAsync(
        CancellationToken cancellationToken = default
    );
}

public class AnalyticsService : IAnalyticsService
{
    private readonly AppDbContext _dbContext;

    public AnalyticsService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<AnalyticsSummaryDto> GetSummaryAsync(
        CancellationToken cancellationToken = default
    )
    {
        long totalImages = await _dbContext.CompressionLogs.LongCountAsync(cancellationToken);
        long activeKeys = await _dbContext.ApiKeys.LongCountAsync(
            k => !k.IsRevoked,
            cancellationToken
        );

        if (totalImages == 0)
        {
            return new AnalyticsSummaryDto(
                TotalImagesCompressed: 0,
                TotalOriginalBytes: 0,
                TotalCompressedBytes: 0,
                TotalBytesSaved: 0,
                AverageSavingsPercentage: 0,
                AverageDurationMs: 0,
                TotalActiveApiKeys: activeKeys
            );
        }

        long totalOriginalBytes = await _dbContext.CompressionLogs.SumAsync(
            l => l.OriginalSizeBytes,
            cancellationToken
        );
        long totalCompressedBytes = await _dbContext.CompressionLogs.SumAsync(
            l => l.CompressedSizeBytes,
            cancellationToken
        );
        long totalBytesSaved = await _dbContext.CompressionLogs.SumAsync(
            l => l.BytesSaved,
            cancellationToken
        );
        double avgSavingsPercent = await _dbContext.CompressionLogs.AverageAsync(
            l => l.CompressionRatioPercent,
            cancellationToken
        );
        double avgDuration = await _dbContext.CompressionLogs.AverageAsync(
            l => l.DurationMs,
            cancellationToken
        );

        return new AnalyticsSummaryDto(
            TotalImagesCompressed: totalImages,
            TotalOriginalBytes: totalOriginalBytes,
            TotalCompressedBytes: totalCompressedBytes,
            TotalBytesSaved: totalBytesSaved,
            AverageSavingsPercentage: Math.Round(avgSavingsPercent, 2),
            AverageDurationMs: Math.Round(avgDuration, 1),
            TotalActiveApiKeys: activeKeys
        );
    }

    public async Task<List<RecentCompressionItemDto>> GetRecentCompressionsAsync(
        int limit = 20,
        CancellationToken cancellationToken = default
    )
    {
        var logs = await _dbContext
            .CompressionLogs.OrderByDescending(l => l.CreatedAt)
            .Take(limit)
            .ToListAsync(cancellationToken);

        return logs.Select(l => new RecentCompressionItemDto(
                l.Id,
                l.OriginalFileName,
                l.SourceFormat,
                l.TargetFormat,
                l.OriginalSizeBytes,
                l.CompressedSizeBytes,
                l.BytesSaved,
                l.CompressionRatioPercent,
                l.DurationMs,
                l.CreatedAt
            ))
            .ToList();
    }

    public async Task<List<FormatBreakdownDto>> GetFormatBreakdownAsync(
        CancellationToken cancellationToken = default
    )
    {
        var breakdown = await _dbContext
            .CompressionLogs.GroupBy(l => l.TargetFormat)
            .Select(g => new FormatBreakdownDto(g.Key, g.Count(), g.Sum(x => x.BytesSaved)))
            .ToListAsync(cancellationToken);

        return breakdown;
    }
}
