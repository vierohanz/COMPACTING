using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Compacting.Api.Db;
using Compacting.Api.Utils;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Compacting.Api.Modules.Auth;

public record AuthExecutionResult(
    bool Success,
    string Message,
    AuthDataDto? Data = null,
    string? RawRefreshToken = null
);

public interface IAuthService
{
    Task<AuthExecutionResult> LoginAsync(
        LoginRequest request,
        string? ipAddress,
        CancellationToken cancellationToken = default
    );
    Task<AuthExecutionResult> RegisterAsync(
        RegisterRequest request,
        string? ipAddress,
        CancellationToken cancellationToken = default
    );
    Task<AuthExecutionResult> RefreshTokenAsync(
        string rawRefreshToken,
        string? ipAddress,
        CancellationToken cancellationToken = default
    );
    Task<bool> RevokeTokenAsync(
        string rawRefreshToken,
        string? ipAddress,
        CancellationToken cancellationToken = default
    );
    Task<AuthUserDto?> GetProfileAsync(Guid userId, CancellationToken cancellationToken = default);
}

public class AuthService : IAuthService
{
    private readonly AppDbContext _dbContext;
    private readonly IConfiguration _configuration;
    private readonly ICacheService _cache;
    private readonly byte[] _jwtKey;
    private readonly string _issuer;
    private readonly string _audience;
    private readonly int _accessTokenLifetimeMinutes;
    private readonly int _refreshTokenLifetimeDays;

    public AuthService(AppDbContext dbContext, IConfiguration configuration, ICacheService cache)
    {
        _dbContext = dbContext;
        _configuration = configuration;
        _cache = cache;

        string secret =
            _configuration["Jwt:Secret"]
            ?? "c0mp4ct1ng_sup3r_s3cur3_jwt_s3cr3t_k3y_2026_x99_m4x_pr0t0c0l!";
        _jwtKey = Encoding.UTF8.GetBytes(secret);
        _issuer = _configuration["Jwt:Issuer"] ?? "CompactingApi";
        _audience = _configuration["Jwt:Audience"] ?? "CompactingClients";
        _accessTokenLifetimeMinutes = int.TryParse(
            _configuration["Jwt:AccessTokenExpirationMinutes"],
            out int atExp
        )
            ? atExp
            : 15;
        _refreshTokenLifetimeDays = int.TryParse(
            _configuration["Jwt:RefreshTokenExpirationDays"],
            out int rtExp
        )
            ? rtExp
            : 90;
    }

    public async Task<AuthExecutionResult> LoginAsync(
        LoginRequest request,
        string? ipAddress,
        CancellationToken cancellationToken = default
    )
    {
        string email = request.Email.Trim().ToLowerInvariant();
        string passwordHash = SecurityUtil.HashSha256(request.Password);

        var user = await _dbContext.Users.FirstOrDefaultAsync(
            u => u.Email == email && u.PasswordHash == passwordHash,
            cancellationToken
        );

        if (user == null)
        {
            return new AuthExecutionResult(Success: false, Message: "Invalid email or password.");
        }

        var (accessToken, rawRefreshToken) = await GenerateTokensForUserAsync(
            user,
            ipAddress,
            cancellationToken
        );
        var userDto = new AuthUserDto(
            user.Id,
            user.Email,
            user.FullName,
            user.Role,
            user.CreatedAt
        );

        await _cache.SetAsync(
            $"user:profile:{user.Id}",
            userDto,
            TimeSpan.FromMinutes(15),
            cancellationToken
        );

        var authData = new AuthDataDto(
            AccessToken: accessToken,
            ExpiresInSeconds: _accessTokenLifetimeMinutes * 60,
            User: userDto,
            RefreshToken: rawRefreshToken,
            TokenType: "Bearer"
        );

        return new AuthExecutionResult(
            Success: true,
            Message: "Login successful.",
            Data: authData,
            RawRefreshToken: rawRefreshToken
        );
    }

    public async Task<AuthExecutionResult> RegisterAsync(
        RegisterRequest request,
        string? ipAddress,
        CancellationToken cancellationToken = default
    )
    {
        string email = request.Email.Trim().ToLowerInvariant();

        bool exists = await _dbContext.Users.AnyAsync(u => u.Email == email, cancellationToken);
        if (exists)
        {
            return new AuthExecutionResult(
                Success: false,
                Message: "Email address is already registered."
            );
        }

        var user = new UserEntity
        {
            Email = email,
            FullName = request.FullName.Trim(),
            PasswordHash = SecurityUtil.HashSha256(request.Password),
            Role = "Admin",
            CreatedAt = DateTime.UtcNow,
        };

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var (accessToken, rawRefreshToken) = await GenerateTokensForUserAsync(
            user,
            ipAddress,
            cancellationToken
        );
        var userDto = new AuthUserDto(
            user.Id,
            user.Email,
            user.FullName,
            user.Role,
            user.CreatedAt
        );

        await _cache.SetAsync(
            $"user:profile:{user.Id}",
            userDto,
            TimeSpan.FromMinutes(15),
            cancellationToken
        );

        var authData = new AuthDataDto(
            AccessToken: accessToken,
            ExpiresInSeconds: _accessTokenLifetimeMinutes * 60,
            User: userDto,
            RefreshToken: rawRefreshToken,
            TokenType: "Bearer"
        );

        return new AuthExecutionResult(
            Success: true,
            Message: "User registered successfully.",
            Data: authData,
            RawRefreshToken: rawRefreshToken
        );
    }

    public async Task<AuthExecutionResult> RefreshTokenAsync(
        string rawRefreshToken,
        string? ipAddress,
        CancellationToken cancellationToken = default
    )
    {
        if (string.IsNullOrWhiteSpace(rawRefreshToken))
        {
            return new AuthExecutionResult(Success: false, Message: "Refresh token is required.");
        }

        string tokenHash = SecurityUtil.HashSha256(rawRefreshToken.Trim());

        var tokenEntity = await _dbContext.RefreshTokens.FirstOrDefaultAsync(
            r => r.TokenHash == tokenHash,
            cancellationToken
        );

        if (tokenEntity == null)
        {
            return new AuthExecutionResult(Success: false, Message: "Invalid refresh token.");
        }

        if (tokenEntity.IsRevoked)
        {
            var activeTokens = await _dbContext
                .RefreshTokens.Where(r => r.UserId == tokenEntity.UserId && !r.IsRevoked)
                .ToListAsync(cancellationToken);

            foreach (var token in activeTokens)
            {
                token.IsRevoked = true;
                token.RevokedAt = DateTime.UtcNow;
                token.RevokedByIp = ipAddress;
            }

            await _dbContext.SaveChangesAsync(cancellationToken);
            await _cache.RemoveAsync($"user:profile:{tokenEntity.UserId}", cancellationToken);

            return new AuthExecutionResult(
                Success: false,
                Message: "Compromised refresh token detected. All active sessions have been revoked for your security."
            );
        }

        if (DateTime.UtcNow >= tokenEntity.ExpiresAt)
        {
            tokenEntity.IsRevoked = true;
            tokenEntity.RevokedAt = DateTime.UtcNow;
            tokenEntity.RevokedByIp = ipAddress;
            await _dbContext.SaveChangesAsync(cancellationToken);

            return new AuthExecutionResult(
                Success: false,
                Message: "Refresh token has expired. Please log in again."
            );
        }

        var user = await _dbContext.Users.FindAsync(
            new object[] { tokenEntity.UserId },
            cancellationToken
        );
        if (user == null)
        {
            return new AuthExecutionResult(
                Success: false,
                Message: "Associated user account was not found."
            );
        }

        string newRawRefreshToken = $"cmp_rf_{SecurityUtil.GenerateSecureRandomString(64)}";
        string newTokenHash = SecurityUtil.HashSha256(newRawRefreshToken);

        tokenEntity.IsRevoked = true;
        tokenEntity.RevokedAt = DateTime.UtcNow;
        tokenEntity.RevokedByIp = ipAddress;
        tokenEntity.ReplacedByTokenHash = newTokenHash;

        var newRefreshTokenEntity = new RefreshTokenEntity
        {
            UserId = user.Id,
            TokenHash = newTokenHash,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(_refreshTokenLifetimeDays),
            CreatedByIp = ipAddress,
        };

        _dbContext.RefreshTokens.Add(newRefreshTokenEntity);
        await _dbContext.SaveChangesAsync(cancellationToken);

        string newAccessToken = GenerateAccessToken(user);
        var userDto = new AuthUserDto(
            user.Id,
            user.Email,
            user.FullName,
            user.Role,
            user.CreatedAt
        );

        var authData = new AuthDataDto(
            AccessToken: newAccessToken,
            ExpiresInSeconds: _accessTokenLifetimeMinutes * 60,
            User: userDto,
            RefreshToken: newRawRefreshToken,
            TokenType: "Bearer"
        );

        return new AuthExecutionResult(
            Success: true,
            Message: "Token refreshed successfully.",
            Data: authData,
            RawRefreshToken: newRawRefreshToken
        );
    }

    public async Task<bool> RevokeTokenAsync(
        string rawRefreshToken,
        string? ipAddress,
        CancellationToken cancellationToken = default
    )
    {
        if (string.IsNullOrWhiteSpace(rawRefreshToken))
            return false;

        string tokenHash = SecurityUtil.HashSha256(rawRefreshToken.Trim());
        var tokenEntity = await _dbContext.RefreshTokens.FirstOrDefaultAsync(
            r => r.TokenHash == tokenHash,
            cancellationToken
        );

        if (tokenEntity == null || tokenEntity.IsRevoked)
            return false;

        tokenEntity.IsRevoked = true;
        tokenEntity.RevokedAt = DateTime.UtcNow;
        tokenEntity.RevokedByIp = ipAddress;

        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<AuthUserDto?> GetProfileAsync(
        Guid userId,
        CancellationToken cancellationToken = default
    )
    {
        var cached = await _cache.GetAsync<AuthUserDto>(
            $"user:profile:{userId}",
            cancellationToken
        );
        if (cached != null)
            return cached;

        var user = await _dbContext.Users.FindAsync(new object[] { userId }, cancellationToken);
        if (user == null)
            return null;

        var userDto = new AuthUserDto(
            user.Id,
            user.Email,
            user.FullName,
            user.Role,
            user.CreatedAt
        );
        await _cache.SetAsync(
            $"user:profile:{userId}",
            userDto,
            TimeSpan.FromMinutes(15),
            cancellationToken
        );

        return userDto;
    }

    private async Task<(string AccessToken, string RawRefreshToken)> GenerateTokensForUserAsync(
        UserEntity user,
        string? ipAddress,
        CancellationToken cancellationToken
    )
    {
        string accessToken = GenerateAccessToken(user);

        string rawRefreshToken = $"cmp_rf_{SecurityUtil.GenerateSecureRandomString(64)}";
        string tokenHash = SecurityUtil.HashSha256(rawRefreshToken);

        var refreshTokenEntity = new RefreshTokenEntity
        {
            UserId = user.Id,
            TokenHash = tokenHash,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(_refreshTokenLifetimeDays),
            CreatedByIp = ipAddress,
        };

        _dbContext.RefreshTokens.Add(refreshTokenEntity);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return (accessToken, rawRefreshToken);
    }

    private string GenerateAccessToken(UserEntity user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(
                new[]
                {
                    new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                    new Claim(JwtRegisteredClaimNames.Email, user.Email),
                    new Claim(JwtRegisteredClaimNames.Name, user.FullName),
                    new Claim(ClaimTypes.Role, user.Role),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                }
            ),
            Expires = DateTime.UtcNow.AddMinutes(_accessTokenLifetimeMinutes),
            Issuer = _issuer,
            Audience = _audience,
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(_jwtKey),
                SecurityAlgorithms.HmacSha256Signature
            ),
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
