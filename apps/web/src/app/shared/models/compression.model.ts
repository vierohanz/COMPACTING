export interface CompressionOptions {
  quality: number;
  format: string;
  maxWidth?: number;
  maxHeight?: number;
  stripMetadata: boolean;
  lossless: boolean;
}

export interface CompressionResult {
  fileName: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  bytesSaved: number;
  compressionRatioPercent: number;
  durationMs: number;
  contentType: string;
  sourceFormat: string;
  targetFormat: string;
  base64Data?: string;
}
