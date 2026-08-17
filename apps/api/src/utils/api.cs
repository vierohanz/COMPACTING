using System.Text.Json.Serialization;

namespace Compacting.Api.Utils;

public record ApiResponse<T>
{
    [JsonPropertyName("success")]
    public bool Success { get; init; }

    [JsonPropertyName("message")]
    public string Message { get; init; } = string.Empty;

    [JsonPropertyName("metadata")]
    public object Metadata { get; init; } = new();

    [JsonPropertyName("data")]
    public T? Data { get; init; }

    public static ApiResponse<T> Ok(
        T data,
        string message = "Request processed successfully.",
        object? metadata = null
    )
    {
        return new ApiResponse<T>
        {
            Success = true,
            Message = message,
            Metadata = metadata ?? new(),
            Data = data,
        };
    }

    public static ApiResponse<T> Fail(string message, object? metadata = null)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Message = message,
            Metadata = metadata ?? new(),
            Data = default,
        };
    }
}

public static class ApiResponse
{
    public static ApiResponse<object> Message(
        string message = "Request processed successfully.",
        object? metadata = null
    )
    {
        return new ApiResponse<object>
        {
            Success = true,
            Message = message,
            Metadata = metadata ?? new(),
            Data = new(),
        };
    }

    public static ApiResponse<T> Ok<T>(
        T data,
        string message = "Request processed successfully.",
        object? metadata = null
    )
    {
        return ApiResponse<T>.Ok(data, message, metadata);
    }

    public static ApiResponse<object> Fail(string message, object? metadata = null)
    {
        return ApiResponse<object>.Fail(message, metadata);
    }
}
