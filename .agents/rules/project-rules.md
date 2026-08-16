# COMPACTING - Project Rules & Guidelines

## 1. Project Overview & Architecture
**COMPACTING** is a high-performance self-hosted SaaS for Image Compression & Format Conversion. It serves as both a standalone web application and an API Gateway for external web applications.

### Directory Structure:
- `apps/api`: Backend ASP.NET Core 8 Web API (C#) using NuGet.
- `apps/web`: Frontend Angular SPA using **Bun**.
- `.agents/`: Agent customizations, rules, and UI/UX Pro Max skills.

---

## 2. Coding Style & Formatting Rules
- **No Comments**: Do not write comments in source code, configs, or templates. Code should be clean, readable, and self-documenting.
- **No Emojis**: Do not use emojis anywhere in the codebase (no emojis in code, console logs, UI buttons, headers, or text). Use clean SVG icons or text labels instead.
- **Kebab-Case**: All directory names and file names must use **kebab-case**.
- **Linting & Formatting**: Follow `oxlint` and `prettier` rules.

---

## 3. Backend (`apps/api/src/`) Modular Architecture
Every feature module inside `apps/api/src/modules/<feature-name>/` must follow the 4-file structure:
- `controller.cs`
- `services.cs`
- `schema.cs`
- `index.cs`

Core services live in:
- `src/db/app-db-context.cs`
- `src/middleware/api-key-auth-middleware.cs`, `src/middleware/global-exception-middleware.cs`
- `src/utils/logger.cs`, `src/utils/security-util.cs`

---

## 4. Frontend (`apps/web/`) Angular & Bun
- Use Angular Standalone components with signals.
- Package management & execution via **Bun** (`bun install`, `bun start`, `bun build`).
- UI styling must follow **UI/UX Pro Max** standards without emojis.
