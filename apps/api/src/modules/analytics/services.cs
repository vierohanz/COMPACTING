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
        var logsQuery = _dbContext.CompressionLogs.AsQueryable();
        var keysQuery = _dbContext.ApiKeys.AsQueryable();

        if (userId.HasValue)
        {
            logsQuery = logsQuery.Where(l => l.UserId == userId.Value);
            keysQuery = keysQuery.Where(k => k.UserId == userId.Value);
        }

        long totalImages = await logsQuery.LongCountAsync(cancellationToken);
        long activeKeys = await keysQuery.LongCountAsync(
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

        long totalOriginalBytes = await logsQuery.SumAsync(
            l => l.OriginalSizeBytes,
            cancellationToken
        );
        long totalCompressedBytes = await logsQuery.SumAsync(
            l => l.CompressedSizeBytes,
            cancellationToken
        );
        long totalBytesSaved = await logsQuery.SumAsync(
            l => l.BytesSaved,
            cancellationToken
        );
        double avgSavingsPercent = await logsQuery.AverageAsync(
            l => l.CompressionRatioPercent,
            cancellationToken
        );
        double avgDuration = await logsQuery.AverageAsync(
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
        Guid? userId = null,
        CancellationToken cancellationToken = default
    )
    {
        var query = _dbContext.CompressionLogs.AsQueryable();
        if (userId.HasValue)
        {
            query = query.Where(l => l.UserId == userId.Value);
        }

        var logs = await query
            .OrderByDescending(l => l.CreatedAt)
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
        Guid? userId = null,
        CancellationToken cancellationToken = default
    )
    {
        var query = _dbContext.CompressionLogs.AsQueryable();
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
