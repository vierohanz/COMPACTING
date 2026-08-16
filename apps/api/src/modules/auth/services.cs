using Compacting.Api.Db;
using Compacting.Api.Utils;
using Microsoft.EntityFrameworkCore;

namespace Compacting.Api.Modules.Auth;

public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
    Task<AuthResponseDto> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);
    Task<AuthUserDto?> GetProfileAsync(Guid userId, CancellationToken cancellationToken = default);
}

public class AuthService : IAuthService
{
    private readonly AppDbContext _dbContext;
    private readonly ILogger<AuthService> _logger;

    public AuthService(AppDbContext dbContext, ILogger<AuthService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        string email = request.Email.Trim().ToLowerInvariant();
        string passwordHash = SecurityUtil.HashSha256(request.Password);

        var user = await _dbContext.Users
            .FirstOrDefaultAsync(u => u.Email == email && u.PasswordHash == passwordHash, cancellationToken);

        if (user == null)
        {
            return new AuthResponseDto(
                Success: false,
                Token: string.Empty,
                User: null!,
                Message: "Invalid email or password."
            );
        }

        var userDto = new AuthUserDto(user.Id, user.Email, user.FullName, user.Role, user.CreatedAt);
        string token = $"cmp_session_{Convert.ToHexString(Guid.NewGuid().ToByteArray()).ToLowerInvariant()}";

        return new AuthResponseDto(
            Success: true,
            Token: token,
            User: userDto,
            Message: "Login successful."
        );
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        string email = request.Email.Trim().ToLowerInvariant();

        bool exists = await _dbContext.Users.AnyAsync(u => u.Email == email, cancellationToken);
        if (exists)
        {
            return new AuthResponseDto(
                Success: false,
                Token: string.Empty,
                User: null!,
                Message: "Email address is already registered."
            );
        }

        var user = new UserEntity
        {
            Email = email,
            FullName = request.FullName.Trim(),
            PasswordHash = SecurityUtil.HashSha256(request.Password),
            Role = "Admin",
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var userDto = new AuthUserDto(user.Id, user.Email, user.FullName, user.Role, user.CreatedAt);
        string token = $"cmp_session_{Convert.ToHexString(Guid.NewGuid().ToByteArray()).ToLowerInvariant()}";

        return new AuthResponseDto(
            Success: true,
            Token: token,
            User: userDto,
            Message: "User registered successfully."
        );
    }

    public async Task<AuthUserDto?> GetProfileAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users.FindAsync(new object[] { userId }, cancellationToken);
        if (user == null) return null;

        return new AuthUserDto(user.Id, user.Email, user.FullName, user.Role, user.CreatedAt);
    }
}
