using System.ComponentModel.DataAnnotations;

namespace Compacting.Api.Modules.ApiKeys;

public class CreateApiKeyRequest
{
    [Required]
    [StringLength(100, MinimumLength = 3)]
    public string Name { get; set; } = string.Empty;

    [Range(1, 10000)]
    public int RateLimitPerMin { get; set; } = 120;

    public int? ExpiresInDays { get; set; }
}

public record ApiKeyDto(
    Guid Id,
    string Name,
    string KeyPrefix,
    DateTime CreatedAt,
    DateTime? ExpiresAt,
    bool IsRevoked,
    int RateLimitPerMin,
    long TotalRequests,
    long TotalBytesSaved
);

public record ApiKeyCreatedResponseDto(
    Guid Id,
    string Name,
    string KeyPrefix,
    string RawApiKey,
    DateTime CreatedAt,
    DateTime? ExpiresAt,
    int RateLimitPerMin
);
