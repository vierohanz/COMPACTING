export interface CompressionOptions {
  quality: number;
  format: string;
  maxWidth?: number;
  maxHeight?: number;
  stripMetadata: boolean;
  lossless: boolean;
  scale?: number;
  enhanceHd?: boolean;
  sharpen?: number;
}

export interface CompressionResult {
  success?: boolean;
  fileName: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  bytesSaved: number;
  compressionRatioPercent: number;
  width?: number;
  height?: number;
  durationMs: number;
  contentType: string;
  sourceFormat: string;
  targetFormat: string;
  base64Data?: string;
  errorMessage?: string;
}
