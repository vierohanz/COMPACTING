using Compacting.Api.Db;
using Microsoft.EntityFrameworkCore;

namespace Compacting.Api.Modules.Analytics;

public interface IAnalyticsService
{
    Task<AnalyticsSummaryDto> GetSummaryAsync(Guid? userId = null, CancellationToken cancellationToken = default);
    Task<List<RecentCompressionItemDto>> GetRecentCompressionsAsync(
        int limit = 20,
        Guid? userId = null,
        CancellationToken cancellationToken = default
    );
    Task<List<FormatBreakdownDto>> GetFormatBreakdownAsync(
        Guid? userId = null,
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
        Guid? userId = null,
        CancellationToken cancellationToken = default
    )
    {
        var logsQuery = _dbContext.CompressionLogs.AsNoTracking();
        var keysQuery = _dbContext.ApiKeys.AsNoTracking();

        if (userId.HasValue)
        {
            logsQuery = logsQuery.Where(l => l.UserId == userId.Value);
            keysQuery = keysQuery.Where(k => k.UserId == userId.Value);
        }

        var activeKeysTask = keysQuery.LongCountAsync(
            k => !k.IsRevoked,
            cancellationToken
        );

        var stats = await logsQuery
            .GroupBy(_ => 1)
            .Select(g => new
            {
                TotalImages = g.LongCount(),
                TotalOriginalBytes = g.Sum(l => l.OriginalSizeBytes),
                TotalCompressedBytes = g.Sum(l => l.CompressedSizeBytes),
                TotalBytesSaved = g.Sum(l => l.BytesSaved),
                AvgSavingsPercent = g.Average(l => l.CompressionRatioPercent),
                AvgDuration = g.Average(l => (double)l.DurationMs),
            })
            .FirstOrDefaultAsync(cancellationToken);

        long activeKeys = await activeKeysTask;

        if (stats == null || stats.TotalImages == 0)
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

        return new AnalyticsSummaryDto(
            TotalImagesCompressed: stats.TotalImages,
            TotalOriginalBytes: stats.TotalOriginalBytes,
            TotalCompressedBytes: stats.TotalCompressedBytes,
            TotalBytesSaved: stats.TotalBytesSaved,
            AverageSavingsPercentage: Math.Round(stats.AvgSavingsPercent, 2),
            AverageDurationMs: Math.Round(stats.AvgDuration, 1),
            TotalActiveApiKeys: activeKeys
        );
    }

    public async Task<List<RecentCompressionItemDto>> GetRecentCompressionsAsync(
        int limit = 20,
        Guid? userId = null,
        CancellationToken cancellationToken = default
    )
    {
        var query = _dbContext.CompressionLogs.AsNoTracking();
        if (userId.HasValue)
        {
            query = query.Where(l => l.UserId == userId.Value);
        }

        var logs = await query
            .OrderByDescending(l => l.CreatedAt)
            .Take(limit)
            .Select(l => new RecentCompressionItemDto(
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
            .ToListAsync(cancellationToken);

        return logs;
    }

    public async Task<List<FormatBreakdownDto>> GetFormatBreakdownAsync(
        Guid? userId = null,
        CancellationToken cancellationToken = default
    )
    {
        var query = _dbContext.CompressionLogs.AsNoTracking();
        if (userId.HasValue)
        {
            query = query.Where(l => l.UserId == userId.Value);
        }

        var breakdown = await query
            .GroupBy(l => l.TargetFormat)
            .Select(g => new FormatBreakdownDto(g.Key, g.Count(), g.Sum(x => x.BytesSaved)))
            .ToListAsync(cancellationToken);

        return breakdown;
    }
}
