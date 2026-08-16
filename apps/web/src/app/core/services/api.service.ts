import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AnalyticsSummary,
  FormatBreakdown,
  RecentCompressionItem
} from '../../shared/models/analytics.model';
import {
  ApiKeyCreatedResponse,
  ApiKeyDto,
  CreateApiKeyRequest
} from '../../shared/models/api-key.model';
import {
  CompressionOptions,
  CompressionResult
} from '../../shared/models/compression.model';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = API_CONFIG.baseUrl;

  compressImage(
    file: File,
    options: CompressionOptions
  ): Observable<CompressionResult> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    let params = new HttpParams()
      .set('quality', options.quality.toString())
      .set('format', options.format)
      .set('stripMetadata', options.stripMetadata.toString())
      .set('lossless', options.lossless.toString());

    if (options.maxWidth)
      params = params.set('maxWidth', options.maxWidth.toString());
    if (options.maxHeight)
      params = params.set('maxHeight', options.maxHeight.toString());

    return this.http.post<CompressionResult>(
      `${this.baseUrl}${API_CONFIG.endpoints.compressJson}`,
      formData,
      { params }
    );
  }

  getApiKeys(): Observable<ApiKeyDto[]> {
    return this.http.get<ApiKeyDto[]>(
      `${this.baseUrl}${API_CONFIG.endpoints.apiKeys}`
    );
  }

  createApiKey(
    request: CreateApiKeyRequest
  ): Observable<ApiKeyCreatedResponse> {
    return this.http.post<ApiKeyCreatedResponse>(
      `${this.baseUrl}${API_CONFIG.endpoints.apiKeys}`,
      request
    );
  }

  revokeApiKey(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}${API_CONFIG.endpoints.apiKeys}/${id}`
    );
  }

  getAnalyticsSummary(): Observable<AnalyticsSummary> {
    return this.http.get<AnalyticsSummary>(
      `${this.baseUrl}${API_CONFIG.endpoints.analyticsSummary}`
    );
  }

  getRecentCompressions(): Observable<RecentCompressionItem[]> {
    return this.http.get<RecentCompressionItem[]>(
      `${this.baseUrl}${API_CONFIG.endpoints.analyticsRecent}`
    );
  }

  getFormatBreakdown(): Observable<FormatBreakdown[]> {
    return this.http.get<FormatBreakdown[]>(
      `${this.baseUrl}${API_CONFIG.endpoints.analyticsFormats}`
    );
  }
}
