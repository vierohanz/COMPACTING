namespace Compacting.Api.Db;

public class ApiKeyEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string KeyPrefix { get; set; } = string.Empty;
    public string KeyHash { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiresAt { get; set; }
    public bool IsRevoked { get; set; } = false;
    public int RateLimitPerMin { get; set; } = 120;
    public long TotalRequests { get; set; } = 0;
    public long TotalBytesSaved { get; set; } = 0;
}
