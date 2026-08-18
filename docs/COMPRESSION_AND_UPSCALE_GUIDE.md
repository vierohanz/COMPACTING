# COMPACTING - Engine Processing & Algorithm Guide

Dokumentasi teknis lengkap mengenai cara kerja mesin kompresi gambar dan peningkatan resolusi (*AI Upscaling*) pada platform **COMPACTING**.

---

## 1. Arsitektur Mesin Pemrosesan

Semua proses kompresi dan upscaling berjalan **100% di sisi server** (Backend ASP.NET Core 8) menggunakan memori streaming non-blocking (*zero temporary disk file*).

```
                      [Gambar Masuk (Stream)]
                                 │
                                 ▼
                     [Zero-Copy Memory Stream]
                                 │
       ┌─────────────────────────┴─────────────────────────┐
       ▼                                                   ▼
┌───────────────────────────────┐   ┌───────────────────────────────┐
│        MODE COMPRESS          │   │         MODE UPSCALE          │
├───────────────────────────────┤   ├───────────────────────────────┤
│ • Pertahankan Dimensi (1x)    │   │ • Perbesar Resolusi (2x/4x/8x)│
│ • Strip EXIF/GPS/Metadata     │   │ • Lanczos-3 Sinc Resampling   │
│ • Frekuensi DCT & Kuantisasi  │   │ • Gaussian Edge Sharpening    │
│ • WebP/JPEG/PNG Encoding      │   │ • Smart Compression Packaging │
└───────────────────────────────┘   └───────────────────────────────┘
       │                                                   │
       └─────────────────────────┬─────────────────────────┘
                                 ▼
                 [Hasil Output (<30 ms Latensi)]
                                 │
         ┌───────────────────────┴───────────────────────┐
         ▼                                               ▼
[Binary Stream + HTTP Headers]                 [Async Telemetry Log]
• X-Original-Size                              • User Scoped Metric
• X-Compressed-Size                            • Total Bytes Saved
• X-Compression-Ratio                          • Execution Duration
• X-Duration-Ms                                • PostgreSQL & Redis
```

---

## 2. Perbedaan Mendasar: Mode Compress vs Mode Upscale

| Parameter | ⚡ Mode Compress (Studio Biasa) | 🔍 Mode Upscale (AI Studio) |
|---|---|---|
| **Tujuan Utama** | Memperkecil **ukuran file (KB/MB)** sebesar mungkin. | Memperbesar **resolusi/dimensi pixel (2x, 4x, 8x)**. |
| **Dimensi Pixel** | **Tetap sama** (misal: 1080p tetap 1080p). | **Meningkat drastis** (misal: 400×400 px $\rightarrow$ 1600×1600 px). |
| **Peran `Lanczos-3`** | **Pasif / Opsional** (hanya jika menyetel batas lebar/tinggi). | **Wajib & Aktif Penuh** (Menghitung jutaan pixel baru). |
| **Peran `Gaussian`** | **Opsional** (umumnya nonaktif agar kecepatan instan). | **Wajib Aktif** (Restorasi ketajaman agar tidak blur). |
| **Fokus Optimasi** | Penghematan Kuota Bandwidth & Kecepatan Loading Web. | Kerapatan Pixel, Kualitas Cetak, & Detail Gambar. |
| **Hasil Ukuran File** | **Menyusut 60% – 90%** (misal 3 MB $\rightarrow$ 350 KB). | **Terkontrol Seimbang** (Ukuran tetap efisien untuk web). |

---

## 3. Penjelasan Algoritma yang Digunakan

### A. Algoritma Kualitas Visual & Resampling

#### 1. Lanczos-3 Sinc-Windowed Kernel
Saat gambar diperbesar atau diubah ukurannya, algoritma `Lanczos3` menggunakan fungsi *sinc* ternormalisasi dengan radius 3 lobus:

$$L(x) = \begin{cases} \text{sinc}(x) \cdot \text{sinc}(x/3) & \text{jika } -3 < x < 3 \\ 0 & \text{lainnya} \end{cases}$$

- **Mengapa bukan Bilinear / Bicubic biasa?**
  - *Bilinear* menghasilkan gambar yang tampak kabur dan berkabut.
  - *Nearest Neighbor* menghasilkan efek pixelation / tangga bergerigi.
  - *Lanczos-3* mempertahankan kontur tepi tajam dan gradien warna yang halus.

#### 2. Gaussian Edge Sharpening Filter
Ketika gambar diperbesar, batas garis objek cenderung kehilangan kontras mikro. Filter konvolusi spasial 2D berbasis kurva Gaussian diterapkan untuk mendeteksi tepi dan meningkatkan ketegasan garis objek tanpa memunculkan bintik noise.

---

### B. Algoritma Kompresi Data & Pemangkasan Byte

#### 1. Discrete Cosine Transform (DCT) & Kuantisasi Frekuensi (WebP & JPEG)
- Mengubah informasi pixel matriks spasial menjadi domain frekuensi.
- Mata manusia sangat peka terhadap variasi cahaya (*Luminance*) namun kurang peka terhadap variasi warna frekuensi tinggi (*High-Frequency Chrominance*).
- Algoritma membuang frekuensi tinggi yang tidak terlihat, memangkas ukuran hingga 85%.

#### 2. Deflate / LZ77 + Huffman Coding (PNG & WebP Lossless)
- Mendeteksi string atau urutan bit yang berulang dan menggantinya dengan penunjuk (pointer) matematis yang jauh lebih hemat memori.

#### 3. EXIF & Metadata Stripper
- Memotong header non-visual seperti koordinat GPS, merk lensa, kamera, dan thumbnail internal tersembunyi yang memakan 15% - 30% ukuran file.

---

## 4. Benchmark Performa

| Format Input | Ukuran Asli | Format Output | Ukuran Akhir | Penghematan | Waktu Proses |
|---|---|---|---|---|---|
| PNG (Screenshot) | 1.84 MB | **WebP (q=80)** | **186 KB** | **-89.9%** | 18 ms |
| JPEG (Foto Kamera) | 4.20 MB | **WebP (q=80)** | **490 KB** | **-88.3%** | 24 ms |
| PNG (Logo Vektor) | 850 KB | **PNG Lossless** | **310 KB** | **-63.5%** | 15 ms |
| PNG (Icon Kecil) | 120 KB | **WebP 4x Upscale** | **94 KB** | *4x Resolution* | 32 ms |
