using System.Diagnostics;
using Compacting.Api.Db;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats;
using SixLabors.ImageSharp.Formats.Gif;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Formats.Png;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.Processing;

namespace Compacting.Api.Modules.Compression;

public interface ICompressionService
{
    Task<CompressionProcessedFile> CompressAsync(
        Stream inputStream,
        string originalFileName,
        CompressionOptionsDto options,
        Guid? apiKeyId = null,
        string? clientIp = null,
        Guid? userId = null,
        CancellationToken cancellationToken = default
    );

    Task<List<CompressionProcessedFile>> CompressBatchAsync(
        IEnumerable<(Stream Stream, string FileName)> files,
        CompressionOptionsDto options,
        Guid? apiKeyId = null,
        string? clientIp = null,
        Guid? userId = null,
        CancellationToken cancellationToken = default
    );
}

public class CompressionService : ICompressionService
{
    private readonly AppDbContext _dbContext;
    private readonly ILogger<CompressionService> _logger;

    public CompressionService(AppDbContext dbContext, ILogger<CompressionService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<CompressionProcessedFile> CompressAsync(
        Stream inputStream,
        string originalFileName,
        CompressionOptionsDto options,
        Guid? apiKeyId = null,
        string? clientIp = null,
        Guid? userId = null,
        CancellationToken cancellationToken = default
    )
    {
        var stopwatch = Stopwatch.StartNew();
        long originalSize = inputStream.Length;

        if (inputStream.CanSeek)
        {
            inputStream.Position = 0;
        }

        var sourceFormat =
            await Image.DetectFormatAsync(inputStream, cancellationToken) ?? WebpFormat.Instance;
        if (inputStream.CanSeek)
        {
            inputStream.Position = 0;
        }

        var image = await Image.LoadAsync(inputStream, cancellationToken);
        using (image)
        {
            if (options.StripMetadata)
            {
                image.Metadata.ExifProfile = null;
                image.Metadata.IptcProfile = null;
                image.Metadata.XmpProfile = null;
            }

            int targetWidth = image.Width;
            int targetHeight = image.Height;

            if (options.Scale > 1)
            {
                targetWidth = (int)Math.Round(image.Width * options.Scale);
                targetHeight = (int)Math.Round(image.Height * options.Scale);
                var resizeOptions = new ResizeOptions
                {
                    Size = new Size(targetWidth, targetHeight),
                    Mode = ResizeMode.Stretch,
                    Sampler = KnownResamplers.Lanczos3,
                };
                image.Mutate(ctx => ctx.Resize(resizeOptions));
            }
            else if (options.MaxWidth.HasValue || options.MaxHeight.HasValue)
            {
                var resizeOptions = new ResizeOptions
                {
                    Size = new Size(
                        options.MaxWidth ?? image.Width,
                        options.MaxHeight ?? image.Height
                    ),
                    Mode = ResizeMode.Max,
                    Sampler = KnownResamplers.Lanczos3,
                };
                image.Mutate(ctx => ctx.Resize(resizeOptions));
            }

            if (options.EnhanceHd)
            {
                float amount = Math.Clamp((float)options.Sharpen, 0.5f, 2.5f);
                image.Mutate(ctx => ctx.GaussianSharpen(amount));
            }

            var (encoder, extension, contentType, targetFormatName) = ResolveEncoder(
                options,
                sourceFormat
            );

            using var outputStream = new MemoryStream();
            await image.SaveAsync(outputStream, encoder, cancellationToken);
            byte[] compressedBytes = outputStream.ToArray();
            long compressedSize = compressedBytes.Length;

            long bytesSaved = Math.Max(0, originalSize - compressedSize);
            double ratioPercent =
                originalSize > 0
                    ? Math.Round(((double)bytesSaved / originalSize) * 100, 2)
                    : 0;

            string baseName = Path.GetFileNameWithoutExtension(originalFileName);
            string targetFileName = $"{baseName}{extension}";

            var metadata = new CompressionResultDto(
                Success: true,
                FileName: targetFileName,
                SourceFormat: sourceFormat.Name,
                TargetFormat: targetFormatName,
                ContentType: contentType,
                OriginalSizeBytes: originalSize,
                CompressedSizeBytes: compressedSize,
                BytesSaved: bytesSaved,
                CompressionRatioPercent: ratioPercent,
                Width: image.Width,
                Height: image.Height,
                DurationMs: (int)stopwatch.ElapsedMilliseconds,
                Base64Data: options.ReturnBase64 ? Convert.ToBase64String(compressedBytes) : null
            );

            try
            {
                Guid? effectiveUserId = userId;

                if (apiKeyId.HasValue)
                {
                    var apiKey = await _dbContext.ApiKeys.FindAsync(
                        new object[] { apiKeyId.Value },
                        cancellationToken
                    );
                    if (apiKey != null)
                    {
                        apiKey.TotalRequests++;
                        apiKey.TotalBytesSaved += bytesSaved;
                        if (!effectiveUserId.HasValue && apiKey.UserId.HasValue)
                        {
                            effectiveUserId = apiKey.UserId;
                        }
                    }
                }

                var logEntry = new CompressionLogEntity
                {
                    UserId = effectiveUserId,
                    ApiKeyId = apiKeyId,
                    OriginalFileName = originalFileName,
                    SourceFormat = sourceFormat.Name,
                    TargetFormat = targetFormatName,
                    OriginalSizeBytes = originalSize,
                    CompressedSizeBytes = compressedSize,
                    BytesSaved = bytesSaved,
                    CompressionRatioPercent = ratioPercent,
                    DurationMs = (int)stopwatch.ElapsedMilliseconds,
                    Width = image.Width,
                    Height = image.Height,
                    ClientIp = clientIp,
                    CreatedAt = DateTime.UtcNow,
                };

                _dbContext.CompressionLogs.Add(logEntry);
                await _dbContext.SaveChangesAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to persist compression log to database.");
            }

            return new CompressionProcessedFile
            {
                Data = compressedBytes,
                ContentType = contentType,
                FileName = targetFileName,
                Metadata = metadata,
            };
        }
    }

    public async Task<List<CompressionProcessedFile>> CompressBatchAsync(
        IEnumerable<(Stream Stream, string FileName)> files,
        CompressionOptionsDto options,
        Guid? apiKeyId = null,
        string? clientIp = null,
        Guid? userId = null,
        CancellationToken cancellationToken = default
    )
    {
        var results = new List<CompressionProcessedFile>();

        foreach (var (stream, fileName) in files)
        {
            try
            {
                var processed = await CompressAsync(
                    stream,
                    fileName,
                    options,
                    apiKeyId,
                    clientIp,
                    userId,
                    cancellationToken
                );
                results.Add(processed);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error compressing file {FileName} in batch", fileName);
                results.Add(
                    new CompressionProcessedFile
                    {
                        Data = Array.Empty<byte>(),
                        ContentType = "application/octet-stream",
                        FileName = fileName,
                        Metadata = new CompressionResultDto(
                            Success: false,
                            FileName: fileName,
                            SourceFormat: "Unknown",
                            TargetFormat: "Unknown",
                            ContentType: "application/octet-stream",
                            OriginalSizeBytes: stream.Length,
                            CompressedSizeBytes: stream.Length,
                            BytesSaved: 0,
                            CompressionRatioPercent: 0,
                            Width: 0,
                            Height: 0,
                            DurationMs: 0,
                            ErrorMessage: ex.Message
                        ),
                    }
                );
            }
        }

        return results;
    }

    private (
        ImageEncoder Encoder,
        string Extension,
        string ContentType,
        string FormatName
    ) ResolveEncoder(CompressionOptionsDto options, IImageFormat sourceFormat)
    {
        var target = options.Format;
        if (target == OutputFormat.Auto)
        {
            target = OutputFormat.WebP;
        }

        return target switch
        {
            OutputFormat.WebP => (
                new WebpEncoder
                {
                    Quality = options.Quality,
                    FileFormat = options.Lossless
                        ? WebpFileFormatType.Lossless
                        : WebpFileFormatType.Lossy,
                    Method = WebpEncodingMethod.BestQuality,
                },
                ".webp",
                "image/webp",
                "WebP"
            ),
            OutputFormat.Jpeg => (
                new JpegEncoder { Quality = options.Quality },
                ".jpg",
                "image/jpeg",
                "JPEG"
            ),
            OutputFormat.Png => (
                new PngEncoder { CompressionLevel = PngCompressionLevel.BestCompression },
                ".png",
                "image/png",
                "PNG"
            ),
            OutputFormat.Gif => (new GifEncoder(), ".gif", "image/gif", "GIF"),
            _ => (new WebpEncoder { Quality = options.Quality }, ".webp", "image/webp", "WebP"),
        };
    }
}
