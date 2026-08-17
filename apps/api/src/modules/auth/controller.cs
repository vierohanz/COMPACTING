using System.Security.Claims;
using Compacting.Api.Utils;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Compacting.Api.Modules.Auth;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(ApiResponse<AuthDataDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken
    )
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse.Fail("Validation failed."));
        }

        string? ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var result = await _authService.LoginAsync(request, ipAddress, cancellationToken);
        if (!result.Success || result.Data == null)
        {
            return Unauthorized(ApiResponse.Fail(result.Message));
        }

        if (!string.IsNullOrEmpty(result.RawRefreshToken))
        {
            SetRefreshTokenCookie(result.RawRefreshToken);
        }

        return Ok(ApiResponse<AuthDataDto>.Ok(result.Data, result.Message));
    }

    [HttpPost("register")]
    [ProducesResponseType(typeof(ApiResponse<AuthDataDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register(
        [FromBody] RegisterRequest request,
        CancellationToken cancellationToken
    )
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse.Fail("Validation failed."));
        }

        string? ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var result = await _authService.RegisterAsync(request, ipAddress, cancellationToken);
        if (!result.Success || result.Data == null)
        {
            return BadRequest(ApiResponse.Fail(result.Message));
        }

        if (!string.IsNullOrEmpty(result.RawRefreshToken))
        {
            SetRefreshTokenCookie(result.RawRefreshToken);
        }

        return StatusCode(
            StatusCodes.Status201Created,
            ApiResponse<AuthDataDto>.Ok(result.Data, result.Message)
        );
    }

    [HttpPost("refresh")]
    [ProducesResponseType(typeof(ApiResponse<AuthDataDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> RefreshToken(
        [FromBody] RefreshTokenRequest? request,
        CancellationToken cancellationToken
    )
    {
        string? rawRefreshToken = Request.Cookies["refreshToken"] ?? request?.RefreshToken;
        if (string.IsNullOrWhiteSpace(rawRefreshToken))
        {
            return Unauthorized(ApiResponse.Fail("No refresh token provided."));
        }

        string? ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var result = await _authService.RefreshTokenAsync(
            rawRefreshToken,
            ipAddress,
            cancellationToken
        );
        if (!result.Success || result.Data == null)
        {
            DeleteRefreshTokenCookie();
            return Unauthorized(ApiResponse.Fail(result.Message));
        }

        if (!string.IsNullOrEmpty(result.RawRefreshToken))
        {
            SetRefreshTokenCookie(result.RawRefreshToken);
        }

        return Ok(ApiResponse<AuthDataDto>.Ok(result.Data, result.Message));
    }

    [HttpPost("revoke")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> RevokeToken(
        [FromBody] RefreshTokenRequest? request,
        CancellationToken cancellationToken
    )
    {
        string? rawRefreshToken = Request.Cookies["refreshToken"] ?? request?.RefreshToken;
        if (!string.IsNullOrWhiteSpace(rawRefreshToken))
        {
            string? ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            await _authService.RevokeTokenAsync(rawRefreshToken, ipAddress, cancellationToken);
        }

        DeleteRefreshTokenCookie();
        return Ok(ApiResponse.Message("Logged out and refresh token revoked successfully."));
    }

    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [HttpGet("me")]
    [ProducesResponseType(typeof(ApiResponse<AuthUserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCurrentUser(CancellationToken cancellationToken)
    {
        string? userIdClaim =
            User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(ApiResponse.Fail("Unauthorized token claims."));
        }

        var profile = await _authService.GetProfileAsync(userId, cancellationToken);
        if (profile == null)
        {
            return NotFound(ApiResponse.Fail("User profile not found."));
        }

        return Ok(ApiResponse<AuthUserDto>.Ok(profile, "User profile retrieved successfully."));
    }

    private void SetRefreshTokenCookie(string refreshToken)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Lax,
            Expires = DateTime.UtcNow.AddDays(90),
            Path = "/",
        };
        Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
    }

    private void DeleteRefreshTokenCookie()
    {
        Response.Cookies.Delete(
            "refreshToken",
            new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Lax,
                Path = "/",
            }
        );
    }
}
