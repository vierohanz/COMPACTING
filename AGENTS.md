# COMPACTING - Self-Hosted Image Compression SaaS

## Architecture & Code Standards

- **Backend API**: ASP.NET Core 8 (`apps/api/src`) with Modular structure (`modules/<feature>/{controller.cs, services.cs, schema.cs, index.cs}`). NuGet package manager.
- **Database & Cache**: PostgreSQL with Entity Framework Core (`Npgsql.EntityFrameworkCore.PostgreSQL`) and Dragonfly distributed in-memory cache (`StackExchange.Redis`).
- **Frontend SPA**: Angular 19 Standalone (`apps/web`) with **Bun** package manager following the **Core-Shared-Features (LIFT)** architecture.
- **Design Intelligence**: Governed by the **UI/UX Pro Max** skill located in `.agents/skills/ui-ux-pro-max/`.
- **Naming Conventions**: All directories and filenames must strictly use **kebab-case**.
- **Code Quality**: Enforce `oxlint` and `prettier` across the monorepo.

## .NET Best Practice Rules

1. **LINQ First**: Always use LINQ (declarative queries with EF Core and in-memory collections) for filtering, transformation, aggregation, and projection instead of imperative loops.
2. **Strict Dependency Injection (DI)**: Register all services, repositories, and cache engines in DI containers (`IServiceCollection`). Inject dependencies via constructor injection using clean interfaces (`IAuthService`, `ICacheService`, etc.). Avoid service locator anti-patterns.
3. **Async / Await Non-Blocking I/O**: Every I/O bound operation (database queries, network requests, cache, image streams) must be fully `async` and accept `CancellationToken`.
4. **C# 12/13 Modern Idioms**: Leverage records, primary constructors, pattern matching, nullable reference types (`enable`), and zero-allocation techniques (`Span<T>`).
5. **Authentication Standards**: Enforce JWT Access Tokens (15m) + Refresh Token Rotation (90d) with token reuse detection and family invalidation.

## Angular Best Practice Rules

1. **Core-Shared-Features (LIFT) Structure**:
   - `core/`: Singleton services, HTTP clients, global store, and configurations.
   - `shared/`: Reusable presentation UI components and TypeScript domain models.
   - `features/`: Feature-specific smart components and routes.
2. **Signals-First Reactivity**: Use Angular Signals (`signal()`, `computed()`) for component and global state management.
3. **Standalone Components**: Do not use `NgModule`. All components must be standalone (`standalone: true`).
4. **Angular Idioms**: Do not use React concepts like "hooks". Use injectable Services, Signal stores, and pure utility functions.

## Coding Style Rules

1. **No Comments**: Write self-explanatory, clean code without unnecessary inline, header, or block comments.
2. **No Emojis**: Do not use emojis in code, console logs, comments, or UI components. Use proper SVG icons or text labels.

## Key Capabilities

- High-efficiency Image Compression (WebP, AVIF, JPEG, PNG, GIF).
- API Gateway for external apps (`X-API-Key` authentication).
- JWT Authentication with Refresh Token Rotation (15m access token / 90d refresh token).
- PostgreSQL data persistence with automated EF Core schema synchronization.
- Dragonfly (Redis) sub-millisecond caching and token tracking.
- Real-time Analytics & Bandwidth Savings metrics.
- Modern Developer Playground & Integration Code Generator.
