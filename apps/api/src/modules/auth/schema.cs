using System.ComponentModel.DataAnnotations;

namespace Compacting.Api.Modules.Auth;

public class LoginRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public class RegisterRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, StringLength(100, MinimumLength = 6)]
    public string Password { get; set; } = string.Empty;

    [Required]
    public string FullName { get; set; } = string.Empty;
}

public record AuthUserDto(
    Guid Id,
    string Email,
    string FullName,
    string Role,
    DateTime CreatedAt
);

public record AuthResponseDto(
    bool Success,
    string Token,
    AuthUserDto User,
    string? Message = null
);
