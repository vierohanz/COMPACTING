using System;
using Microsoft.EntityFrameworkCore;

namespace Compacting.Api.Db;

public class UserEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = "Admin";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class ApiKeyEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string KeyPrefix { get; set; } = string.Empty; // e.g. "cmp_live_abc123"
    public string KeyHash { get; set; } = string.Empty;   // SHA256 hashed secret key
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiresAt { get; set; }
    public bool IsRevoked { get; set; } = false;
    public int RateLimitPerMin { get; set; } = 120;
    public long TotalRequests { get; set; } = 0;
    public long TotalBytesSaved { get; set; } = 0;
}

public class CompressionLogEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? ApiKeyId { get; set; }
    public string OriginalFileName { get; set; } = string.Empty;
    public string SourceFormat { get; set; } = string.Empty;
    public string TargetFormat { get; set; } = string.Empty;
    public long OriginalSizeBytes { get; set; }
    public long CompressedSizeBytes { get; set; }
    public long BytesSaved { get; set; }
    public double CompressionRatioPercent { get; set; }
    public int DurationMs { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? ClientIp { get; set; }
}

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<UserEntity> Users => Set<UserEntity>();
    public DbSet<ApiKeyEntity> ApiKeys => Set<ApiKeyEntity>();
    public DbSet<CompressionLogEntity> CompressionLogs => Set<CompressionLogEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<UserEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
        });

        modelBuilder.Entity<ApiKeyEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.KeyHash);
            entity.HasIndex(e => e.KeyPrefix);
        });

        modelBuilder.Entity<CompressionLogEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.CreatedAt);
            entity.HasIndex(e => e.ApiKeyId);
        });
    }
}
