# COMPACTING - Comprehensive API Integration Guide

Panduan integrasi lengkap untuk menghubungkan engine kompresi dan AI upscaling **COMPACTING** ke berbagai platform eksternal (Website, Mobile Apps, Cloud Backend, WordPress, CMS, Microservices, dan Pipelines).

---

## 1. Authentication & Security

Setiap request ke endpoint API menggunakan autentikasi **`X-API-Key`** pada HTTP Header:

```http
X-API-Key: cmp_live_your_api_key_secret_here
```

> [!TIP]
> Anda dapat membuat API Key dengan durasi kedaluwarsa fleksibel (**30, 60, 90, 365 hari**, atau **Unlimited / Never Expires**) di menu **API Keys** pada antarmuka web COMPACTING.

---

## 2. Katalog Endpoint API

### A. Single File Compression (Binary Stream Output)
Mengembalikan output berupa file gambar binary murni yang dapat langsung disimpan atau disalurkan ke klien browser.

```http
POST /api/v1/compression/compress
Content-Type: multipart/form-data
```

#### Query Parameters:

| Parameter | Tipe | Default | Pilihan / Rentang | Deskripsi |
|---|---|---|---|---|
| `format` | `string` | `WebP` | `WebP`, `Jpeg`, `Png`, `Gif` | Format file target |
| `quality` | `int` | `80` | `1` s/d `100` | Tingkat kualitas kompresi |
| `stripMetadata` | `bool` | `true` | `true`, `false` | Menghapus profil EXIF, GPS, dan kamera |
| `lossless` | `bool` | `false` | `true`, `false` | Kompresi tanpa penurunan kualitas (PNG/WebP) |
| `scale` | `double` | `1.0` | `1.0`, `2.0`, `4.0`, `8.0` | Faktor perbesaran AI Upscale |
| `enhanceHd` | `bool` | `false` | `true`, `false` | Mengaktifkan Gaussian clarity sharpening |
| `sharpen` | `double` | `0.0` | `0.5` s/d `2.5` | Intensitas penajaman tepi |
| `maxWidth` | `int?` | `null` | `1` s/d `10000` | Batas lebar maksimum (px) |
| `maxHeight` | `int?` | `null` | `1` s/d `10000` | Batas tinggi maksimum (px) |
| `json` | `bool` | `false` | `true`, `false` | Jika `true`, mengembalikan JSON metadata |

#### Response Headers:
- `X-Original-Size`: Ukuran file sebelum diproses (Bytes)
- `X-Compressed-Size`: Ukuran file setelah dikompresi (Bytes)
- `X-Bytes-Saved`: Total byte yang dihemat
- `X-Compression-Ratio`: Rasio penghematan (misal: `74.5%`)
- `X-Duration-Ms`: Waktu proses server (milidetik)

---

### B. Single File Compression (JSON Payload Output)
Mengembalikan detail metrik analitik lengkap disertai data gambar berformat Base64 Data URL.

```http
POST /api/v1/compression/compress-json
Content-Type: multipart/form-data
```

#### Contoh Response JSON:
```json
{
  "success": true,
  "fileName": "sample_photo.webp",
  "sourceFormat": "PNG",
  "targetFormat": "WebP",
  "contentType": "image/webp",
  "originalSizeBytes": 1425890,
  "compressedSizeBytes": 185420,
  "bytesSaved": 1240470,
  "compressionRatioPercent": 86.99,
  "width": 1920,
  "height": 1080,
  "durationMs": 24,
  "base64Data": "UklGRu4AAABXRUJQVlA4T...",
  "errorMessage": null
}
```

---

### C. Batch Compression (Multi-File)
Mengompresi beberapa gambar sekaligus dalam 1 request HTTP.

```http
POST /api/v1/compression/batch
Content-Type: multipart/form-data
```

---

### D. Analytics & Telemetry API
Mengambil data analitik dan riwayat event log akun pengguna.

- **Ringkasan Analitik**: `GET /api/v1/analytics/summary?global=false`
- **Riwayat Event Log**: `GET /api/v1/analytics/recent?limit=20&global=false`
- **Distribusi Format**: `GET /api/v1/analytics/formats?global=false`

---

## 3. Contoh Kode Implementasi di Berbagai Bahasa

### 1. cURL / Terminal

#### A. Kompresi Standar ke WebP (Binary Output)
```bash
curl -X POST "https://compacting.raishannan.com/api/v1/compression/compress?format=WebP&quality=80&stripMetadata=true" \
  -H "X-API-Key: cmp_live_your_api_key_here" \
  -F "file=@foto_produk.jpg" \
  --output "foto_produk.webp"
```

#### B. AI Upscale 4X dengan HD Enhancement
```bash
curl -X POST "https://compacting.raishannan.com/api/v1/compression/compress?format=Png&scale=4&enhanceHd=true&sharpen=1.2" \
  -H "X-API-Key: cmp_live_your_api_key_here" \
  -F "file=@logo_kecil.png" \
  --output "logo_ultra_hd_4x.png"
```

---

### 2. JavaScript / TypeScript / Node.js (Fetch & FormData)

```typescript
import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

interface CompressOptions {
  format?: 'WebP' | 'Jpeg' | 'Png' | 'Gif';
  quality?: number;
  scale?: number;
  enhanceHd?: boolean;
}

async function optimizeImage(
  inputPath: string,
  outputPath: string,
  options: CompressOptions = { format: 'WebP', quality: 80 }
) {
  const form = new FormData();
  form.append('file', fs.createReadStream(inputPath));

  const query = new URLSearchParams({
    format: options.format || 'WebP',
    quality: String(options.quality || 80),
    scale: String(options.scale || 1),
    enhanceHd: String(options.enhanceHd || false),
    stripMetadata: 'true'
  });

  const response = await fetch(`https://compacting.raishannan.com/api/v1/compression/compress?${query}`, {
    method: 'POST',
    headers: {
      'X-API-Key': process.env.COMPACTING_API_KEY!,
      ...form.getHeaders()
    },
    body: form
  });

  if (!response.ok) {
    throw new Error(`Compression failed: ${response.statusText}`);
  }

  // Baca performa dari Header
  console.log(`[COMPACTING] Saved: ${response.headers.get('x-bytes-saved')} bytes`);
  console.log(`[COMPACTING] Ratio: ${response.headers.get('x-compression-ratio')}`);
  console.log(`[COMPACTING] Latency: ${response.headers.get('x-duration-ms')} ms`);

  const buffer = await response.buffer();
  fs.writeFileSync(outputPath, buffer);
}
```

---

### 3. Next.js 14/15 App Router (Server Action)

```typescript
// app/actions/compress.ts
'use server';

export async function compressUploadAction(formData: FormData) {
  const file = formData.get('image') as File;
  if (!file) throw new Error('No image provided');

  const apiForm = new FormData();
  apiForm.append('file', file, file.name);

  const response = await fetch(
    'https://compacting.raishannan.com/api/v1/compression/compress-json?format=WebP&quality=80',
    {
      method: 'POST',
      headers: {
        'X-API-Key': process.env.COMPACTING_API_KEY!
      },
      body: apiForm
    }
  );

  const result = await response.json();
  return result;
}
```

---

### 4. PHP / Laravel (Http Client)

```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class CompactingService
{
    protected string $baseUrl;
    protected string $apiKey;

    public function __construct()
    {
        $this->baseUrl = config('services.compacting.url', 'https://compacting.raishannan.com');
        $this->apiKey = config('services.compacting.key');
    }

    public function compressAndStore(string $localFilePath, string $targetFormat = 'WebP', int $quality = 80): ?string
    {
        $response = Http::withHeaders([
            'X-API-Key' => $this->apiKey,
        ])->attach(
            'file',
            file_get_contents($localFilePath),
            basename($localFilePath)
        )->post("{$this->baseUrl}/api/v1/compression/compress", [
            'format' => $targetFormat,
            'quality' => $quality,
            'stripMetadata' => 'true'
        ]);

        if ($response->successful()) {
            $filename = pathinfo($localFilePath, PATHINFO_FILENAME) . '.' . strtolower($targetFormat);
            $storagePath = "optimized/{$filename}";
            
            Storage::disk('public')->put($storagePath, $response->body());
            return $storagePath;
        }

        return null;
    }
}
```

---

### 5. Python (Requests)

```python
import os
import requests

class CompactingClient:
    def __init__(self, base_url: str = "https://compacting.raishannan.com", api_key: str = None):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key or os.getenv("COMPACTING_API_KEY")

    def compress_image(self, input_path: str, output_path: str, format: str = "WebP", quality: int = 80):
        url = f"{self.base_url}/api/v1/compression/compress"
        headers = {"X-API-Key": self.api_key}
        params = {
            "format": format,
            "quality": quality,
            "stripMetadata": True
        }

        with open(input_path, "rb") as f:
            files = {"file": (os.path.basename(input_path), f)}
            res = requests.post(url, headers=headers, params=params, files=files)

        if res.status_code == 200:
            with open(output_path, "wb") as out:
                out.write(res.content)
            print(f"Success! Saved {res.headers.get('X-Compression-Ratio')} in {res.headers.get('X-Duration-Ms')} ms")
            return True
        else:
            raise Exception(f"Failed ({res.status_code}): {res.text}")

# Contoh Pemanggilan:
client = CompactingClient(api_key="cmp_live_your_key_here")
client.compress_image("sample.png", "sample_opt.webp", format="WebP", quality=80)
```

---

### 6. Go (Golang Net/HTTP)

```go
package main

import (
	"bytes"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
)

func CompressImage(inputPath, outputPath, apiKey string) error {
	file, err := os.Open(inputPath)
	if err != nil {
		return err
	}
	defer file.Close()

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, err := writer.CreateFormFile("file", filepath.Base(inputPath))
	if err != nil {
		return err
	}
	if _, err := io.Copy(part, file); err != nil {
		return err
	}
	writer.Close()

	url := "https://compacting.raishannan.com/api/v1/compression/compress?format=WebP&quality=80&stripMetadata=true"
	req, err := http.NewRequest("POST", url, body)
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())
	req.Header.Set("X-API-Key", apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("API error: status code %d", resp.StatusCode)
	}

	out, err := os.Create(outputPath)
	if err != nil {
		return err
	}
	defer out.Close()

	_, err = io.Copy(out, resp.Body)
	return err
}
```

---

### 7. C# / .NET 8 (IHttpClientFactory)

```csharp
using System.Net.Http.Headers;

public class CompactingApiClient
{
    private readonly HttpClient _httpClient;

    public CompactingApiClient(HttpClient httpClient, IConfiguration config)
    {
        _httpClient = httpClient;
        _httpClient.BaseAddress = new Uri(config["Compacting:BaseUrl"] ?? "https://compacting.raishannan.com");
        _httpClient.DefaultRequestHeaders.Add("X-API-Key", config["Compacting:ApiKey"]);
    }

    public async Task<byte[]> CompressAsync(Stream imageStream, string fileName, string format = "WebP", int quality = 80)
    {
        using var content = new MultipartFormDataContent();
        using var streamContent = new StreamContent(imageStream);
        content.Add(streamContent, "file", fileName);

        var response = await _httpClient.PostAsync(
            $"/api/v1/compression/compress?format={format}&quality={quality}&stripMetadata=true",
            content
        );

        response.EnsureSuccessStatusCode();
        return await response.Content.ReadAsByteArrayAsync();
    }
}
```

---

## 4. Penanganan Error (HTTP Status Codes)

| Status Code | Arti | Solusi |
|---|---|---|
| `200 OK` | Kompresi Berhasil | File terkompresi diterima |
| `400 Bad Request` | File Kosong / Parameter Salah | Periksa apakah field multipart bernama `file` |
| `401 Unauthorized` | API Key Salah / Hilang | Periksa nilai header `X-API-Key` |
| `404 Not Found` | Endpoint Tidak Ditemukan | Periksa URL endpoint yang dituju |
| `429 Too Many Requests` | Melebihi Batas Rate Limit | Periksa kuota rate limit pada API Key atau tambahkan jeda waktu |
| `500 Server Error` | File Rusak / Server Exception | Pastikan file berformat gambar valid |
