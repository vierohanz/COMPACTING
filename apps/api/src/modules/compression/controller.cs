using System.Globalization;
using Microsoft.AspNetCore.Mvc;

namespace Compacting.Api.Modules.Compression;

[ApiController]
[Route("api/v1/compression")]
public class CompressionController : ControllerBase
{
    private const long MaxSingleFileSizeBytes = 50 * 1024 * 1024;
    private const int MaxBatchFilesCount = 50;

    private readonly ICompressionService _compressionService;
    private readonly ILogger<CompressionController> _logger;

    public CompressionController(
        ICompressionService compressionService,
        ILogger<CompressionController> logger
    )
    {
        _compressionService = compressionService;
        _logger = logger;
    }

    [HttpPost("compress")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(CompressionResultDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> CompressSingle(
        IFormFile file,
        [FromQuery] CompressionOptionsDto options,
        [FromQuery] bool? json = false,
        CancellationToken cancellationToken = default
    )
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { error = "No image file provided." });
        }

        if (file.Length > MaxSingleFileSizeBytes)
        {
            return BadRequest(new { error = "File exceeds the 50MB maximum allowed upload limit." });
        }

        var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString();
        Guid? apiKeyId =
            HttpContext.Items.TryGetValue("ApiKeyId", out var idObj) && idObj is Guid keyId
                ? keyId
                : null;
        Guid? currentUserId = GetCurrentUserId();

        await using var stream = file.OpenReadStream();
        var processed = await _compressionService.CompressAsync(
            stream,
            file.FileName,
            options,
            apiKeyId,
            clientIp,
            currentUserId,
            cancellationToken
        );

        bool prefersJson =
            (json == true)
            || (
                Request.Headers.Accept.ToString().Contains("application/json", StringComparison.OrdinalIgnoreCase)
                && options.ReturnBase64
            );

        if (prefersJson)
        {
            return Ok(processed.Metadata);
        }

        Response.Headers.Append("X-Original-Size", processed.Metadata.OriginalSizeBytes.ToString(CultureInfo.InvariantCulture));
        Response.Headers.Append(
            "X-Compressed-Size",
            processed.Metadata.CompressedSizeBytes.ToString(CultureInfo.InvariantCulture)
        );
        Response.Headers.Append("X-Bytes-Saved", processed.Metadata.BytesSaved.ToString(CultureInfo.InvariantCulture));
        Response.Headers.Append(
            "X-Compression-Ratio",
            $"{processed.Metadata.CompressionRatioPercent.ToString(CultureInfo.InvariantCulture)}%"
        );
        Response.Headers.Append("X-Duration-Ms", processed.Metadata.DurationMs.ToString(CultureInfo.InvariantCulture));

        return File(processed.Data, processed.ContentType, processed.FileName);
    }

    [HttpPost("compress-json")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(CompressionResultDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> CompressSingleJson(
        IFormFile file,
        [FromQuery] CompressionOptionsDto options,
        CancellationToken cancellationToken = default
    )
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { error = "No image file provided." });
        }

        if (file.Length > MaxSingleFileSizeBytes)
        {
            return BadRequest(new { error = "File exceeds the 50MB maximum allowed upload limit." });
        }

        options.ReturnBase64 = true;
        var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString();
        Guid? apiKeyId =
            HttpContext.Items.TryGetValue("ApiKeyId", out var idObj) && idObj is Guid keyId
                ? keyId
                : null;
        Guid? currentUserId = GetCurrentUserId();

        await using var stream = file.OpenReadStream();
        var processed = await _compressionService.CompressAsync(
            stream,
            file.FileName,
            options,
            apiKeyId,
            clientIp,
            currentUserId,
            cancellationToken
        );

        return Ok(processed.Metadata);
    }

    [HttpPost("batch")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(List<CompressionResultDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> CompressBatch(
        [FromForm] List<IFormFile> files,
        [FromQuery] CompressionOptionsDto options,
        CancellationToken cancellationToken = default
    )
    {
        if (files == null || files.Count == 0)
        {
            return BadRequest(new { error = "No image files provided for batch processing." });
        }

        if (files.Count > MaxBatchFilesCount)
        {
            return BadRequest(new { error = $"Batch size exceeds maximum limit of {MaxBatchFilesCount} files." });
        }

        options.ReturnBase64 = true;
        var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString();
        Guid? apiKeyId =
            HttpContext.Items.TryGetValue("ApiKeyId", out var idObj) && idObj is Guid keyId
                ? keyId
                : null;
        Guid? currentUserId = GetCurrentUserId();

        var streams = new List<(Stream Stream, string FileName)>(files.Count);
        try
        {
            foreach (var file in files)
            {
                streams.Add((file.OpenReadStream(), file.FileName));
            }

            var results = await _compressionService.CompressBatchAsync(
                streams,
                options,
                apiKeyId,
                clientIp,
                currentUserId,
                cancellationToken
            );

            return Ok(results.Select(r => r.Metadata).ToList());
        }
        finally
        {
            foreach (var (stream, _) in streams)
            {
                await stream.DisposeAsync();
            }
        }
    }

    private Guid? GetCurrentUserId()
    {
        var sub = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value;
        if (!string.IsNullOrEmpty(sub) && Guid.TryParse(sub, out var uid))
        {
            return uid;
        }
        return null;
    }
}
