export interface AnalyticsSummary {
  totalImagesCompressed: number;
  totalOriginalBytes: number;
  totalCompressedBytes: number;
  totalBytesSaved: number;
  averageSavingsPercentage: number;
  averageDurationMs: number;
}

export interface RecentCompressionItem {
  id: string;
  fileName: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  bytesSaved: number;
  compressionRatioPercent: number;
  durationMs: number;
  sourceFormat: string;
  targetFormat: string;
  createdAt: string;
}

export interface FormatBreakdown {
  format: string;
  count: number;
  totalBytesSaved: number;
  percentage: number;
}
