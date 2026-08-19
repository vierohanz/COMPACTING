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
  private currentObjectUrl: string | null = null;

  readonly activeTab = signal<NavigationTab>('playground');
  readonly mode = signal<'single' | 'batch'>('single');
  readonly isCompressing = signal<boolean>(false);
  readonly isBatchCompressing = signal<boolean>(false);
  readonly selectedFile = signal<File | null>(null);
  readonly batchFiles = signal<File[]>([]);
  readonly batchResults = signal<CompressionResult[]>([]);
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
  readonly scale = signal<number>(1);
  readonly enhanceHd = signal<boolean>(false);
  readonly sharpen = signal<number>(0);

  readonly apiKeys = signal<ApiKeyDto[]>([]);
  readonly isCreatingKey = signal<boolean>(false);
  readonly createdKeySecret = signal<string | null>(null);

  readonly summary = signal<AnalyticsSummary | null>(null);
  readonly recentCompressions = signal<RecentCompressionItem[]>([]);
  readonly formatBreakdown = signal<FormatBreakdown[]>([]);

  readonly bandwidthSavedPercent = computed(() => {
    return this.compressionResult()?.compressionRatioPercent ?? 0;
  });

  readonly totalBatchBytesSaved = computed(() => {
    return this.batchResults().reduce((acc, curr) => acc + (curr.bytesSaved || 0), 0);
  });

  readonly totalBatchOriginalBytes = computed(() => {
    return this.batchResults().reduce((acc, curr) => acc + (curr.originalSizeBytes || 0), 0);
  });

  readonly batchSavedPercent = computed(() => {
    const orig = this.totalBatchOriginalBytes();
    if (orig === 0) return 0;
    return Math.round((this.totalBatchBytesSaved() / orig) * 100);
  });

  setTab(tab: NavigationTab) {
    this.activeTab.set(tab);
    if (tab === 'analytics') this.loadAnalytics();
    if (tab === 'apikeys') this.loadApiKeys();
  }

  setMode(mode: 'single' | 'batch') {
    this.mode.set(mode);
  }

  setFile(file: File) {
    if (this.currentObjectUrl) {
      URL.revokeObjectURL(this.currentObjectUrl);
    }
    this.currentObjectUrl = URL.createObjectURL(file);
    this.selectedFile.set(file);
    this.previewOriginalUrl.set(this.currentObjectUrl);
    this.previewCompressedUrl.set(null);
    this.compressionResult.set(null);
    this.compress();
  }

  setBatchFiles(files: File[]) {
    this.batchFiles.set(files);
    this.batchResults.set([]);
    if (files.length > 0) {
      this.compressBatch();
    }
  }

  setPreset(type: 'speed' | 'balanced' | 'ultra' | 'lossless' | 'hdUpscale') {
    if (type === 'speed') {
      this.quality.set(65);
      this.lossless.set(false);
      this.scale.set(1);
      this.enhanceHd.set(false);
    } else if (type === 'balanced') {
      this.quality.set(80);
      this.lossless.set(false);
      this.scale.set(1);
      this.enhanceHd.set(false);
    } else if (type === 'ultra') {
      this.quality.set(90);
      this.lossless.set(false);
      this.scale.set(1);
      this.enhanceHd.set(false);
    } else if (type === 'lossless') {
      this.quality.set(100);
      this.lossless.set(true);
      this.scale.set(1);
      this.enhanceHd.set(false);
    } else if (type === 'hdUpscale') {
      this.quality.set(90);
      this.lossless.set(false);
      this.scale.set(2);
      this.enhanceHd.set(true);
    }

    if (this.mode() === 'single' && this.selectedFile()) {
      this.compress();
    } else if (this.mode() === 'batch' && this.batchFiles().length > 0) {
      this.compressBatch();
    }
  }

  private buildOptions(): CompressionOptions {
    return {
      quality: this.quality(),
      format: this.targetFormat(),
      maxWidth: this.maxWidth() || undefined,
      maxHeight: this.maxHeight() || undefined,
      stripMetadata: this.stripMetadata(),
      lossless: this.lossless(),
      scale: this.scale(),
      enhanceHd: this.enhanceHd(),
      sharpen: this.sharpen()
    };
  }

  compress() {
    const file = this.selectedFile();
    if (!file) return;

    const options = this.buildOptions();

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

  compressBatch() {
    const files = this.batchFiles();
    if (files.length === 0) return;

    const options = this.buildOptions();

    this.isBatchCompressing.set(true);
    this.api.compressBatch(files, options).subscribe({
      next: results => {
        this.isBatchCompressing.set(false);
        this.batchResults.set(results);
        this.loadAnalytics();
      },
      error: () => {
        this.isBatchCompressing.set(false);
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

  readonly analyticsScope = signal<'personal' | 'global'>('personal');

  revokeKey(id: string) {
    this.api.revokeApiKey(id).subscribe({
      next: () => this.loadApiKeys()
    });
  }

  setAnalyticsScope(scope: 'personal' | 'global') {
    this.analyticsScope.set(scope);
    this.loadAnalytics(scope === 'global');
  }

  loadAnalytics(global?: boolean) {
    const isGlobal = global !== undefined ? global : this.analyticsScope() === 'global';
    this.api.getAnalyticsSummary(isGlobal).subscribe({
      next: data => this.summary.set(data)
    });
    this.api.getRecentCompressions(20, isGlobal).subscribe({
      next: data => this.recentCompressions.set(data)
    });
    this.api.getFormatBreakdown(isGlobal).subscribe({
      next: data => this.formatBreakdown.set(data)
    });
  }
}
