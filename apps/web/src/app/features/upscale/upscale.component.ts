import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CompressionStore } from '../../core/store/compression.store';
import { formatBytes } from '../../core/utils/utils';
import { CustomSelectComponent, SelectOption } from '../../shared/components/custom-select/custom-select.component';

@Component({
  selector: 'app-upscale',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomSelectComponent],
  template: `
    <section class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full">
      <!-- Left Controls Studio -->
      <div
        class="lg:col-span-4 xl:col-span-4 rounded-2xl border border-[#132d52] bg-[#071324] shadow-2xl p-6 sm:p-7 flex flex-col justify-between gap-6 h-full"
      >
        <div class="flex flex-col gap-6">
          <div class="border-b border-[#132d52] pb-4">
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center rounded-md bg-[#e21b24]/15 border border-[#e21b24]/40 px-2 py-0.5 text-[11px] font-extrabold text-[#e21b24]">
                NEURAL QUANTUM RES
              </span>
            </div>
            <h2 class="text-lg font-black tracking-wide text-white mt-1">AI Upscaler Studio</h2>
            <p class="text-xs text-slate-400 mt-0.5">
              Enhance photo resolution up to 4K with Lanczos3 resampling and HD edge restoration.
            </p>
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
                {{
                  store.selectedFile()
                    ? store.selectedFile()?.name
                    : 'Drop photo to upscale or click to browse'
                }}
              </p>
              <span class="text-[11px] text-slate-400 font-medium mt-0.5 block"
                >JPG, PNG, WebP up to 50MB</span
              >
            </div>
          </div>

          <!-- Upscale Scale Factors -->
          <div class="space-y-2.5">
            <label class="text-[11px] font-bold text-[#ffcc00] block tracking-wider uppercase">
              Target Scale Factor
            </label>
            <div class="grid grid-cols-3 gap-2">
              <button
                class="flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer shadow-xs"
                [ngClass]="
                  store.scale() === 2
                    ? 'bg-[#e21b24] text-white border-[#e21b24] shadow-md shadow-[#e21b24]/30'
                    : 'border-[#132d52] bg-[#0c1e38] hover:bg-[#132d52] text-slate-200'
                "
                (click)="setScale(2)"
              >
                <span class="text-base font-black">2X</span>
                <span class="text-[10px] opacity-80">HD (200%)</span>
              </button>

              <button
                class="flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer shadow-xs relative overflow-hidden"
                [ngClass]="
                  store.scale() === 4
                    ? 'bg-[#e21b24] text-white border-[#e21b24] shadow-md shadow-[#e21b24]/30'
                    : 'border-[#132d52] bg-[#0c1e38] hover:bg-[#132d52] text-slate-200'
                "
                (click)="setScale(4)"
              >
                <span class="text-base font-black">4X</span>
                <span class="text-[10px] opacity-80">Ultra (400%)</span>
              </button>

              <button
                class="flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer shadow-xs"
                [ngClass]="
                  store.scale() === 8
                    ? 'bg-[#e21b24] text-white border-[#e21b24] shadow-md shadow-[#e21b24]/30'
                    : 'border-[#132d52] bg-[#0c1e38] hover:bg-[#132d52] text-slate-200'
                "
                (click)="setScale(8)"
              >
                <span class="text-base font-black">8X</span>
                <span class="text-[10px] opacity-80">Max (800%)</span>
              </button>
            </div>
          </div>

          <!-- Enhancement Options -->
          <div class="space-y-3 pt-1 border-t border-[#132d52]">
            <div class="flex items-center justify-between p-3.5 rounded-xl border border-[#132d52] bg-[#0c1e38]">
              <div class="flex flex-col">
                <span class="text-xs font-bold text-slate-100">Neural Denoise & Edge Sharpen</span>
                <span class="text-[11px] text-slate-400">Restore soft edges and remove camera artifacts</span>
              </div>
              <input
                type="checkbox"
                [ngModel]="store.enhanceHd()"
                (ngModelChange)="store.enhanceHd.set($event); triggerUpscale()"
                class="h-4 w-4 rounded border-[#132d52] bg-[#040914] text-[#e21b24] accent-[#e21b24] focus:ring-[#e21b24] cursor-pointer"
              />
            </div>
          </div>

          <!-- Format & Export Config -->
          <div class="space-y-3 pt-1 border-t border-[#132d52]">
            <app-custom-select
              label="Export Master Format"
              [options]="exportOptions"
              [value]="store.targetFormat()"
              (valueChange)="onFormatChange($event)"
            ></app-custom-select>
          </div>
        </div>

        <div class="flex items-center gap-3 p-3.5 rounded-xl border border-[#132d52] bg-[#0c1e38] mt-2">
          <input
            type="checkbox"
            id="upscaleStripExif"
            [ngModel]="store.stripMetadata()"
            (ngModelChange)="store.stripMetadata.set($event); triggerUpscale()"
            class="h-4 w-4 rounded border-[#132d52] bg-[#040914] text-[#e21b24] accent-[#e21b24] focus:ring-[#e21b24] cursor-pointer"
          />
          <label for="upscaleStripExif" class="cursor-pointer select-none">
            <span class="block text-xs font-bold text-slate-100">Clean Camera & GPS Metadata</span>
            <span class="block text-[11px] text-slate-400">Strips metadata to keep exported image lightweight</span>
          </label>
        </div>
      </div>

      <!-- Right Visual Studio & Comparison Canvas -->
      <div
        class="lg:col-span-8 xl:col-span-8 rounded-2xl border border-[#242e42] bg-[#0e121a] shadow-xl p-6 sm:p-7 flex flex-col justify-between gap-6 h-full"
      >
        <div class="flex flex-col gap-5 flex-1">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1b2232] pb-4">
            <div class="flex items-center gap-3">
              <h3 class="text-lg font-black tracking-wide text-white">
                Super Resolution Split Viewer
              </h3>
              <span
                *ngIf="store.compressionResult()"
                class="inline-flex items-center rounded-full border border-[#00d2ff]/40 bg-[#00d2ff]/10 px-3 py-0.5 text-xs font-extrabold text-[#00d2ff] shadow-xs"
              >
                {{ store.scale() }}x Upscaled ({{ store.compressionResult()?.width }}x{{ store.compressionResult()?.height }})
              </span>
            </div>

            <div *ngIf="store.previewCompressedUrl()">
              <button
                class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-xs font-bold transition-all bg-[#ef233c] hover:bg-[#d90429] text-white shadow-lg shadow-[#ef233c]/25 border border-[#ef233c] h-9 px-4 cursor-pointer active:scale-98"
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
                <span>Download {{ store.scale() }}x {{ store.targetFormat() }}</span>
              </button>
            </div>
          </div>

          <!-- Comparison Canvas -->
          <div class="flex flex-col gap-5 flex-1" *ngIf="store.previewOriginalUrl(); else emptyState">
            <div
              class="relative w-full flex-1 min-h-115 bg-[#080a0f] border border-[#242e42] rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center select-none"
            >
              <!-- Upscaled Image (Base Layer) -->
              <img
                [src]="store.previewCompressedUrl() || store.previewOriginalUrl()"
                class="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                alt="Upscaled Preview"
              />

              <!-- Original Image (Clipped Layer) -->
              <img
                [src]="store.previewOriginalUrl()"
                class="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-10"
                [style.clip-path]="'inset(0 ' + (100 - store.sliderPosition()) + '% 0 0)'"
                alt="Original Preview"
              />

              <!-- Divider Line & Handle -->
              <div
                class="absolute top-0 bottom-0 w-0.5 bg-[#ef233c] pointer-events-none shadow-[0_0_12px_#ef233c] z-20"
                [style.left.%]="store.sliderPosition()"
              >
                <div
                  class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#ef233c] shadow-lg flex items-center justify-center text-white border-2 border-white"
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

              <!-- Solid Badges (NO GLASS) -->
              <div
                class="absolute top-3 left-3 bg-[#0e121a] border border-[#242e42] text-slate-200 text-[11px] font-bold px-3 py-1 rounded-lg z-20 shadow-md"
              >
                Original Resolution
              </div>
              <div
                class="absolute top-3 right-3 bg-[#ef233c] border border-[#ef233c] text-white text-[11px] font-extrabold px-3 py-1 rounded-lg z-20 shadow-md shadow-[#ef233c]/30 flex items-center gap-1.5"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-[#00d2ff] animate-pulse"></span>
                <span>{{ store.scale() }}x HD Super-Resolution</span>
              </div>
            </div>

            <!-- Live Metrics Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div class="p-3.5 bg-[#141a26] border border-[#242e42] rounded-xl">
                <span class="text-[11px] font-bold text-slate-400 block">Original Size</span>
                <span class="text-sm font-bold text-white font-mono mt-0.5 block">
                  {{ formatBytes(store.compressionResult()?.originalSizeBytes || 0) }}
                </span>
              </div>

              <div class="p-3.5 bg-[#141a26] border border-[#ef233c]/40 rounded-xl">
                <span class="text-[11px] font-bold text-[#ef233c] block">Output File Size</span>
                <span class="text-sm font-bold text-[#ef233c] font-mono mt-0.5 block">
                  {{ formatBytes(store.compressionResult()?.compressedSizeBytes || 0) }}
                </span>
              </div>

              <div class="p-3.5 bg-[#141a26] border border-[#00d2ff]/40 rounded-xl">
                <span class="text-[11px] font-bold text-[#00d2ff] block">Pixel Density Boost</span>
                <span class="text-sm font-bold text-[#00d2ff] font-mono mt-0.5 block">
                  {{ getPixelMultiplier() }} Higher
                </span>
              </div>

              <div class="p-3.5 bg-[#141a26] border border-[#242e42] rounded-xl">
                <span class="text-[11px] font-bold text-slate-400 block">Processing Time / Res</span>
                <span class="text-sm font-bold text-slate-200 font-mono mt-0.5 block">
                  {{ store.compressionResult()?.durationMs }}ms · {{ store.compressionResult()?.width }}x{{ store.compressionResult()?.height }}
                </span>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <ng-template #emptyState>
            <div
              class="w-full flex-1 min-h-135 h-full rounded-2xl border-2 border-dashed border-[#242e42] bg-[#141a26]/50 flex flex-col items-center justify-center p-8 text-center"
            >
              <div
                class="w-16 h-16 rounded-2xl bg-[#0e121a] border border-[#242e42] flex items-center justify-center text-[#ef233c] shadow-lg mb-4"
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                >
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                  <circle cx="9" cy="9" r="2" />
                </svg>
              </div>
              <h4 class="text-base font-bold text-white">No Image Uploaded for Upscaling</h4>
              <p class="text-xs text-slate-400 mt-1 max-w-sm">
                Upload any low-resolution or compressed image from the left panel to upscale it to 2K/4K with high detail restoration.
              </p>
            </div>
          </ng-template>
        </div>
      </div>
    </section>
  `
})
export class UpscaleComponent {
  store = inject(CompressionStore);

  formatBytes = formatBytes;

  ngOnInit() {
    if (this.store.scale() === 1) {
      this.store.scale.set(2);
      this.store.enhanceHd.set(true);
      this.store.quality.set(95);
    }
  }

  setScale(scale: number) {
    this.store.scale.set(scale);
    this.store.enhanceHd.set(true);
    this.triggerUpscale();
  }

  triggerUpscale() {
    if (this.store.selectedFile()) {
      this.store.compress();
    }
  }

  getPixelMultiplier(): string {
    const scale = this.store.scale();
    const multiplier = (scale * scale).toFixed(1);
    return `${multiplier}x`;
  }

  exportOptions: SelectOption[] = [
    { label: 'PNG (Lossless Master)', value: 'Png', badge: 'HD Lossless', description: 'Recommended for maximum sharpness' },
    { label: 'WebP (Optimized)', value: 'WebP', description: 'High compression with alpha transparency' },
    { label: 'JPEG (Photo)', value: 'Jpeg', description: 'Standard high-compatibility image' }
  ];

  onFormatChange(format: string) {
    this.store.targetFormat.set(format as 'WebP' | 'Jpeg' | 'Png' | 'Gif');
    this.triggerUpscale();
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onFileDropped(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.store.setFile(event.dataTransfer.files[0]);
    }
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.store.setFile(input.files[0]);
    }
  }

  download() {
    const res = this.store.compressionResult();
    const url = this.store.previewCompressedUrl();
    if (!res || !url) return;

    const a = document.createElement('a');
    a.href = url;
    a.download = `upscaled-${this.store.scale()}x-${res.fileName}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

