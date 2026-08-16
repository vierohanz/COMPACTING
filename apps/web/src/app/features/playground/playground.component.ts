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
    <section class="playground-layout">
      <div class="control-panel glass-panel">
        <div class="panel-header">
          <h2>Compression Studio</h2>
          <p>Tweak quality, resizing, and convert formats in real-time.</p>
        </div>

        <div
          class="dropzone"
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
          <div class="dropzone-icon">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#10B981"
              stroke-width="2"
            >
              <path
                d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"
              />
            </svg>
          </div>
          <div class="dropzone-text">
            <p class="primary-text">
              {{
                store.selectedFile()
                  ? store.selectedFile()?.name
                  : 'Drop image here or click to browse'
              }}
            </p>
            <span class="sub-text"
              >Supports JPEG, PNG, WebP, GIF, BMP, TIFF</span
            >
          </div>
        </div>

        <div class="presets-section">
          <label class="field-label">Quick Presets</label>
          <div class="preset-buttons">
            <button
              class="preset-btn"
              [class.active-preset]="
                store.quality() === 65 && !store.lossless()
              "
              (click)="store.setPreset('speed')"
            >
              Fast (65%)
            </button>
            <button
              class="preset-btn"
              [class.active-preset]="
                store.quality() === 80 && !store.lossless()
              "
              (click)="store.setPreset('balanced')"
            >
              Balanced (80%)
            </button>
            <button
              class="preset-btn"
              [class.active-preset]="
                store.quality() === 90 && !store.lossless()
              "
              (click)="store.setPreset('ultra')"
            >
              High Quality (90%)
            </button>
            <button
              class="preset-btn"
              [class.active-preset]="store.lossless()"
              (click)="store.setPreset('lossless')"
            >
              Lossless
            </button>
          </div>
        </div>

        <div class="settings-grid">
          <div class="setting-item">
            <div class="setting-header">
              <label>Quality</label>
              <span class="value-tag">{{ store.quality() }}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              [ngModel]="store.quality()"
              (ngModelChange)="store.quality.set($event); store.compress()"
              class="range-slider"
            />
          </div>

          <div class="setting-item">
            <label class="field-label">Output Format</label>
            <select
              [ngModel]="store.targetFormat()"
              (ngModelChange)="store.targetFormat.set($event); store.compress()"
              class="custom-select"
            >
              <option value="WebP">WebP (Recommended)</option>
              <option value="Jpeg">JPEG</option>
              <option value="Png">PNG</option>
              <option value="Gif">GIF</option>
            </select>
          </div>

          <div class="setting-item dual-inputs">
            <div>
              <label class="field-label">Max Width (px)</label>
              <input
                type="number"
                [ngModel]="store.maxWidth()"
                (ngModelChange)="store.maxWidth.set($event); store.compress()"
                placeholder="Auto"
                class="custom-input"
              />
            </div>
            <div>
              <label class="field-label">Max Height (px)</label>
              <input
                type="number"
                [ngModel]="store.maxHeight()"
                (ngModelChange)="store.maxHeight.set($event); store.compress()"
                placeholder="Auto"
                class="custom-input"
              />
            </div>
          </div>

          <div class="setting-toggle">
            <label class="toggle-container">
              <input
                type="checkbox"
                [ngModel]="store.stripMetadata()"
                (ngModelChange)="
                  store.stripMetadata.set($event); store.compress()
                "
              />
              <span class="toggle-slider"></span>
            </label>
            <div class="toggle-text">
              <span class="toggle-title">Strip EXIF / Privacy Metadata</span>
              <span class="toggle-desc"
                >Removes camera info, GPS location, and timestamps</span
              >
            </div>
          </div>
        </div>
      </div>

      <div class="preview-panel glass-panel">
        <div class="preview-header">
          <div class="preview-title">
            <h3>Visual Comparison Slider</h3>
            <span *ngIf="store.compressionResult()" class="badge badge-emerald">
              {{ store.compressionResult()?.compressionRatioPercent }}% Saved
            </span>
          </div>

          <div *ngIf="store.previewCompressedUrl()" class="preview-actions">
            <button class="btn-primary" (click)="download()">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
                />
              </svg>
              <span>Download {{ store.targetFormat() }}</span>
            </button>
          </div>
        </div>

        <div
          class="comparison-stage"
          *ngIf="store.previewOriginalUrl(); else emptyState"
        >
          <div class="comparison-container">
            <img
              [src]="store.previewCompressedUrl() || store.previewOriginalUrl()"
              class="comparison-img compressed-layer"
              alt="Compressed Preview"
            />

            <div
              class="original-layer"
              [style.width.%]="store.sliderPosition()"
            >
              <img
                [src]="store.previewOriginalUrl()"
                class="comparison-img"
                alt="Original Preview"
              />
            </div>

            <div class="slider-divider" [style.left.%]="store.sliderPosition()">
              <div class="slider-handle">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M8 7l-5 5 5 5M16 7l5 5-5 5" />
                </svg>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              [value]="store.sliderPosition()"
              (input)="onSliderInput($event)"
              class="slider-range-overlay"
            />

            <span class="layer-badge badge-left">Original</span>
            <span class="layer-badge badge-right"
              >Compressed ({{ store.targetFormat() }})</span
            >
          </div>

          <div *ngIf="store.compressionResult()" class="metrics-bar">
            <div class="metric-card">
              <span class="metric-label">Original Size</span>
              <span class="metric-value">{{
                formatBytes(store.compressionResult()!.originalSizeBytes)
              }}</span>
            </div>
            <div class="metric-card highlight-green">
              <span class="metric-label">Compressed Size</span>
              <span class="metric-value">{{
                formatBytes(store.compressionResult()!.compressedSizeBytes)
              }}</span>
            </div>
            <div class="metric-card highlight-cyan">
              <span class="metric-label">Bandwidth Saved</span>
              <span class="metric-value"
                >-{{
                  store.compressionResult()!.compressionRatioPercent
                }}%</span
              >
            </div>
            <div class="metric-card">
              <span class="metric-label">Engine Latency</span>
              <span class="metric-value"
                >{{ store.compressionResult()!.durationMs }} ms</span
              >
            </div>
          </div>
        </div>

        <ng-template #emptyState>
          <div class="empty-stage">
            <div class="empty-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <h4>No Image Selected</h4>
            <p>
              Upload an image on the left to see instant visual compression and
              side-by-side comparison.
            </p>
          </div>
        </ng-template>
      </div>
    </section>
  `,
  styles: [
    `
      .playground-layout {
        display: grid;
        grid-template-columns: 420px 1fr;
        gap: 24px;
      }
      @media (max-width: 1024px) {
        .playground-layout {
          grid-template-columns: 1fr;
        }
      }
      .control-panel,
      .preview-panel {
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .panel-header h2 {
        font-size: 1.25rem;
        font-weight: 700;
        margin-bottom: 4px;
      }
      .panel-header p {
        font-size: 0.85rem;
        color: var(--text-muted);
      }
      .dropzone {
        border: 2px dashed rgba(16, 185, 129, 0.4);
        background: rgba(16, 185, 129, 0.03);
        border-radius: var(--radius-lg);
        padding: 28px;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
      }
      .dropzone:hover {
        border-color: #10b981;
        background: rgba(16, 185, 129, 0.08);
        transform: scale(1.01);
      }
      .primary-text {
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--text-main);
      }
      .sub-text {
        font-size: 0.75rem;
        color: var(--text-subtle);
      }
      .preset-buttons {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
        margin-top: 6px;
      }
      .preset-btn {
        padding: 8px;
        background: var(--bg-surface-elevated);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-sm);
        color: var(--text-muted);
        font-size: 0.8rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      .preset-btn:hover {
        border-color: var(--border-hover);
        color: var(--text-main);
      }
      .preset-btn.active-preset {
        background: rgba(16, 185, 129, 0.15);
        border-color: #10b981;
        color: #34d399;
      }
      .settings-grid {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .field-label {
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--text-muted);
        margin-bottom: 6px;
        display: block;
      }
      .setting-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
        font-size: 0.8rem;
        font-weight: 600;
      }
      .value-tag {
        color: #10b981;
        font-family: var(--font-mono);
      }
      .range-slider {
        width: 100%;
        accent-color: #10b981;
      }
      .custom-select,
      .custom-input {
        width: 100%;
        background: var(--bg-surface-elevated);
        border: 1px solid var(--border-subtle);
        padding: 10px 14px;
        border-radius: var(--radius-sm);
        color: var(--text-main);
        font-size: 0.875rem;
        outline: none;
        transition: all 0.2s;
      }
      .custom-select:focus,
      .custom-input:focus {
        border-color: #10b981;
        box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
      }
      .dual-inputs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .setting-toggle {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: var(--radius-md);
        border: 1px solid var(--border-subtle);
      }
      .toggle-container {
        position: relative;
        display: inline-block;
        width: 38px;
        height: 22px;
      }
      .toggle-container input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      .toggle-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: var(--bg-surface-elevated);
        transition: 0.3s;
        border-radius: 22px;
        border: 1px solid var(--border-subtle);
      }
      .toggle-slider:before {
        position: absolute;
        content: '';
        height: 14px;
        width: 14px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: 0.3s;
        border-radius: 50%;
      }
      input:checked + .toggle-slider {
        background-color: #10b981;
      }
      input:checked + .toggle-slider:before {
        transform: translateX(16px);
      }
      .toggle-title {
        display: block;
        font-size: 0.85rem;
        font-weight: 600;
      }
      .toggle-desc {
        font-size: 0.75rem;
        color: var(--text-muted);
      }
      .preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .comparison-stage {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .comparison-container {
        position: relative;
        width: 100%;
        height: 480px;
        background: #050810;
        border-radius: var(--radius-lg);
        overflow: hidden;
        border: 1px solid var(--border-subtle);
      }
      .comparison-img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
        user-select: none;
      }
      .original-layer {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        overflow: hidden;
      }
      .original-layer .comparison-img {
        width: 100%;
        min-width: 100%;
        height: 100%;
        object-fit: contain;
      }
      .slider-divider {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 2px;
        background: #ffffff;
        box-shadow: 0 0 12px rgba(0, 0, 0, 0.8);
        pointer-events: none;
      }
      .slider-handle {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 32px;
        height: 32px;
        background: #10b981;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 15px rgba(16, 185, 129, 0.6);
      }
      .slider-range-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: ew-resize;
        z-index: 10;
      }
      .layer-badge {
        position: absolute;
        top: 14px;
        padding: 4px 10px;
        font-size: 0.75rem;
        font-weight: 700;
        border-radius: 6px;
        background: rgba(0, 0, 0, 0.65);
        backdrop-filter: blur(8px);
        border: 1px solid var(--border-subtle);
        pointer-events: none;
      }
      .badge-left {
        left: 14px;
        color: #f8fafc;
      }
      .badge-right {
        right: 14px;
        color: #34d399;
      }
      .metrics-bar {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
      }
      .metric-card {
        background: var(--bg-surface-elevated);
        border: 1px solid var(--border-subtle);
        padding: 12px 16px;
        border-radius: var(--radius-md);
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .metric-card.highlight-green {
        border-color: rgba(16, 185, 129, 0.3);
        background: rgba(16, 185, 129, 0.05);
      }
      .metric-card.highlight-cyan {
        border-color: rgba(6, 182, 212, 0.3);
        background: rgba(6, 182, 212, 0.05);
      }
      .metric-label {
        font-size: 0.75rem;
        color: var(--text-muted);
        font-weight: 500;
      }
      .metric-value {
        font-size: 1.15rem;
        font-weight: 700;
        font-family: var(--font-mono);
      }
      .empty-stage {
        height: 480px;
        border: 1px dashed var(--border-subtle);
        border-radius: var(--radius-lg);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        color: var(--text-muted);
        text-align: center;
        padding: 24px;
      }
      .empty-icon {
        color: var(--text-muted);
      }
    `
  ]
})
export class PlaygroundComponent {
  store = inject(CompressionStore);
  formatBytes = formatBytes;

  onFileDropped(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.store.setFile(event.dataTransfer.files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.store.setFile(input.files[0]);
    }
  }

  onSliderInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.store.sliderPosition.set(Number(input.value));
  }

  download() {
    const url = this.store.previewCompressedUrl();
    const result = this.store.compressionResult();
    if (!url || !result) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = result.fileName;
    a.click();
  }
}
