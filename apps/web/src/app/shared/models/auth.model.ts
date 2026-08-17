export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  metadata: Record<string, unknown>;
  data: T;
}

export interface AuthUserDto {
  id: string;
  email: string;
  fullName: string;
  role: string;
  createdAt: string;
}

export interface AuthDataDto {
  accessToken: string;
  expiresInSeconds: number;
  user: AuthUserDto;
  refreshToken?: string;
  tokenType: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}
