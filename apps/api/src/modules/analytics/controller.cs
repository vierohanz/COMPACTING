using System.Security.Claims;
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
    /// Get overall compression metrics, bandwidth saved, and active key count (scoped to user if authenticated).
    /// </summary>
    [HttpGet("summary")]
    [ProducesResponseType(typeof(AnalyticsSummaryDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSummary(
        [FromQuery] bool global = false,
        CancellationToken cancellationToken = default
    )
    {
        Guid? currentUserId = global ? null : GetCurrentUserId();
        var summary = await _analyticsService.GetSummaryAsync(currentUserId, cancellationToken);
        return Ok(summary);
    }

    /// <summary>
    /// Get recent compression event logs (scoped to user if authenticated).
    /// </summary>
    [HttpGet("recent")]
    [ProducesResponseType(typeof(List<RecentCompressionItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRecent(
        [FromQuery] int limit = 20,
        [FromQuery] bool global = false,
        CancellationToken cancellationToken = default
    )
    {
        Guid? currentUserId = global ? null : GetCurrentUserId();
        var recent = await _analyticsService.GetRecentCompressionsAsync(limit, currentUserId, cancellationToken);
        return Ok(recent);
    }

    /// <summary>
    /// Get distribution breakdown by target image format.
    /// </summary>
    [HttpGet("formats")]
    [ProducesResponseType(typeof(List<FormatBreakdownDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFormatBreakdown(
        [FromQuery] bool global = false,
        CancellationToken cancellationToken = default
    )
    {
        Guid? currentUserId = global ? null : GetCurrentUserId();
        var breakdown = await _analyticsService.GetFormatBreakdownAsync(currentUserId, cancellationToken);
        return Ok(breakdown);
    }

    private Guid? GetCurrentUserId()
    {
        var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value;
        if (!string.IsNullOrEmpty(sub) && Guid.TryParse(sub, out var uid))
        {
            return uid;
        }
        return null;
    }
}
