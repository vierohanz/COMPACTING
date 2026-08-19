import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthStore } from '../../core/store/auth.store';
import { CompressionStore } from '../../core/store/compression.store';
import { CompressionResult } from '../../shared/models/compression.model';
import { formatBytes } from '../../core/utils/utils';
import { CustomSelectComponent, SelectOption } from '../../shared/components/custom-select/custom-select.component';
import { SpiderBadgeComponent } from '../../shared/components/spider-badge/spider-badge.component';

@Component({
  selector: 'app-playground',
  standalone: true,
  imports: [CommonModule, FormsModule, SpiderBadgeComponent, CustomSelectComponent],
  template: `
    <div class="space-y-6">
      <!-- Marvel Spider-Man Brand New Day Hero Section -->
      <section
        class="relative overflow-hidden rounded-3xl border border-[#132d52] bg-[#071324] p-8 sm:p-12 shadow-2xl"
      >
        <div class="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <!-- Left Hero Typography -->
          <div class="space-y-4 text-center lg:text-left max-w-2xl">
            <div class="flex items-center justify-center lg:justify-start gap-2.5">
              <span class="marvel-badge">SELF-HOSTED PLATFORM</span>
              <span class="text-xs spiderman-gold-sub">NEURAL COMPRESSION ENGINE</span>
            </div>

            <div class="space-y-1">
              <h1 class="text-4xl sm:text-6xl md:text-7xl spiderman-3d-title leading-none tracking-wider">
                COMPACTING
              </h1>
              <h2 class="text-lg sm:text-2xl spiderman-gold-sub">
                BRAND NEW IMAGE ENGINE
              </h2>
            </div>

            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              High-efficiency self-hosted image compression platform. Crush payloads up to 90%, preserve pixel-perfect clarity with WebP, AVIF, JPEG, and neural upscaling.
            </p>

            <div class="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                class="inline-flex items-center justify-center gap-2 rounded-xl text-xs font-black transition-all bg-[#e21b24] hover:bg-[#b50e16] text-white shadow-xl shadow-[#e21b24]/30 border border-[#e21b24] h-11 px-6 cursor-pointer active:scale-98"
                (click)="fileInputHero.click()"
              >
                <input
                  #fileInputHero
                  type="file"
                  (change)="onFileChange($event)"
                  accept="image/*"
                  style="display: none;"
                />
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                <span>Upload & Compress Now</span>
              </button>

              <button
                *ngIf="!authStore.isAuthenticated()"
                class="inline-flex items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all border border-[#132d52] bg-[#0c1e38] text-slate-200 shadow-xs hover:bg-[#132d52] h-11 px-5 cursor-pointer"
                (click)="authStore.openModal('register')"
              >
                <span>Get Free API Key</span>
              </button>
            </div>
          </div>

          <!-- Right Spider-Man Mascot Pin Badge -->
          <div class="relative flex items-center justify-center shrink-0">
            <div class="relative group">
              <app-spider-badge [size]="210"></app-spider-badge>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Studio & Comparison Workspace -->
      <section class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full">
        <!-- Left Controls Panel -->
        <div
          class="lg:col-span-4 xl:col-span-4 rounded-2xl border border-[#132d52] bg-[#071324] shadow-2xl p-6 sm:p-7 flex flex-col justify-between gap-6 h-full"
        >
          <div class="flex flex-col gap-6">
            <div class="border-b border-[#132d52] pb-4">
              <div class="flex items-center gap-2">
                <h2 class="text-base font-black tracking-wide text-white">Compression Controls</h2>
                <span
                  class="inline-flex items-center rounded-md border border-[#e21b24]/40 bg-[#e21b24]/10 px-2 py-0.5 text-[10px] font-extrabold text-[#e21b24]"
                  >QUANTUM</span
                >
              </div>
              <p class="text-xs text-slate-400 mt-1">
                Configure format, quality, dimensions, and metadata.
              </p>
            </div>

            <!-- Mode Switcher -->
            <div class="flex items-center gap-1.5 p-1 rounded-xl bg-[#040914] border border-[#132d52]">
              <button
                class="flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer text-center"
                [ngClass]="
                  store.mode() === 'single'
                    ? 'bg-[#e21b24] text-white shadow-md shadow-[#e21b24]/30'
                    : 'text-slate-400 hover:text-white'
                "
                (click)="store.setMode('single')"
              >
                Single Image
              </button>
              <button
                class="flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                [ngClass]="
                  store.mode() === 'batch'
                    ? 'bg-[#e21b24] text-white shadow-md shadow-[#e21b24]/30'
                    : 'text-slate-400 hover:text-white'
                "
                (click)="store.setMode('batch')"
              >
                <span>Batch Processing</span>
                <span class="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono">MULTI</span>
              </button>
            </div>

            <!-- Dropzone Upload Area -->
            <div
              class="rounded-xl border-2 border-dashed border-[#e21b24]/40 hover:border-[#e21b24] bg-[#0c1e38] hover:bg-[#132d52] p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 group shadow-inner"
              (dragover)="onDragOver($event)"
              (drop)="onFileDropped($event)"
              (click)="fileInput.click()"
            >
              <input
                #fileInput
                type="file"
                (change)="onFileChange($event)"
                [multiple]="store.mode() === 'batch'"
                accept="image/*"
                style="display: none;"
              />
              <div
                class="w-12 h-12 rounded-2xl bg-[#071324] border border-[#e21b24]/50 flex items-center justify-center text-[#e21b24] shadow-lg shadow-[#e21b24]/20 group-hover:scale-105 transition-transform"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
              </div>
              <div>
                <p class="text-xs font-bold text-slate-100">
                  <ng-container *ngIf="store.mode() === 'single'">
                    {{
                      store.selectedFile()
                        ? store.selectedFile()?.name
                        : 'Drop single image or click to browse'
                    }}
                  </ng-container>
                  <ng-container *ngIf="store.mode() === 'batch'">
                    {{
                      store.batchFiles().length > 0
                        ? store.batchFiles().length + ' images selected for batch'
                        : 'Drop multiple images here or click to batch upload'
                    }}
                  </ng-container>
                </p>
                <span class="text-[11px] text-slate-400 font-medium mt-0.5 block"
                  >Supports JPEG, PNG, WebP, GIF, BMP, TIFF</span
                >
              </div>
            </div>

            <!-- Quick Presets -->
            <div class="space-y-2.5">
              <label class="text-[11px] font-bold text-[#ffcc00] block tracking-wider uppercase">
                Speed & Quality Presets
              </label>
              <div class="grid grid-cols-2 gap-2.5">
                <button
                  class="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-bold transition-all border shadow-xs h-9 px-3 cursor-pointer"
                  [ngClass]="
                    store.quality() === 65 && !store.lossless()
                      ? 'bg-[#e21b24] text-white border-[#e21b24] shadow-md shadow-[#e21b24]/30'
                      : 'border-[#132d52] bg-[#0c1e38] hover:bg-[#132d52] hover:border-[#e21b24]/50 text-slate-200'
                  "
                  (click)="store.setPreset('speed')"
                >
                  Fast (65%)
                </button>
                <button
                  class="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-bold transition-all border shadow-xs h-9 px-3 cursor-pointer"
                  [ngClass]="
                    store.quality() === 80 && !store.lossless()
                      ? 'bg-[#e21b24] text-white border-[#e21b24] shadow-md shadow-[#e21b24]/30'
                      : 'border-[#132d52] bg-[#0c1e38] hover:bg-[#132d52] hover:border-[#e21b24]/50 text-slate-200'
                  "
                  (click)="store.setPreset('balanced')"
                >
                  Balanced (80%)
                </button>
                <button
                  class="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-bold transition-all border shadow-xs h-9 px-3 cursor-pointer"
                  [ngClass]="
                    store.quality() === 90 && !store.lossless()
                      ? 'bg-[#e21b24] text-white border-[#e21b24] shadow-md shadow-[#e21b24]/30'
                      : 'border-[#132d52] bg-[#0c1e38] hover:bg-[#132d52] hover:border-[#e21b24]/50 text-slate-200'
                  "
                  (click)="store.setPreset('ultra')"
                >
                  High Quality (90%)
                </button>
                <button
                  class="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-bold transition-all border shadow-xs h-9 px-3 cursor-pointer"
                  [ngClass]="
                    store.lossless()
                      ? 'bg-[#e21b24] text-white border-[#e21b24] shadow-md shadow-[#e21b24]/30'
                      : 'border-[#132d52] bg-[#0c1e38] hover:bg-[#132d52] hover:border-[#e21b24]/50 text-slate-200'
                  "
                  (click)="store.setPreset('lossless')"
                >
                  Lossless
                </button>
              </div>
            </div>

            <!-- Parameters Controls -->
            <div class="space-y-4 pt-1 border-t border-[#132d52]">
              <div class="space-y-2">
                <div class="flex justify-between items-center text-xs font-medium">
                  <label class="text-slate-200 font-semibold">Quality Level</label>
                  <span class="font-mono text-[#e21b24] font-black bg-[#e21b24]/15 px-2.5 py-0.5 rounded-md border border-[#e21b24]/40">{{ store.quality() }}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  [ngModel]="store.quality()"
                  (ngModelChange)="store.quality.set($event); store.scale.set(1); store.enhanceHd.set(false); recompress()"
                  class="w-full accent-[#e21b24] cursor-pointer h-2 bg-[#040914] rounded-lg appearance-none"
                />
              </div>

              <!-- Custom Dropdown -->
              <div>
                <app-custom-select
                  label="Target Output Format"
                  [options]="formatOptions"
                  [value]="store.targetFormat()"
                  (valueChange)="onFormatChange($event)"
                ></app-custom-select>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-slate-200 block">Max Width (px)</label>
                  <input
                    type="number"
                    [ngModel]="store.maxWidth()"
                    (ngModelChange)="store.maxWidth.set($event); store.scale.set(1); recompress()"
                    placeholder="Auto"
                    class="flex h-10 w-full rounded-xl border border-[#132d52] bg-[#0c1e38] px-3.5 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e21b24] text-white placeholder:text-slate-500"
                  />
                </div>
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-slate-200 block">Max Height (px)</label>
                  <input
                    type="number"
                    [ngModel]="store.maxHeight()"
                    (ngModelChange)="store.maxHeight.set($event); store.scale.set(1); recompress()"
                    placeholder="Auto"
                    class="flex h-10 w-full rounded-xl border border-[#132d52] bg-[#0c1e38] px-3.5 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e21b24] text-white placeholder:text-slate-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            class="flex items-center gap-3 p-3.5 rounded-xl border border-[#132d52] bg-[#0c1e38] mt-2"
          >
            <input
              type="checkbox"
              id="stripExif"
              [ngModel]="store.stripMetadata()"
              (ngModelChange)="store.stripMetadata.set($event); recompress()"
              class="h-4 w-4 rounded border-[#132d52] bg-[#040914] text-[#e21b24] accent-[#e21b24] focus:ring-[#e21b24]"
            />
            <label for="stripExif" class="cursor-pointer select-none">
              <span class="block text-xs font-bold text-slate-100">Strip EXIF / Privacy Metadata</span>
              <span class="block text-[11px] text-slate-400"
                >Removes camera profiles, GPS coordinates, and date tags</span
              >
            </label>
          </div>
        </div>

        <!-- Right Visual Studio & Comparison / Batch Gallery Panel -->
        <div
          class="lg:col-span-8 xl:col-span-8 rounded-2xl border border-[#132d52] bg-[#071324] shadow-2xl p-6 sm:p-7 flex flex-col justify-between gap-6 h-full"
        >
          <!-- SINGLE IMAGE MODE VIEW -->
          <div *ngIf="store.mode() === 'single'" class="flex flex-col gap-5 flex-1">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#132d52] pb-4">
              <div class="flex items-center gap-3">
                <h3 class="text-base font-black tracking-wide text-white">
                  Spider-Vision Split Comparator
                </h3>
                <span
                  *ngIf="store.compressionResult()"
                  class="inline-flex items-center rounded-full border border-[#e21b24]/50 bg-[#e21b24]/15 px-3 py-0.5 text-xs font-extrabold text-[#e21b24] shadow-xs"
                >
                  {{ store.compressionResult()?.compressionRatioPercent }}% Saved
                </span>
              </div>

              <div *ngIf="store.previewCompressedUrl()">
                <button
                  class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-xs font-black transition-all bg-[#e21b24] hover:bg-[#b50e16] text-white shadow-lg shadow-[#e21b24]/25 border border-[#e21b24] h-9 px-4 cursor-pointer active:scale-98"
                  (click)="downloadSingle()"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                  <span>Download {{ store.targetFormat() }}</span>
                </button>
              </div>
            </div>

            <!-- Comparison Container -->
            <div class="flex flex-col gap-5 flex-1" *ngIf="store.previewOriginalUrl(); else emptyState">
              <div
                class="relative w-full flex-1 min-h-115 bg-[#040914] border border-[#132d52] rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center select-none"
              >
                <!-- Compressed Image (Base Layer) -->
                <img
                  [src]="store.previewCompressedUrl() || store.previewOriginalUrl()"
                  class="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                  alt="Compressed Preview"
                />

                <!-- Original Image (Clipped Layer - Exactly Overlaid) -->
                <img
                  [src]="store.previewOriginalUrl()"
                  class="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-10"
                  [style.clip-path]="'inset(0 ' + (100 - store.sliderPosition()) + '% 0 0)'"
                  alt="Original Preview"
                />

                <!-- Divider Line & Handle -->
                <div
                  class="absolute top-0 bottom-0 w-0.5 bg-[#e21b24] pointer-events-none shadow-[0_0_12px_#e21b24] z-20"
                  [style.left.%]="store.sliderPosition()"
                >
                  <div
                    class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-[#e21b24] text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.5"
                    >
                      <path d="M18 8L22 12L18 16" />
                      <path d="M6 8L2 12L6 16" />
                    </svg>
                  </div>
                </div>

                <!-- Invisible Range Slider overlay for dragging -->
                <input
                  type="range"
                  min="0"
                  max="100"
                  [ngModel]="store.sliderPosition()"
                  (ngModelChange)="store.sliderPosition.set($event)"
                  class="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30 m-0 p-0"
                />

                <div
                  class="absolute top-3 left-3 bg-[#071324] border border-[#132d52] text-slate-200 text-[11px] font-bold px-3 py-1 rounded-lg z-20 shadow-md"
                >
                  Original Source
                </div>
                <div
                  class="absolute top-3 right-3 bg-[#e21b24] border border-[#e21b24] text-white text-[11px] font-black px-3 py-1 rounded-lg z-20 shadow-md shadow-[#e21b24]/30"
                >
                  {{ store.targetFormat() }} (Optimized)
                </div>
              </div>

              <!-- Live Metrics Grid -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div class="p-3.5 bg-[#0c1e38] border border-[#132d52] rounded-xl">
                  <span class="text-[11px] font-bold text-slate-400 block">Original Size</span>
                  <span class="text-sm font-bold text-white font-mono mt-0.5 block">
                    {{ formatBytes(store.compressionResult()?.originalSizeBytes || 0) }}
                  </span>
                </div>

                <div class="p-3.5 bg-[#0c1e38] border border-[#e21b24]/40 rounded-xl">
                  <span class="text-[11px] font-bold text-[#e21b24] block">Compressed Size</span>
                  <span class="text-sm font-bold text-[#e21b24] font-mono mt-0.5 block">
                    {{ formatBytes(store.compressionResult()?.compressedSizeBytes || 0) }}
                  </span>
                </div>

                <div class="p-3.5 bg-[#0c1e38] border border-[#ffcc00]/40 rounded-xl">
                  <span class="text-[11px] font-bold text-[#ffcc00] block">Bytes Saved</span>
                  <span class="text-sm font-bold text-[#ffcc00] font-mono mt-0.5 block">
                    {{ formatBytes(store.compressionResult()?.bytesSaved || 0) }}
                  </span>
                </div>

                <div class="p-3.5 bg-[#0c1e38] border border-[#132d52] rounded-xl">
                  <span class="text-[11px] font-bold text-slate-400 block">Engine Latency</span>
                  <span class="text-sm font-bold text-slate-200 font-mono mt-0.5 block">
                    {{ store.compressionResult()?.durationMs }}ms · {{ store.compressionResult()?.width }}x{{ store.compressionResult()?.height }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- BATCH MODE VIEW -->
          <div *ngIf="store.mode() === 'batch'" class="flex flex-col gap-5 flex-1">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#132d52] pb-4">
              <div class="flex items-center gap-3">
                <h3 class="text-base font-black tracking-wide text-white">
                  Batch Neural Processing Gallery
                </h3>
                <span
                  *ngIf="store.batchResults().length > 0"
                  class="inline-flex items-center rounded-full border border-[#e21b24]/50 bg-[#e21b24]/15 px-3 py-0.5 text-xs font-extrabold text-[#e21b24] shadow-xs"
                >
                  {{ store.batchSavedPercent() }}% Total Saved
                </span>
              </div>

              <div *ngIf="store.batchResults().length > 0">
                <button
                  class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-xs font-black transition-all bg-[#e21b24] hover:bg-[#b50e16] text-white shadow-lg shadow-[#e21b24]/25 border border-[#e21b24] h-9 px-4 cursor-pointer active:scale-98"
                  (click)="downloadAllBatch()"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                  <span>Download All ({{ store.batchResults().length }})</span>
                </button>
              </div>
            </div>

            <!-- Batch Results List or Empty State -->
            <div *ngIf="store.batchResults().length > 0; else batchEmptyState" class="space-y-4 flex-1">
              <!-- Aggregate summary banner -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div class="p-3 bg-[#0c1e38] border border-[#132d52] rounded-xl">
                  <span class="text-[10px] font-bold text-slate-400 block uppercase">Total Files</span>
                  <span class="text-sm font-bold text-white font-mono mt-0.5 block">
                    {{ store.batchResults().length }} images
                  </span>
                </div>
                <div class="p-3 bg-[#0c1e38] border border-[#132d52] rounded-xl">
                  <span class="text-[10px] font-bold text-slate-400 block uppercase">Original Size</span>
                  <span class="text-sm font-bold text-white font-mono mt-0.5 block">
                    {{ formatBytes(store.totalBatchOriginalBytes()) }}
                  </span>
                </div>
                <div class="p-3 bg-[#0c1e38] border border-[#e21b24]/40 rounded-xl">
                  <span class="text-[10px] font-bold text-[#e21b24] block uppercase">Bytes Saved</span>
                  <span class="text-sm font-bold text-[#e21b24] font-mono mt-0.5 block">
                    {{ formatBytes(store.totalBatchBytesSaved()) }}
                  </span>
                </div>
                <div class="p-3 bg-[#0c1e38] border border-[#ffcc00]/40 rounded-xl">
                  <span class="text-[10px] font-bold text-[#ffcc00] block uppercase">Avg Ratio</span>
                  <span class="text-sm font-bold text-[#ffcc00] font-mono mt-0.5 block">
                    {{ store.batchSavedPercent() }}% reduction
                  </span>
                </div>
              </div>

              <!-- Scrollable Batch Items Grid -->
              <div class="max-h-96 overflow-y-auto space-y-2 pr-1">
                <div
                  *ngFor="let item of store.batchResults()"
                  class="flex items-center justify-between gap-4 p-3 rounded-xl bg-[#0c1e38] border border-[#132d52] hover:border-[#e21b24]/50 transition-all"
                >
                  <div class="flex items-center gap-3 min-w-0">
                    <div
                      class="w-10 h-10 rounded-lg bg-[#040914] border border-[#132d52] flex items-center justify-center shrink-0 overflow-hidden"
                    >
                      <img
                        *ngIf="item.base64Data"
                        [src]="'data:' + item.contentType + ';base64,' + item.base64Data"
                        class="w-full h-full object-cover"
                        [alt]="item.fileName"
                      />
                      <span *ngIf="!item.base64Data" class="text-[10px] text-slate-500 font-mono">FILE</span>
                    </div>
                    <div class="min-w-0">
                      <p class="text-xs font-bold text-white truncate">{{ item.fileName }}</p>
                      <div class="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                        <span>{{ formatBytes(item.originalSizeBytes) }}</span>
                        <span>&rarr;</span>
                        <span class="text-[#e21b24] font-bold">{{ formatBytes(item.compressedSizeBytes) }}</span>
                        <span>·</span>
                        <span>{{ item.durationMs }}ms</span>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center gap-2 shrink-0">
                    <span
                      class="text-[11px] font-black font-mono px-2 py-0.5 rounded bg-[#e21b24]/15 text-[#e21b24] border border-[#e21b24]/30"
                    >
                      -{{ item.compressionRatioPercent }}%
                    </span>
                    <button
                      *ngIf="item.base64Data"
                      class="p-2 rounded-lg bg-[#071324] hover:bg-[#e21b24] text-slate-300 hover:text-white border border-[#132d52] transition-colors cursor-pointer"
                      (click)="downloadItem(item)"
                      title="Download file"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <ng-template #batchEmptyState>
              <div
                class="w-full flex-1 min-h-135 h-full rounded-2xl border-2 border-dashed border-[#132d52] bg-[#0c1e38]/50 flex flex-col items-center justify-center p-8 text-center"
              >
                <div
                  class="w-16 h-16 rounded-2xl bg-[#071324] border border-[#132d52] flex items-center justify-center text-[#e21b24] shadow-lg mb-4"
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                  </svg>
                </div>
                <h4 class="text-base font-bold text-white">No Batch Files Uploaded</h4>
                <p class="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed">
                  Select or drag-and-drop multiple images on the left panel to batch compress and optimize simultaneously.
                </p>
              </div>
            </ng-template>
          </div>

          <!-- Empty State for Single mode -->
          <ng-template #emptyState>
            <div
              class="w-full flex-1 min-h-135 h-full rounded-2xl border-2 border-dashed border-[#132d52] bg-[#0c1e38]/50 flex flex-col items-center justify-center p-8 text-center"
            >
              <div
                class="w-16 h-16 rounded-2xl bg-[#071324] border border-[#132d52] flex items-center justify-center text-[#e21b24] shadow-lg mb-4"
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
              </div>
              <h4 class="text-base font-bold text-white">No Image Selected</h4>
              <p class="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed">
                Upload an image on the left studio to see instant visual compression and compare quality side-by-side.
              </p>
            </div>
          </ng-template>
        </div>
      </section>
    </div>
  `
})
export class PlaygroundComponent {
  store = inject(CompressionStore);
  authStore = inject(AuthStore);
  formatBytes = formatBytes;

  formatOptions: SelectOption[] = [
    { label: 'WebP (Optimized)', value: 'WebP', badge: 'Recommended', description: 'Next-gen format with superior compression' },
    { label: 'JPEG', value: 'Jpeg', description: 'Standard high-compatibility photographic format' },
    { label: 'PNG', value: 'Png', description: 'Lossless graphic with alpha transparency' },
    { label: 'GIF', value: 'Gif', description: 'Animated graphic format' }
  ];

  recompress() {
    if (this.store.mode() === 'single') {
      this.store.compress();
    } else {
      this.store.compressBatch();
    }
  }

  onFormatChange(format: string) {
    this.store.targetFormat.set(format as 'WebP' | 'Jpeg' | 'Png' | 'Gif');
    this.store.scale.set(1);
    this.store.enhanceHd.set(false);
    this.recompress();
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      if (this.store.mode() === 'batch') {
        this.store.setBatchFiles(Array.from(input.files));
      } else {
        this.store.setFile(input.files[0]);
      }
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onFileDropped(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      if (this.store.mode() === 'batch') {
        this.store.setBatchFiles(Array.from(event.dataTransfer.files));
      } else {
        this.store.setFile(event.dataTransfer.files[0]);
      }
    }
  }

  downloadSingle() {
    const url = this.store.previewCompressedUrl();
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `compressed_${this.store.selectedFile()?.name.split('.')[0] || 'image'}.${this.store.targetFormat().toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  downloadItem(item: CompressionResult) {
    if (!item.base64Data) return;
    const a = document.createElement('a');
    a.href = `data:${item.contentType};base64,${item.base64Data}`;
    a.download = item.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  downloadAllBatch() {
    for (const item of this.store.batchResults()) {
      if (item.base64Data) {
        this.downloadItem(item);
      }
    }
  }
}


