using Microsoft.AspNetCore.Mvc;

namespace Compacting.Api.Modules.Compression;

[ApiController]
[Route("api/v1/compression")]
public class CompressionController : ControllerBase
{
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

    /// <summary>
    /// Compress an image file directly. Returns binary stream or JSON metadata if ?json=true.
    /// </summary>
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

        var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString();
        Guid? apiKeyId =
            HttpContext.Items.TryGetValue("ApiKeyId", out var idObj) && idObj is Guid keyId
                ? keyId
                : null;

        await using var stream = file.OpenReadStream();
        var processed = await _compressionService.CompressAsync(
            stream,
            file.FileName,
            options,
            apiKeyId,
            clientIp,
            cancellationToken
        );

        bool prefersJson =
            (json == true)
            || (
                Request.Headers.Accept.ToString().Contains("application/json")
                && options.ReturnBase64
            );

        if (prefersJson)
        {
            return Ok(processed.Metadata);
        }

        Response.Headers.Append("X-Original-Size", processed.Metadata.OriginalSizeBytes.ToString());
        Response.Headers.Append(
            "X-Compressed-Size",
            processed.Metadata.CompressedSizeBytes.ToString()
        );
        Response.Headers.Append("X-Bytes-Saved", processed.Metadata.BytesSaved.ToString());
        Response.Headers.Append(
            "X-Compression-Ratio",
            $"{processed.Metadata.CompressionRatioPercent}%"
        );
        Response.Headers.Append("X-Duration-Ms", processed.Metadata.DurationMs.ToString());

        return File(processed.Data, processed.ContentType, processed.FileName);
    }

    /// <summary>
    /// Compress image and return JSON payload with Base64 output data and analytical metrics.
    /// </summary>
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

        options.ReturnBase64 = true;
        var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString();
        Guid? apiKeyId =
            HttpContext.Items.TryGetValue("ApiKeyId", out var idObj) && idObj is Guid keyId
                ? keyId
                : null;

        await using var stream = file.OpenReadStream();
        var processed = await _compressionService.CompressAsync(
            stream,
            file.FileName,
            options,
            apiKeyId,
            clientIp,
            cancellationToken
        );

        return Ok(processed.Metadata);
    }

    /// <summary>
    /// Compress multiple images in batch and receive list of compression results.
    /// </summary>
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

        options.ReturnBase64 = true;
        var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString();
        Guid? apiKeyId =
            HttpContext.Items.TryGetValue("ApiKeyId", out var idObj) && idObj is Guid keyId
                ? keyId
                : null;

        var streams = new List<(Stream Stream, string FileName)>();
        foreach (var file in files)
        {
            streams.Add((file.OpenReadStream(), file.FileName));
        }

        var results = await _compressionService.CompressBatchAsync(
            streams,
            options,
            apiKeyId,
            clientIp,
            cancellationToken
        );

        foreach (var (stream, _) in streams)
        {
            await stream.DisposeAsync();
        }

        return Ok(results.Select(r => r.Metadata).ToList());
    }
}
