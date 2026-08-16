using System.IO;
using System.Text.Json;
using Compacting.Api.Db;
using Compacting.Api.Middleware;
using Compacting.Api.Modules.Analytics;
using Compacting.Api.Modules.ApiKeys;
using Compacting.Api.Modules.Auth;
using Compacting.Api.Modules.Compression;
using Compacting.Api.Modules.Storage;
using Compacting.Api.Utils;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;

namespace Compacting.Api;

public static class AppSetup
{
    public static IServiceCollection AddAppServices(this IServiceCollection services, IConfiguration configuration, IHostEnvironment environment)
    {
        var dataDir = Path.Combine(environment.ContentRootPath, "App_Data");
        Directory.CreateDirectory(dataDir);

        var defaultConnectionString = $"Data Source={Path.Combine(dataDir, "compacting.db")}";
        var connectionString = configuration.GetConnectionString("DefaultConnection") ?? defaultConnectionString;

        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlite(connectionString));

        services.AddAuthModule();
        services.AddCompressionModule();
        services.AddApiKeyModule();
        services.AddAnalyticsModule();
        services.AddStorageModule();

        services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
                options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
            });

        services.AddCors(options =>
        {
            options.AddPolicy("AllowAll", policy =>
            {
                policy.AllowAnyOrigin()
                      .AllowAnyMethod()
                      .AllowAnyHeader()
                      .WithExposedHeaders("X-Original-Size", "X-Compressed-Size", "X-Bytes-Saved", "X-Compression-Ratio", "X-Duration-Ms");
            });
        });

        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "COMPACTING - Self-Hosted Image Compression SaaS API",
                Version = "v1",
                Description = "High-performance modular REST API for Image Compression, WebP/AVIF conversions, and External Web Integrations."
            });

            c.AddSecurityDefinition("ApiKey", new OpenApiSecurityScheme
            {
                Description = "Input your API key using 'X-API-Key' header or Bearer token.",
                Name = "X-API-Key",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.ApiKey,
                Scheme = "ApiKeyScheme"
            });

            c.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "ApiKey"
                        },
                        Scheme = "ApiKeyScheme",
                        Name = "X-API-Key",
                        In = ParameterLocation.Header
                    },
                    new List<string>()
                }
            });
        });

        return services;
    }

    public static WebApplication UseAppMiddleware(this WebApplication app)
    {
        using (var scope = app.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            db.Database.EnsureCreated();
        }

        app.UseMiddleware<HttpLoggerMiddleware>();
        app.UseMiddleware<GlobalExceptionMiddleware>();

        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "COMPACTING API v1");
            c.RoutePrefix = "swagger";
        });

        app.UseCors("AllowAll");
        app.UseMiddleware<ApiKeyAuthMiddleware>();
        app.UseAuthorization();

        return app;
    }
}
