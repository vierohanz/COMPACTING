# COMPACTING - Architecture, Security & Database Design

Dokumentasi arsitektur sistem, keamanan autentikasi JWT token rotation, cache Dragonfly, dan skema database PostgreSQL.

---

## 1. Arsitektur Komponen

```
                  ┌─────────────────────────────────┐
                  │       Frontend Client SPA       │
                  │   (Angular 19 Standalone + Bun) │
                  └────────────────┬────────────────┘
                                   │ HTTP (REST + JWT Bearer)
                                   ▼
                  ┌─────────────────────────────────┐
                  │      ASP.NET Core 8 Web API     │
                  │ (Modular Monolith Architecture) │
                  └───────┬─────────────────┬───────┘
                          │                 │
            PostgreSQL DB │                 │ Distributed Cache
                          ▼                 ▼
             ┌─────────────────┐   ┌─────────────────┐
             │ PostgreSQL DB   │   │ Dragonfly Redis │
             │  (Port: 54321)  │   │  (Port: 6379)   │
             └─────────────────┘   └─────────────────┘
```

---

## 2. Keamanan & Autentikasi (JWT & Refresh Token Rotation)

- **JWT Access Token**: Berumur pendek (**15 Menit**) untuk melindungi endpoint dari token theft.
- **Refresh Token Rotation**: Berumur **90 Hari**. Setiap refresh token digunakan, token tersebut dihanguskan dan digantikan oleh refresh token baru.
- **Token Reuse Detection & Family Invalidation**: Jika token yang sudah dihanguskan dicoba untuk digunakan kembali oleh penyerang, seluruh keluarga token terkait akun tersebut otomatis dibatalkan secara instan demi keamanan.

---

## 3. Database Schema (PostgreSQL Snake_case)

### A. Tabel `users`
Menyimpan identitas pengguna dan kredensial terenkripsi (BCrypt).
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'Admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### B. Tabel `refresh_tokens`
Menyimpan riwayat dan status refresh token untuk rotasi aman.
```sql
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    revoked_at TIMESTAMPTZ,
    replaced_by_token_hash TEXT,
    created_by_ip VARCHAR(100),
    revoked_by_ip VARCHAR(100)
);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens (user_id);
```

### C. Tabel `api_keys`
Menyimpan API Key yang diterbitkan untuk integrasi eksternal dengan isolasi user.
```sql
CREATE TABLE api_keys (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
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
CREATE INDEX idx_api_keys_user_id ON api_keys (user_id);
CREATE INDEX idx_api_keys_hash ON api_keys (key_hash);
```

### D. Tabel `compression_logs`
Menyimpan log audit kompresi dan telemetri penghematan bandwidth.
```sql
CREATE TABLE compression_logs (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
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
CREATE INDEX idx_compression_logs_user_id ON compression_logs (user_id);
CREATE INDEX idx_compression_logs_created_at ON compression_logs (created_at DESC);
```
