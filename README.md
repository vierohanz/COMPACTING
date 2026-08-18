# COMPACTING - Self-Hosted Image Compression & AI Upscale SaaS

> Engine kompresi gambar dan REST API gateway performa tinggi berbasis **ASP.NET Core 8**, **Angular 19** (Bun), **PostgreSQL**, dan **Dragonfly Cache**.

---

## 📚 Dokumentasi Lengkap (Documentation Index)

1. ⚙️ **[Panduan Algoritma & Kompresi](file:///c:/laragon/www/COMPACTING/docs/COMPRESSION_AND_UPSCALE_GUIDE.md)**
   - Cara kerja kompresi vs AI upscale
   - Penjelasan teknis algoritma Lanczos-3, Gaussian Sharpening, DCT, dan Kuantisasi
   - Benchmark performa dan hasil efisiensi rasio

2. 🔌 **[Panduan Integrasi API Eksternal](file:///c:/laragon/www/COMPACTING/docs/API_INTEGRATION_GUIDE.md)**
   - Spesifikasi endpoint `POST /api/v1/compression/compress`
   - Contoh kode siap pakai di **cURL, JavaScript / Node.js, PHP / Laravel, Python, Go, dan C#**

3. 🛡️ **[Arsitektur, Keamanan & Skema Database](file:///c:/laragon/www/COMPACTING/docs/ARCHITECTURE_AND_DATABASE.md)**
   - Diagram arsitektur modular monolith
   - Sistem JWT Token + Refresh Token Rotation 90 hari
   - Skema lengkap tabel PostgreSQL (`users`, `refresh_tokens`, `api_keys`, `compression_logs`)

---

## 🏗️ Struktur Repositori

```text
COMPACTING/
├── docs/                           # Dokumentasi Arsitektur & Integrasi
│   ├── COMPRESSION_AND_UPSCALE_GUIDE.md
│   ├── API_INTEGRATION_GUIDE.md
│   └── ARCHITECTURE_AND_DATABASE.md
├── apps/
│   ├── api/                        # ASP.NET Core 8 Web API
│   │   ├── src/
│   │   │   ├── db/                 # EF Core DB Context & PostgreSQL Entities
│   │   │   ├── middleware/         # API Key & Global Error Handling
│   │   │   ├── modules/            # Auth, Compression, ApiKeys, Analytics, Storage
│   │   │   └── utils/              # Security & Hashing Helpers
│   │   └── Program.cs
│   └── web/                        # Angular 19 Standalone SPA (Bun)
│       └── src/app/
│           ├── core/               # Stores, API Services, Configs
│           ├── features/           # Playground, Upscale, ApiKeys, Analytics
│           └── shared/             # Custom Spider Select, Badge, Models
├── package.json
└── README.md
```

---

## 🚀 Memulai Proyek (Quick Start)

### 1. Install Dependensi Frontend
```bash
bun install
```

### 2. Jalankan Server Secara Bersamaan
```bash
bun run dev
```

Atau jalankan masing-masing:

- **Backend .NET 8 API**:
  ```bash
  cd apps/api
  dotnet run
  # Swagger: http://localhost:5126/swagger
  ```

- **Frontend Angular 19 (Bun)**:
  ```bash
  cd apps/web
  bun run start
  # Web Studio: http://localhost:4200
  ```

---

## ⚡ Contoh Pemanggilan Cepat via cURL

```bash
curl -X POST "https://compacting.raishannan.com/api/v1/compression/compress?format=WebP&quality=80" \
  -H "X-API-Key: cmp_live_your_api_key_secret_here" \
  -F "file=@foto.png" \
  --output "foto_kompresi.webp"
```
