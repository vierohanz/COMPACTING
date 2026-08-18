using System.IO;
using System.Text;
using System.Text.Json;
using Compacting.Api.Db;
using Compacting.Api.Middleware;
using Compacting.Api.Modules.Analytics;
using Compacting.Api.Modules.ApiKeys;
using Compacting.Api.Modules.Auth;
using Compacting.Api.Modules.Compression;
using Compacting.Api.Modules.Storage;
using Compacting.Api.Utils;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using StackExchange.Redis;

namespace Compacting.Api;

public static class AppSetup
{
    public static IServiceCollection AddAppServices(
        this IServiceCollection services,
        IConfiguration configuration,
        IHostEnvironment environment
    )
    {
        var postgresConnection =
            configuration.GetConnectionString("DefaultConnection")
            ?? "Host=104.234.26.22;Port=54321;Database=compacting;Username=postgres;Password=nEU2V4RZFAaLh05zTwhe;Include Error Detail=true;";

        services.AddDbContext<AppDbContext>(options => options.UseNpgsql(postgresConnection));

        string dragonflyEndpoint =
            configuration["Dragonfly:Endpoint"] ?? "dragonfly.raishannan.com:6379";
        string dragonflyPassword =
            configuration["Dragonfly:Password"] ?? "blh8vul2ktrq9lqgvfannbjz0inyw0pi";
        string dragonflyPrefix = configuration["Dragonfly:KeyPrefix"] ?? "compacting";

        try
        {
            var redisOptions = new ConfigurationOptions
            {
                EndPoints = { dragonflyEndpoint },
                Password = dragonflyPassword,
                AbortOnConnectFail = false,
                ConnectTimeout = 5000,
                SyncTimeout = 5000,
            };
            IConnectionMultiplexer redisMultiplexer = ConnectionMultiplexer.Connect(redisOptions);
            services.AddSingleton(redisMultiplexer);
            services.AddSingleton<ICacheService>(
                new DragonflyCacheService(redisMultiplexer, dragonflyPrefix)
            );
        }
        catch
        {
            services.AddSingleton<ICacheService>(new DragonflyCacheService(null, dragonflyPrefix));
        }

        string jwtSecret =
            configuration["Jwt:Secret"]
            ?? "c0mp4ct1ng_sup3r_s3cur3_jwt_s3cr3t_k3y_2026_x99_m4x_pr0t0c0l!";
        string jwtIssuer = configuration["Jwt:Issuer"] ?? "CompactingApi";
        string jwtAudience = configuration["Jwt:Audience"] ?? "CompactingClients";
        byte[] keyBytes = Encoding.UTF8.GetBytes(jwtSecret);

        services
            .AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = false;
                options.SaveToken = true;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
                    ValidateIssuer = true,
                    ValidIssuer = jwtIssuer,
                    ValidateAudience = true,
                    ValidAudience = jwtAudience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero,
                };
            });

        services.AddAuthorization();

        services.AddAuthModule();
        services.AddCompressionModule();
        services.AddApiKeyModule();
        services.AddAnalyticsModule();
        services.AddStorageModule();

        services
            .AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
                options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
            });

        services.AddCors(options =>
        {
            options.AddPolicy(
                "AllowAll",
                policy =>
                {
                    policy
                        .SetIsOriginAllowed(_ => true)
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials()
                        .WithExposedHeaders(
                            "X-Original-Size",
                            "X-Compressed-Size",
                            "X-Bytes-Saved",
                            "X-Compression-Ratio",
                            "X-Duration-Ms"
                        );
                }
            );
        });

        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc(
                "v1",
                new OpenApiInfo
                {
                    Title = "COMPACTING - Self-Hosted Image Compression SaaS API",
                    Version = "v1",
                    Description =
                        "High-performance modular REST API for Image Compression, WebP/AVIF conversions, and External Web Integrations.",
                }
            );

            c.AddSecurityDefinition(
                "Bearer",
                new OpenApiSecurityScheme
                {
                    Description =
                        "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.Http,
                    Scheme = "Bearer",
                    BearerFormat = "JWT",
                }
            );

            c.AddSecurityDefinition(
                "ApiKey",
                new OpenApiSecurityScheme
                {
                    Description = "External API Key authorization using 'X-API-Key' header.",
                    Name = "X-API-Key",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "ApiKeyScheme",
                }
            );

            c.AddSecurityRequirement(
                new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer",
                            },
                        },
                        new List<string>()
                    },
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "ApiKey",
                            },
                        },
                        new List<string>()
                    },
                }
            );
        });

        return services;
    }

    public static WebApplication UseAppMiddleware(this WebApplication app)
    {
        try
        {
            using var scope = app.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            // Drop old legacy PascalCase tables if exist
            string dropOldSql =
                @"
                DROP TABLE IF EXISTS ""CompressionLogs"", ""ApiKeys"", ""RefreshTokens"", ""Users"" CASCADE;
            ";
            db.Database.ExecuteSqlRaw(dropOldSql);

            // Ensure modern snake_case schema exists
            string createSnakeCaseSql =
                @"
                CREATE TABLE IF NOT EXISTS users (
                    id UUID PRIMARY KEY,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    password_hash TEXT NOT NULL,
                    full_name VARCHAR(255) NOT NULL,
                    role VARCHAR(50) NOT NULL DEFAULT 'Admin',
                    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS refresh_tokens (
                    id UUID PRIMARY KEY,
                    user_id UUID NOT NULL,
                    token_hash TEXT NOT NULL UNIQUE,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMPTZ NOT NULL,
                    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
                    revoked_at TIMESTAMPTZ,
                    replaced_by_token_hash TEXT,
                    created_by_ip VARCHAR(100),
                    revoked_by_ip VARCHAR(100)
                );
                CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens (user_id);
                CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens (expires_at);

                CREATE TABLE IF NOT EXISTS api_keys (
                    id UUID PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    key_prefix VARCHAR(50) NOT NULL,
                    key_hash TEXT NOT NULL,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMPTZ,
                    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
                    rate_limit_per_min INT NOT NULL DEFAULT 120,
                    total_requests BIGINT NOT NULL DEFAULT 0,
                    total_bytes_saved BIGINT NOT NULL DEFAULT 0
                );
                CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys (key_prefix);
                CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys (key_hash);

                CREATE TABLE IF NOT EXISTS compression_logs (
                    id UUID PRIMARY KEY,
                    user_id UUID,
                    api_key_id UUID,
                    original_file_name VARCHAR(500) NOT NULL,
                    source_format VARCHAR(20) NOT NULL,
                    target_format VARCHAR(20) NOT NULL,
                    original_size_bytes BIGINT NOT NULL,
                    compressed_size_bytes BIGINT NOT NULL,
                    bytes_saved BIGINT NOT NULL,
                    compression_ratio_percent DOUBLE PRECISION NOT NULL,
                    duration_ms INT NOT NULL,
                    width INT NOT NULL,
                    height INT NOT NULL,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    client_ip VARCHAR(100)
                );
                CREATE INDEX IF NOT EXISTS idx_compression_logs_created_at ON compression_logs (created_at DESC);
                CREATE INDEX IF NOT EXISTS idx_compression_logs_api_key_id ON compression_logs (api_key_id);
            ";
            db.Database.ExecuteSqlRaw(createSnakeCaseSql);

            try
            {
                db.Database.ExecuteSqlRaw("ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS user_id UUID;");
                db.Database.ExecuteSqlRaw("CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys (user_id);");
                db.Database.ExecuteSqlRaw("ALTER TABLE compression_logs ADD COLUMN IF NOT EXISTS user_id UUID;");
                db.Database.ExecuteSqlRaw("CREATE INDEX IF NOT EXISTS idx_compression_logs_user_id ON compression_logs (user_id);");
            }
            catch (Exception ex)
            {
                Log.Warn($"User isolation column check: {ex.Message}");
            }

            Log.Success("Database schema migrated to snake_case with user isolation successfully.");
        }
        catch (Exception ex)
        {
            Log.Warn($"Database initialization notice: {ex.Message}");
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
        app.UseDefaultFiles();
        app.UseStaticFiles();
        app.UseMiddleware<ApiKeyAuthMiddleware>();
        app.UseAuthentication();
        app.UseAuthorization();

        return app;
    }
}
