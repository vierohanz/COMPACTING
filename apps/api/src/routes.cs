using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Compacting.Api;

public static class Routes
{
    public static IEndpointRouteBuilder MapApiRoutes(this IEndpointRouteBuilder app)
    {
        app.MapGet(
            "/api/version",
            () =>
                Results.Ok(
                    new
                    {
                        name = "COMPACTING",
                        version = "1.0.0",
                        engine = "ASP.NET Core 8 & ImageSharp",
                    }
                )
        );

        app.MapGet("/api/healthz", () => Results.Ok(new { status = "ok" }));
        app.MapGet("/healthz", () => Results.Ok(new { status = "ok" }));

        app.MapControllers();

        // Serve Angular SPA Fallback for client-side routing
        app.MapFallbackToFile("index.html");

        return app;
    }
}
