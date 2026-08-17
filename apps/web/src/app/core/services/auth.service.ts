import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ApiResponse,
  AuthDataDto,
  AuthUserDto,
  LoginRequest,
  RegisterRequest
} from '../../shared/models/auth.model';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = `${API_CONFIG.baseUrl}/auth`;

  login(request: LoginRequest): Observable<ApiResponse<AuthDataDto>> {
    return this.http.post<ApiResponse<AuthDataDto>>(`${this.baseUrl}/login`, request, {
      withCredentials: true
    });
  }

  register(request: RegisterRequest): Observable<ApiResponse<AuthDataDto>> {
    return this.http.post<ApiResponse<AuthDataDto>>(`${this.baseUrl}/register`, request, {
      withCredentials: true
    });
  }

  refreshToken(manualRefreshToken?: string): Observable<ApiResponse<AuthDataDto>> {
    return this.http.post<ApiResponse<AuthDataDto>>(
      `${this.baseUrl}/refresh`,
      { refreshToken: manualRefreshToken },
      { withCredentials: true }
    );
  }

  revokeToken(manualRefreshToken?: string): Observable<ApiResponse<object>> {
    return this.http.post<ApiResponse<object>>(
      `${this.baseUrl}/revoke`,
      { refreshToken: manualRefreshToken },
      { withCredentials: true }
    );
  }

  getCurrentUser(): Observable<ApiResponse<AuthUserDto>> {
    return this.http.get<ApiResponse<AuthUserDto>>(`${this.baseUrl}/me`, {
      withCredentials: true
    });
  }
}
