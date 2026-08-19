# =========================================================
# COMPACTING - Unified All-in-One Multi-Stage Dockerfile
# Combines Angular 19 SPA (Bun) + ASP.NET Core 8 Web API
# =========================================================

# Stage 1: Build Frontend SPA with Bun
FROM oven/bun:1 AS web-builder
WORKDIR /build/web

COPY apps/web/package.json apps/web/bun.lock* ./
RUN bun install --frozen-lockfile || bun install

COPY apps/web/ .
RUN bun run build

# Stage 2: Build Backend API with .NET 8 SDK
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS api-builder
WORKDIR /build/api

COPY apps/api/api.csproj ./
RUN dotnet restore "api.csproj"

COPY apps/api/ .
RUN dotnet publish "api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 3: Unified Ultra-Lightweight Production Runtime Image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

EXPOSE 80
EXPOSE 8080
EXPOSE 5126
ENV ASPNETCORE_URLS=http://+:80;http://+:8080;http://+:5126
ENV ASPNETCORE_ENVIRONMENT=Production

# Copy published .NET 8 backend binary
COPY --from=api-builder /app/publish .

# Copy Angular 19 SPA bundle directly into ASP.NET wwwroot
COPY --from=web-builder /build/web/dist/web/browser ./wwwroot

ENTRYPOINT ["dotnet", "api.dll"]
