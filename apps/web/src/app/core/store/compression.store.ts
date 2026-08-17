import { Injectable, computed, inject, signal } from '@angular/core';
import {
  AnalyticsSummary,
  FormatBreakdown,
  RecentCompressionItem
} from '../../shared/models/analytics.model';
import { ApiKeyDto } from '../../shared/models/api-key.model';
import { CompressionOptions, CompressionResult } from '../../shared/models/compression.model';
import { NavigationTab } from '../config/navigation.config';
import { ApiService } from '../services/api.service';

@Injectable({
  providedIn: 'root'
})
export class CompressionStore {
  private api = inject(ApiService);

  readonly activeTab = signal<NavigationTab>('playground');
  readonly isCompressing = signal<boolean>(false);
  readonly selectedFile = signal<File | null>(null);
  readonly previewOriginalUrl = signal<string | null>(null);
  readonly previewCompressedUrl = signal<string | null>(null);
  readonly compressionResult = signal<CompressionResult | null>(null);
  readonly sliderPosition = signal<number>(50);

  readonly quality = signal<number>(80);
  readonly targetFormat = signal<string>('WebP');
  readonly stripMetadata = signal<boolean>(true);
  readonly lossless = signal<boolean>(false);
  readonly maxWidth = signal<number | null>(null);
  readonly maxHeight = signal<number | null>(null);

  readonly apiKeys = signal<ApiKeyDto[]>([]);
  readonly isCreatingKey = signal<boolean>(false);
  readonly createdKeySecret = signal<string | null>(null);

  readonly summary = signal<AnalyticsSummary | null>(null);
  readonly recentCompressions = signal<RecentCompressionItem[]>([]);
  readonly formatBreakdown = signal<FormatBreakdown[]>([]);

  readonly bandwidthSavedPercent = computed(() => {
    return this.compressionResult()?.compressionRatioPercent ?? 0;
  });

  setTab(tab: NavigationTab) {
    this.activeTab.set(tab);
    if (tab === 'analytics') this.loadAnalytics();
    if (tab === 'apikeys') this.loadApiKeys();
  }

  setFile(file: File) {
    this.selectedFile.set(file);
    this.previewOriginalUrl.set(URL.createObjectURL(file));
    this.previewCompressedUrl.set(null);
    this.compressionResult.set(null);
    this.compress();
  }

  setPreset(type: 'speed' | 'balanced' | 'ultra' | 'lossless') {
    if (type === 'speed') {
      this.quality.set(65);
      this.lossless.set(false);
      this.targetFormat.set('WebP');
    } else if (type === 'balanced') {
      this.quality.set(80);
      this.lossless.set(false);
      this.targetFormat.set('WebP');
    } else if (type === 'ultra') {
      this.quality.set(90);
      this.lossless.set(false);
      this.targetFormat.set('WebP');
    } else if (type === 'lossless') {
      this.quality.set(100);
      this.lossless.set(true);
      this.targetFormat.set('WebP');
    }

    if (this.selectedFile()) {
      this.compress();
    }
  }

  compress() {
    const file = this.selectedFile();
    if (!file) return;

    const options: CompressionOptions = {
      quality: this.quality(),
      format: this.targetFormat(),
      maxWidth: this.maxWidth() || undefined,
      maxHeight: this.maxHeight() || undefined,
      stripMetadata: this.stripMetadata(),
      lossless: this.lossless()
    };

    this.isCompressing.set(true);
    this.api.compressImage(file, options).subscribe({
      next: res => {
        this.isCompressing.set(false);
        this.compressionResult.set(res);
        if (res.base64Data) {
          this.previewCompressedUrl.set(`data:${res.contentType};base64,${res.base64Data}`);
        }
        this.loadAnalytics();
      },
      error: () => {
        this.isCompressing.set(false);
      }
    });
  }

  loadApiKeys() {
    this.api.getApiKeys().subscribe({
      next: keys => this.apiKeys.set(keys)
    });
  }

  createKey(name: string, rateLimit = 120, expiresInDays?: number) {
    if (!name.trim()) return;
    this.isCreatingKey.set(true);
    this.api.createApiKey({ name, rateLimitPerMin: rateLimit, expiresInDays }).subscribe({
      next: res => {
        this.isCreatingKey.set(false);
        this.createdKeySecret.set(res.rawApiKey);
        this.loadApiKeys();
      },
      error: () => this.isCreatingKey.set(false)
    });
  }

  revokeKey(id: string) {
    this.api.revokeApiKey(id).subscribe({
      next: () => this.loadApiKeys()
    });
  }

  loadAnalytics() {
    this.api.getAnalyticsSummary().subscribe({
      next: data => this.summary.set(data)
    });
    this.api.getRecentCompressions().subscribe({
      next: data => this.recentCompressions.set(data)
    });
    this.api.getFormatBreakdown().subscribe({
      next: data => this.formatBreakdown.set(data)
    });
  }
}
