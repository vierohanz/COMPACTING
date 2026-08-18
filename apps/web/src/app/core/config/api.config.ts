export const API_CONFIG = {
  baseUrl:
    typeof window !== 'undefined' && window.location.hostname !== 'localhost'
      ? `${window.location.origin}/api/v1`
      : 'http://localhost:5126/api/v1',
  endpoints: {
    compress: '/compression/compress',
    compressJson: '/compression/compress-json',
    batchCompress: '/compression/batch',
    apiKeys: '/apikeys',
    analyticsSummary: '/analytics/summary',
    analyticsRecent: '/analytics/recent',
    analyticsFormats: '/analytics/formats'
  }
};
