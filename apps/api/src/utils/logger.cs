using System;
using System.Diagnostics;
using System.Text.Json;

namespace Compacting.Api.Utils;

public static class Log
{
    private const string Reset = "\x1b[0m";
    private const string Dim = "\x1b[2m";
    private const string Cyan = "\x1b[36m";
    private const string Green = "\x1b[32m";
    private const string Yellow = "\x1b[33m";
    private const string Red = "\x1b[31m";
    private const string Magenta = "\x1b[35m";
    private const string Gray = "\x1b[90m";

    private static string TimeStamp() => DateTime.UtcNow.ToString("HH:mm:ss.fff");

    public static void Info(string message, object? context = null)
    {
        Write("INFO", Cyan, message, context);
    }

    public static void Success(string message, object? context = null)
    {
        Write("SUCCESS", Green, message, context);
    }

    public static void Warn(string message, object? context = null)
    {
        Write("WARN", Yellow, message, context);
    }

    public static void Error(string message, Exception? ex = null, object? context = null)
    {
        var msg = ex != null ? $"{message} -> {ex.GetType().Name}: {ex.Message}" : message;
        Write("ERROR", Red, msg, context);
        if (ex?.StackTrace != null)
        {
            Console.WriteLine($"{Dim}{ex.StackTrace}{Reset}");
        }
    }

    public static void Debug(string message, object? context = null)
    {
        Write("DEBUG", Gray, message, context);
    }

    public static void Http(string method, string path, int statusCode, long durationMs, string? clientIp = null)
    {
        string statusColor = statusCode switch
        {
            >= 200 and < 300 => Green,
            >= 300 and < 400 => Cyan,
            >= 400 and < 500 => Yellow,
            _ => Red
        };

        string ipPart = !string.IsNullOrEmpty(clientIp) ? $"{Dim}[{clientIp}]{Reset} " : "";
        Console.WriteLine(
            $"{Dim}[{TimeStamp()}]{Reset} {Magenta}[HTTP]{Reset} {ipPart}{method} {path} {statusColor}{statusCode}{Reset} {Dim}({durationMs}ms){Reset}"
        );
    }

    private static void Write(string level, string color, string message, object? context)
    {
        string contextStr = "";
        if (context != null)
        {
            try
            {
                contextStr = $" {Dim}{JsonSerializer.Serialize(context)}{Reset}";
            }
            catch
            {
                contextStr = $" {Dim}{context}{Reset}";
            }
        }

        Console.WriteLine(
            $"{Dim}[{TimeStamp()}]{Reset} {color}[{level}]{Reset} {message}{contextStr}"
        );
    }
}

public class HttpLoggerMiddleware
{
    private readonly RequestDelegate _next;

    public HttpLoggerMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Path.StartsWithSegments("/swagger") && context.Request.Path.Value?.EndsWith(".json") == false)
        {
            await _next(context);
            return;
        }

        var sw = Stopwatch.StartNew();
        try
        {
            await _next(context);
        }
        finally
        {
            sw.Stop();
            var clientIp = context.Connection.RemoteIpAddress?.ToString();
            Log.Http(
                context.Request.Method,
                context.Request.Path + context.Request.QueryString,
                context.Response.StatusCode,
                sw.ElapsedMilliseconds,
                clientIp
            );
        }
    }
}
