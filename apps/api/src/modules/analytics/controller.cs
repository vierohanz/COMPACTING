using Microsoft.AspNetCore.Mvc;

namespace Compacting.Api.Modules.Analytics;

[ApiController]
[Route("api/v1/analytics")]
public class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsService _analyticsService;

    public AnalyticsController(IAnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    /// <summary>
    /// Get overall compression metrics, bandwidth saved, and active key count.
    /// </summary>
    [HttpGet("summary")]
    [ProducesResponseType(typeof(AnalyticsSummaryDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSummary(CancellationToken cancellationToken)
    {
        var summary = await _analyticsService.GetSummaryAsync(cancellationToken);
        return Ok(summary);
    }

    /// <summary>
    /// Get recent compression event logs.
    /// </summary>
    [HttpGet("recent")]
    [ProducesResponseType(typeof(List<RecentCompressionItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRecent(
        [FromQuery] int limit = 20,
        CancellationToken cancellationToken = default
    )
    {
        var recent = await _analyticsService.GetRecentCompressionsAsync(limit, cancellationToken);
        return Ok(recent);
    }

    /// <summary>
    /// Get distribution breakdown by target image format.
    /// </summary>
    [HttpGet("formats")]
    [ProducesResponseType(typeof(List<FormatBreakdownDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFormatBreakdown(CancellationToken cancellationToken)
    {
        var breakdown = await _analyticsService.GetFormatBreakdownAsync(cancellationToken);
        return Ok(breakdown);
    }
}
