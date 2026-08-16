using Microsoft.AspNetCore.Mvc;

namespace Compacting.Api.Modules.ApiKeys;

[ApiController]
[Route("api/v1/apikeys")]
public class ApiKeyController : ControllerBase
{
    private readonly IApiKeyService _apiKeyService;

    public ApiKeyController(IApiKeyService apiKeyService)
    {
        _apiKeyService = apiKeyService;
    }

    /// <summary>
    /// Retrieve all registered API keys.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<ApiKeyDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var keys = await _apiKeyService.GetAllKeysAsync(cancellationToken);
        return Ok(keys);
    }

    /// <summary>
    /// Create a new API Key for external integration.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiKeyCreatedResponseDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateApiKeyRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _apiKeyService.CreateKeyAsync(request, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, result);
    }

    /// <summary>
    /// Revoke an existing API Key.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Revoke(Guid id, CancellationToken cancellationToken)
    {
        bool success = await _apiKeyService.RevokeKeyAsync(id, cancellationToken);
        if (!success)
        {
            return NotFound(new { error = "API key not found." });
        }

        return NoContent();
    }
}
