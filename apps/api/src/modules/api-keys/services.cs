using Compacting.Api.Db;
using Compacting.Api.Utils;
using Microsoft.EntityFrameworkCore;

namespace Compacting.Api.Modules.ApiKeys;

public interface IApiKeyService
{
    Task<List<ApiKeyDto>> GetAllKeysAsync(Guid? userId = null, CancellationToken cancellationToken = default);
    Task<ApiKeyCreatedResponseDto> CreateKeyAsync(
        CreateApiKeyRequest request,
        Guid? userId = null,
        CancellationToken cancellationToken = default
    );
    Task<bool> RevokeKeyAsync(Guid id, Guid? userId = null, CancellationToken cancellationToken = default);
    Task<ApiKeyEntity?> ValidateKeyAsync(
        string rawApiKey,
        CancellationToken cancellationToken = default
    );
}

public class ApiKeyService : IApiKeyService
{
    private readonly AppDbContext _dbContext;
    private readonly ICacheService _cacheService;
    private readonly ILogger<ApiKeyService> _logger;

    public ApiKeyService(
        AppDbContext dbContext,
        ICacheService cacheService,
        ILogger<ApiKeyService> logger
    )
    {
        _dbContext = dbContext;
        _cacheService = cacheService;
        _logger = logger;
    }

    public async Task<List<ApiKeyDto>> GetAllKeysAsync(
        Guid? userId = null,
        CancellationToken cancellationToken = default
    )
    {
        var query = _dbContext.ApiKeys.AsNoTracking();
        if (userId.HasValue)
        {
            query = query.Where(k => k.UserId == userId.Value);
        }

        var keys = await query
            .OrderByDescending(k => k.CreatedAt)
            .Select(k => new ApiKeyDto(
                k.Id,
                k.Name,
                k.KeyPrefix,
                k.CreatedAt,
                k.ExpiresAt,
                k.IsRevoked,
                k.RateLimitPerMin,
                k.TotalRequests,
                k.TotalBytesSaved
            ))
            .ToListAsync(cancellationToken);

        return keys;
    }

    public async Task<ApiKeyCreatedResponseDto> CreateKeyAsync(
        CreateApiKeyRequest request,
        Guid? userId = null,
        CancellationToken cancellationToken = default
    )
    {
        var (rawApiKey, keyPrefix, keyHash) = SecurityUtil.GenerateApiKey();

        DateTime? expiresAt = request.ExpiresInDays.HasValue && request.ExpiresInDays.Value > 0
            ? DateTime.UtcNow.AddDays(request.ExpiresInDays.Value)
            : null;

        var entity = new ApiKeyEntity
        {
            UserId = userId,
            Name = request.Name.Trim(),
            KeyPrefix = keyPrefix,
            KeyHash = keyHash,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = expiresAt,
            RateLimitPerMin = request.RateLimitPerMin,
            IsRevoked = false,
        };

        _dbContext.ApiKeys.Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new ApiKeyCreatedResponseDto(
            entity.Id,
            entity.Name,
            entity.KeyPrefix,
            rawApiKey,
            entity.CreatedAt,
            entity.ExpiresAt,
            entity.RateLimitPerMin
        );
    }

    public async Task<bool> RevokeKeyAsync(Guid id, Guid? userId = null, CancellationToken cancellationToken = default)
    {
        var key = await _dbContext.ApiKeys.FindAsync(new object[] { id }, cancellationToken);
        if (key == null)
            return false;

        if (userId.HasValue && key.UserId.HasValue && key.UserId.Value != userId.Value)
        {
            return false;
        }

        key.IsRevoked = true;
        await _dbContext.SaveChangesAsync(cancellationToken);

        await _cacheService.RemoveAsync($"apikey:hash:{key.KeyHash}", cancellationToken);

        return true;
    }

    public async Task<ApiKeyEntity?> ValidateKeyAsync(
        string rawApiKey,
        CancellationToken cancellationToken = default
    )
    {
        if (string.IsNullOrWhiteSpace(rawApiKey))
            return null;

        string keyHash = SecurityUtil.HashSha256(rawApiKey.Trim());
        string cacheKey = $"apikey:hash:{keyHash}";

        var cached = await _cacheService.GetAsync<ApiKeyEntity>(cacheKey, cancellationToken);
        if (cached != null)
        {
            if (cached.ExpiresAt.HasValue && cached.ExpiresAt.Value < DateTime.UtcNow)
            {
                await _cacheService.RemoveAsync(cacheKey, cancellationToken);
                return null;
            }
            return cached;
        }

        var key = await _dbContext
            .ApiKeys.AsNoTracking()
            .FirstOrDefaultAsync(k => k.KeyHash == keyHash && !k.IsRevoked, cancellationToken);

        if (key == null)
            return null;

        if (key.ExpiresAt.HasValue && key.ExpiresAt.Value < DateTime.UtcNow)
        {
            return null;
        }

        await _cacheService.SetAsync(cacheKey, key, TimeSpan.FromMinutes(10), cancellationToken);

        return key;
    }
}
