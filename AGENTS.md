# COMPACTING - Self-Hosted Image Compression SaaS

## Architecture & Code Standards

- **Backend API**: ASP.NET Core 8 (`apps/api/src`) with Modular structure (`modules/<feature>/{controller.cs, services.cs, schema.cs, index.cs}`). NuGet package manager.
- **Frontend SPA**: Angular 19 Standalone (`apps/web`) with **Bun** package manager.
- **Design Intelligence**: Governed by the **UI/UX Pro Max** skill located in `.agents/skills/ui-ux-pro-max/`.
- **Naming Conventions**: All directories and filenames must strictly use **kebab-case**.
- **Code Quality**: Enforce `oxlint` and `prettier` across the monorepo.

## Coding Style Rules

1. **No Comments**: Write self-explanatory, clean code without unnecessary inline, header, or block comments.
2. **No Emojis**: Do not use emojis in code, console logs, comments, or UI components. Use proper SVG icons or text labels.

## Key Capabilities

- High-efficiency Image Compression (WebP, AVIF, JPEG, PNG, GIF).
- API Gateway for external apps (`X-API-Key` authentication).
- Real-time Analytics & Bandwidth Savings metrics.
- Modern Developer Playground & Integration Code Generator.
