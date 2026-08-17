import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthUserDto, LoginRequest, RegisterRequest } from '../../shared/models/auth.model';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthStore {
  private authService = inject(AuthService);

  readonly currentUser = signal<AuthUserDto | null>(null);
  readonly accessToken = signal<string | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly authError = signal<string | null>(null);
  readonly isAuthModalOpen = signal<boolean>(false);
  readonly authMode = signal<'login' | 'register'>('login');

  readonly isAuthenticated = computed(() => !!this.currentUser());

  private refreshTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    const savedToken = localStorage.getItem('compacting_access_token');
    if (savedToken) {
      this.accessToken.set(savedToken);
    }
  }

  checkSession() {
    this.authService.refreshToken().subscribe({
      next: res => {
        if (res.success && res.data) {
          this.handleAuthSuccess(res.data.accessToken, res.data.user, res.data.expiresInSeconds);
        }
      },
      error: () => {
        this.clearSession();
      }
    });
  }

  login(request: LoginRequest) {
    this.isLoading.set(true);
    this.authError.set(null);

    this.authService.login(request).subscribe({
      next: res => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.handleAuthSuccess(res.data.accessToken, res.data.user, res.data.expiresInSeconds);
          this.closeModal();
        } else {
          this.authError.set(res.message || 'Login failed.');
        }
      },
      error: err => {
        this.isLoading.set(false);
        this.authError.set(err.error?.message || err.error?.error || 'Invalid email or password.');
      }
    });
  }

  register(request: RegisterRequest) {
    this.isLoading.set(true);
    this.authError.set(null);

    this.authService.register(request).subscribe({
      next: res => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.handleAuthSuccess(res.data.accessToken, res.data.user, res.data.expiresInSeconds);
          this.closeModal();
        } else {
          this.authError.set(res.message || 'Registration failed.');
        }
      },
      error: err => {
        this.isLoading.set(false);
        this.authError.set(
          err.error?.message || err.error?.error || 'Registration failed. Try another email.'
        );
      }
    });
  }

  logout() {
    this.authService.revokeToken().subscribe({
      next: () => this.clearSession(),
      error: () => this.clearSession()
    });
  }

  openModal(mode: 'login' | 'register' = 'login') {
    this.authMode.set(mode);
    this.authError.set(null);
    this.isAuthModalOpen.set(true);
  }

  closeModal() {
    this.isAuthModalOpen.set(false);
    this.authError.set(null);
  }

  toggleMode() {
    this.authMode.set(this.authMode() === 'login' ? 'register' : 'login');
    this.authError.set(null);
  }

  private handleAuthSuccess(accessToken: string, user: AuthUserDto, expiresInSeconds: number) {
    this.accessToken.set(accessToken);
    this.currentUser.set(user);
    localStorage.setItem('compacting_access_token', accessToken);

    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    const refreshDelayMs = Math.max((expiresInSeconds - 60) * 1000, 10000);
    this.refreshTimer = setTimeout(() => {
      this.checkSession();
    }, refreshDelayMs);
  }

  private clearSession() {
    this.accessToken.set(null);
    this.currentUser.set(null);
    localStorage.removeItem('compacting_access_token');
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
}
