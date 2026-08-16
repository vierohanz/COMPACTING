using System.Security.Cryptography;
using System.Text;

namespace Compacting.Api.Utils;

public static class SecurityUtil
{
    public static string HashSha256(string input)
    {
        if (string.IsNullOrEmpty(input)) return string.Empty;
        byte[] bytes = SHA256.HashData(Encoding.UTF8.GetBytes(input.Trim()));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }

    public static (string RawKey, string KeyPrefix, string KeyHash) GenerateApiKey()
    {
        byte[] randomBytes = RandomNumberGenerator.GetBytes(24);
        string keySecret = Convert.ToHexString(randomBytes).ToLowerInvariant();
        string rawApiKey = $"cmp_live_{keySecret}";
        string keyPrefix = rawApiKey[..15] + "...";
        string keyHash = HashSha256(rawApiKey);

        return (rawApiKey, keyPrefix, keyHash);
    }
}
