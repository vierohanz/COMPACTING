import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CompressionStore } from '../../core/store/compression.store';
import { formatBytes } from '../../core/utils/utils';

@Component({
  selector: 'app-playground',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full">
      <!-- Left Controls Panel -->
      <div
        class="lg:col-span-4 xl:col-span-4 rounded-2xl border border-pink-100/80 bg-white shadow-sm p-6 sm:p-7 flex flex-col justify-between gap-6 h-full"
      >
        <div class="flex flex-col gap-6">
          <div class="border-b border-slate-100 pb-4">
            <h2 class="text-lg font-bold tracking-tight text-slate-900">Compression Studio</h2>
            <p class="text-xs text-slate-500 mt-0.5">
              Tweak quality, resizing, and convert image formats in real-time.
            </p>
          </div>

          <!-- Dropzone Upload Area -->
          <div
            class="rounded-xl border-2 border-dashed border-pink-200 hover:border-pink-500 bg-pink-50/30 hover:bg-pink-50/60 p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 group"
            (dragover)="onDragOver($event)"
            (drop)="onFileDropped($event)"
            (click)="fileInput.click()"
          >
            <input
              #fileInput
              type="file"
              (change)="onFileChange($event)"
              accept="image/*"
              style="display: none;"
            />
            <div
              class="w-12 h-12 rounded-2xl bg-white border border-pink-200 flex items-center justify-center text-pink-600 shadow-sm group-hover:scale-105 transition-transform"
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
              <p class="text-xs font-bold text-slate-800">
                {{
                  store.selectedFile()
                    ? store.selectedFile()?.name
                    : 'Drop image here or click to browse'
                }}
              </p>
              <span class="text-[11px] text-slate-400 font-medium mt-0.5 block"
                >Supports JPEG, PNG, WebP, GIF, BMP, TIFF</span
              >
            </div>
          </div>

          <!-- Quick Presets -->
          <div class="space-y-2.5">
            <label class="text-xs font-bold text-slate-700 block tracking-wide uppercase text-[11px]">
              Quick Presets
            </label>
            <div class="grid grid-cols-2 gap-2.5">
              <button
                class="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-semibold transition-all border shadow-xs h-9 px-3 cursor-pointer"
                [ngClass]="
                  store.quality() === 65 && !store.lossless()
                    ? 'bg-pink-600 text-white border-pink-600 font-bold shadow-md shadow-pink-600/20'
                    : 'border-slate-200 bg-white hover:bg-pink-50/50 hover:border-pink-200 text-slate-700'
                "
                (click)="store.setPreset('speed')"
              >
                Fast (65%)
              </button>
              <button
                class="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-semibold transition-all border shadow-xs h-9 px-3 cursor-pointer"
                [ngClass]="
                  store.quality() === 80 && !store.lossless()
                    ? 'bg-pink-600 text-white border-pink-600 font-bold shadow-md shadow-pink-600/20'
                    : 'border-slate-200 bg-white hover:bg-pink-50/50 hover:border-pink-200 text-slate-700'
                "
                (click)="store.setPreset('balanced')"
              >
                Balanced (80%)
              </button>
              <button
                class="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-semibold transition-all border shadow-xs h-9 px-3 cursor-pointer"
                [ngClass]="
                  store.quality() === 90 && !store.lossless()
                    ? 'bg-pink-600 text-white border-pink-600 font-bold shadow-md shadow-pink-600/20'
                    : 'border-slate-200 bg-white hover:bg-pink-50/50 hover:border-pink-200 text-slate-700'
                "
                (click)="store.setPreset('ultra')"
              >
                High Quality (90%)
              </button>
              <button
                class="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-semibold transition-all border shadow-xs h-9 px-3 cursor-pointer"
                [ngClass]="
                  store.lossless()
                    ? 'bg-pink-600 text-white border-pink-600 font-bold shadow-md shadow-pink-600/20'
                    : 'border-slate-200 bg-white hover:bg-pink-50/50 hover:border-pink-200 text-slate-700'
                "
                (click)="store.setPreset('lossless')"
              >
                Lossless
              </button>
            </div>
          </div>

          <!-- Parameters Controls -->
          <div class="space-y-4 pt-1 border-t border-slate-100">
            <div class="space-y-2">
              <div class="flex justify-between items-center text-xs font-medium">
                <label class="text-slate-700 font-semibold">Quality Level</label>
                <span class="font-mono text-pink-600 font-bold bg-pink-50 px-2 py-0.5 rounded-md border border-pink-100">{{ store.quality() }}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                [ngModel]="store.quality()"
                (ngModelChange)="store.quality.set($event); store.compress()"
                class="w-full accent-pink-600 cursor-pointer h-2 bg-slate-100 rounded-lg appearance-none"
              />
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-700 block">Target Output Format</label>
              <select
                [ngModel]="store.targetFormat()"
                (ngModelChange)="store.targetFormat.set($event); store.compress()"
                class="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 font-medium text-slate-900"
              >
                <option value="WebP">WebP (Modern, Smallest size)</option>
                <option value="Jpeg">JPEG (Universal compatibility)</option>
                <option value="Png">PNG (Lossless transparency)</option>
                <option value="Gif">GIF (Animated graphics)</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-slate-700 block">Max Width (px)</label>
                <input
                  type="number"
                  [ngModel]="store.maxWidth()"
                  (ngModelChange)="store.maxWidth.set($event); store.compress()"
                  placeholder="Auto"
                  class="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 text-slate-900"
                />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-slate-700 block">Max Height (px)</label>
                <input
                  type="number"
                  [ngModel]="store.maxHeight()"
                  (ngModelChange)="store.maxHeight.set($event); store.compress()"
                  placeholder="Auto"
                  class="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 text-slate-900"
                />
              </div>
            </div>
          </div>
        </div>

        <div
          class="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 mt-2"
        >
          <input
            type="checkbox"
            id="stripExif"
            [ngModel]="store.stripMetadata()"
            (ngModelChange)="store.stripMetadata.set($event); store.compress()"
            class="h-4 w-4 rounded border-slate-300 text-pink-600 accent-pink-600 focus:ring-pink-500"
          />
          <label for="stripExif" class="cursor-pointer select-none">
            <span class="block text-xs font-bold text-slate-800">Strip EXIF / Privacy Metadata</span>
            <span class="block text-[11px] text-slate-500"
              >Removes camera profiles, GPS coordinates, and date tags</span
            >
          </label>
        </div>
      </div>

      <!-- Right Visual Studio & Comparison Panel -->
      <div
        class="lg:col-span-8 xl:col-span-8 rounded-2xl border border-pink-100/80 bg-white shadow-sm p-6 sm:p-7 flex flex-col justify-between gap-6 h-full"
      >
        <div class="flex flex-col gap-5 flex-1">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div class="flex items-center gap-3">
              <h3 class="text-lg font-bold tracking-tight text-slate-900">
                Visual Comparison Slider
              </h3>
              <span
                *ngIf="store.compressionResult()"
                class="inline-flex items-center rounded-full border border-pink-200 bg-pink-50 px-3 py-0.5 text-xs font-bold text-pink-700 shadow-xs"
              >
                {{ store.compressionResult()?.compressionRatioPercent }}% Bandwidth Saved
              </span>
            </div>

            <div *ngIf="store.previewCompressedUrl()">
              <button
                class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-xs font-bold transition-all bg-pink-600 text-white shadow-md shadow-pink-600/20 hover:bg-pink-700 h-9 px-4 cursor-pointer active:scale-98"
                (click)="download()"
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
              class="relative w-full flex-1 min-h-[460px] bg-slate-950 border border-slate-200 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center select-none"
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
                class="absolute top-0 bottom-0 w-0.5 bg-white pointer-events-none shadow-[0_0_8px_rgba(0,0,0,0.6)] z-20"
                [style.left.%]="store.sliderPosition()"
              >
                <div
                  class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white"
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

              <!-- Badges -->
              <div
                class="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 text-white text-[11px] font-bold px-3 py-1 rounded-lg z-20 shadow-sm"
              >
                Original
              </div>
              <div
                class="absolute top-3 right-3 bg-pink-600/90 backdrop-blur-md border border-pink-500 text-white text-[11px] font-bold px-3 py-1 rounded-lg z-20 shadow-sm"
              >
                {{ store.targetFormat() }} (Optimized)
              </div>
            </div>

            <!-- Live Metrics Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div class="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                <span class="text-[11px] font-semibold text-slate-500 block">Original Size</span>
                <span class="text-sm font-bold text-slate-900 font-mono mt-0.5 block">
                  {{ formatBytes(store.compressionResult()?.originalSizeBytes || 0) }}
                </span>
              </div>

              <div class="p-3.5 bg-pink-50/60 border border-pink-200/80 rounded-xl">
                <span class="text-[11px] font-semibold text-pink-700 block">Compressed Size</span>
                <span class="text-sm font-bold text-pink-600 font-mono mt-0.5 block">
                  {{ formatBytes(store.compressionResult()?.compressedSizeBytes || 0) }}
                </span>
              </div>

              <div class="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-xl">
                <span class="text-[11px] font-semibold text-emerald-700 block">Bytes Saved</span>
                <span class="text-sm font-bold text-emerald-600 font-mono mt-0.5 block">
                  {{ formatBytes(store.compressionResult()?.bytesSaved || 0) }}
                </span>
              </div>

              <div class="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                <span class="text-[11px] font-semibold text-slate-500 block">Speed / Resolution</span>
                <span class="text-sm font-bold text-slate-900 font-mono mt-0.5 block">
                  {{ store.compressionResult()?.durationMs }}ms · {{ store.compressionResult()?.width }}x{{ store.compressionResult()?.height }}
                </span>
              </div>
            </div>
          </div>

          <!-- Empty State (Equal height with left studio) -->
          <ng-template #emptyState>
            <div
              class="w-full flex-1 min-h-[540px] h-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/40 flex flex-col items-center justify-center p-8 text-center"
            >
              <div
                class="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm mb-4"
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
              <h4 class="text-base font-bold text-slate-800">No Image Selected</h4>
              <p class="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
                Upload an image on the left studio to see instant visual compression and compare quality side-by-side.
              </p>
            </div>
          </ng-template>
        </div>
      </div>
    </section>
  `
})
export class PlaygroundComponent {
  store = inject(CompressionStore);
  formatBytes = formatBytes;

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.store.setFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onFileDropped(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      this.store.setFile(event.dataTransfer.files[0]);
    }
  }

  download() {
    const url = this.store.previewCompressedUrl();
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `compressed_${this.store.selectedFile()?.name.split('.')[0] || 'image'}.${this.store.targetFormat().toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
