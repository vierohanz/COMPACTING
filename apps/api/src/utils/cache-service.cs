using System.Text.Json;
using StackExchange.Redis;

namespace Compacting.Api.Utils;

public interface ICacheService
{
    Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default);
    Task SetAsync<T>(
        string key,
        T value,
        TimeSpan? expiry = null,
        CancellationToken cancellationToken = default
    );
    Task<bool> RemoveAsync(string key, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(string key, CancellationToken cancellationToken = default);
    Task<long> IncrementAsync(
        string key,
        long value = 1,
        TimeSpan? expiry = null,
        CancellationToken cancellationToken = default
    );
}

public class DragonflyCacheService : ICacheService
{
    private readonly IConnectionMultiplexer? _redis;
    private readonly string _prefix;
    private readonly JsonSerializerOptions _jsonOptions;

    public DragonflyCacheService(IConnectionMultiplexer? redis, string prefix = "compacting")
    {
        _redis = redis;
        _prefix = string.IsNullOrWhiteSpace(prefix) ? "compacting" : prefix.TrimEnd(':');
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        };
    }

    private string BuildKey(string key) => $"{_prefix}:{key}";

    private IDatabase? GetDatabase()
    {
        if (_redis == null || !_redis.IsConnected)
            return null;
        return _redis.GetDatabase();
    }

    public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            var db = GetDatabase();
            if (db == null)
                return default;

            var fullKey = BuildKey(key);
            var value = await db.StringGetAsync(fullKey);

            if (value.IsNullOrEmpty)
                return default;
            return JsonSerializer.Deserialize<T>(value.ToString(), _jsonOptions);
        }
        catch
        {
            return default;
        }
    }

    public async Task SetAsync<T>(
        string key,
        T value,
        TimeSpan? expiry = null,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var db = GetDatabase();
            if (db == null)
                return;

            var fullKey = BuildKey(key);
            var payload = JsonSerializer.Serialize(value, _jsonOptions);
            await db.StringSetAsync(fullKey, payload, expiry);
        }
        catch { }
    }

    public async Task<bool> RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            var db = GetDatabase();
            if (db == null)
                return false;

            var fullKey = BuildKey(key);
            return await db.KeyDeleteAsync(fullKey);
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> ExistsAsync(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            var db = GetDatabase();
            if (db == null)
                return false;

            var fullKey = BuildKey(key);
            return await db.KeyExistsAsync(fullKey);
        }
        catch
        {
            return false;
        }
    }

    public async Task<long> IncrementAsync(
        string key,
        long value = 1,
        TimeSpan? expiry = null,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var db = GetDatabase();
            if (db == null)
                return 0;

            var fullKey = BuildKey(key);
            long newValue = await db.StringIncrementAsync(fullKey, value);
            if (expiry.HasValue && newValue == value)
            {
                await db.KeyExpireAsync(fullKey, expiry.Value);
            }
            return newValue;
        }
        catch
        {
            return 0;
        }
    }
}
