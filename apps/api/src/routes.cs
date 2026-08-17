using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Compacting.Api;

public static class Routes
{
    public static IEndpointRouteBuilder MapApiRoutes(this IEndpointRouteBuilder app)
    {
        app.MapGet(
            "/",
            () =>
                Results.Ok(
                    new
                    {
                        service = "COMPACTING Image Compression Engine API",
                        version = "1.0.0",
                        status = "healthy",
                        docs = "/swagger",
                    }
                )
        );

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

        app.MapGet("/healthz", () => Results.Ok(new { status = "ok" }));

        app.MapControllers();

        return app;
    }
}
