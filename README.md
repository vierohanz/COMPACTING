# COMPACTING - Self-Hosted Image Compression SaaS

> High-performance image compression engine and REST API gateway built with **ASP.NET Core 8** and **Angular 19** (managed by **Bun**).

---

## 🏗️ Architecture Overview

```text
COMPACTING/
├── .agents/
│   ├── rules/
│   │   └── project-rules.md
│   └── skills/
│       └── ui-ux-pro-max/          # Official UI/UX Pro Max Skill Suite
├── apps/
│   ├── api/                        # ASP.NET Core 8 Web API
│   │   ├── src/
│   │   │   ├── db/
│   │   │   │   └── app-db-context.cs
│   │   │   ├── middleware/
│   │   │   │   ├── api-key-auth-middleware.cs
│   │   │   │   └── global-exception-middleware.cs
│   │   │   ├── modules/
│   │   │   │   ├── analytics/      # controller.cs, services.cs, schema.cs, index.cs
│   │   │   │   ├── api-keys/       # controller.cs, services.cs, schema.cs, index.cs
│   │   │   │   ├── auth/           # controller.cs, services.cs, schema.cs, index.cs
│   │   │   │   ├── compression/    # controller.cs, services.cs, schema.cs, index.cs
│   │   │   │   └── storage/        # services.cs, schema.cs, index.cs
│   │   │   └── utils/
│   │   │       └── security-util.cs
│   │   ├── Program.cs
│   │   ├── api.csproj
│   │   ├── .oxlintrc.json
│   │   └── .prettierrc
│   └── web/                        # Angular 19 SPA (Bun)
│       ├── src/
│       │   ├── app/
│       │   │   ├── core/services/api.service.ts
│       │   │   ├── app.component.ts
│       │   │   ├── app.component.html
│       │   │   └── app.component.css
│       │   └── styles.css
│       ├── .oxlintrc.json
│       └── .prettierrc
├── .oxlintrc.json
├── .prettierrc
├── package.json
└── AGENTS.md
```

---

## 🚀 Quick Start

### 1. Install Workspace Dependencies

```bash
bun install
```

### 2. Run in Development Mode

You can run both API and Frontend concurrently:

```bash
bun run dev
```

Or run them individually:

**Backend API (.NET 8):**

```bash
cd apps/api
dotnet run
# Swagger UI available at: http://localhost:5126/swagger
```

**Frontend SPA (Angular + Bun):**

```bash
cd apps/web
bun run start
# Web app available at: http://localhost:4200
```

---

## 🧹 Code Quality & Linting

Run **oxlint** and **prettier** across both apps:

```bash
bun run lint      # Ultra-fast oxlint
bun run format    # Format all files with prettier
```

---

## 🔌 API Gateway & External Integrations

External web applications (WordPress, Next.js, Laravel, Python, etc.) can compress images by sending requests with the `X-API-Key` header:

```bash
curl -X POST "http://localhost:5126/api/v1/compression/compress?quality=80&format=WebP" \
  -H "X-API-Key: cmp_live_your_api_key_here" \
  -F "file=@photo.png" \
  --output compressed_photo.webp
```
