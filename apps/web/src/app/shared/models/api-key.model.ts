export interface ApiKeyDto {
  id: string;
  name: string;
  keyPrefix: string;
  rateLimitPerMin: number;
  totalRequests: number;
  totalBytesSaved: number;
  createdAt: string;
  expiresAt?: string;
  isRevoked: boolean;
}

export interface CreateApiKeyRequest {
  name: string;
  rateLimitPerMin?: number;
  expiresInDays?: number;
}

export interface ApiKeyCreatedResponse {
  id: string;
  name: string;
  keyPrefix: string;
  rawApiKey: string;
  rateLimitPerMin: number;
  expiresAt?: string;
}
