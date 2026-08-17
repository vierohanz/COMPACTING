import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthStore } from '../../core/store/auth.store';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      *ngIf="store.isAuthModalOpen()"
      (click)="onBackdropClick($event)"
    >
      <div
        class="relative w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-lg p-6 flex flex-col gap-5 overflow-hidden"
        (click)="$event.stopPropagation()"
      >
        <button
          class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-sm transition-opacity opacity-70 hover:opacity-100"
          (click)="store.closeModal()"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div class="text-center flex flex-col items-center gap-1.5 mt-1">
          <div
            class="w-10 h-10 rounded-lg bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-600 shadow-xs"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="#EC4899"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="#DB2777"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="#EC4899"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <h2 class="text-lg font-semibold tracking-tight text-slate-900">
            {{
              store.authMode() === 'login' ? 'Sign in to COMPACTING' : 'Create developer account'
            }}
          </h2>
          <p class="text-xs text-slate-500">
            {{
              store.authMode() === 'login'
                ? 'Enter your credentials to access your API keys and analytics'
                : 'Get started with high-performance image compression'
            }}
          </p>
        </div>

        <div
          class="h-9 items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-500 w-full grid grid-cols-2"
        >
          <button
            type="button"
            class="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium transition-all"
            [ngClass]="
              store.authMode() === 'login'
                ? 'bg-white text-slate-950 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            "
            (click)="store.openModal('login')"
          >
            <span>Sign In</span>
          </button>
          <button
            type="button"
            class="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium transition-all"
            [ngClass]="
              store.authMode() === 'register'
                ? 'bg-white text-slate-950 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            "
            (click)="store.openModal('register')"
          >
            <span>Register</span>
          </button>
        </div>

        <div
          *ngIf="store.authError()"
          class="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-medium"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#E11D48"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{{ store.authError() }}</span>
        </div>

        <form (ngSubmit)="handleSubmit()" class="space-y-3.5">
          <div *ngIf="store.authMode() === 'register'" class="space-y-1.5">
            <label class="text-xs font-medium text-slate-700">Full Name</label>
            <input
              type="text"
              [(ngModel)]="fullName"
              name="fullName"
              placeholder="Alex Mercer"
              class="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-500 text-slate-900 placeholder:text-slate-400"
              required
            />
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-medium text-slate-700">Email Address</label>
            <input
              type="email"
              [(ngModel)]="email"
              name="email"
              placeholder="developer@company.com"
              class="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-500 text-slate-900 placeholder:text-slate-400"
              required
            />
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-medium text-slate-700">Password</label>
            <div class="relative flex items-center">
              <input
                [type]="showPassword() ? 'text' : 'password'"
                [(ngModel)]="password"
                name="password"
                placeholder="Enter password"
                class="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 pr-9 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-500 text-slate-900 placeholder:text-slate-400"
                required
              />
              <button
                type="button"
                class="absolute right-2.5 text-slate-400 hover:text-slate-700"
                (click)="showPassword.set(!showPassword())"
              >
                <svg
                  *ngIf="!showPassword()"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg
                  *ngIf="showPassword()"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                  ></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </button>
            </div>
          </div>

          <button
            type="submit"
            class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-semibold transition-colors bg-pink-600 text-white shadow-xs hover:bg-pink-700 h-9 px-4 py-2 w-full mt-2 disabled:opacity-50"
            [disabled]="store.isLoading() || !email || !password"
          >
            <svg
              *ngIf="store.isLoading()"
              class="animate-spin mr-2"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
            </svg>
            <span *ngIf="!store.isLoading()">
              {{ store.authMode() === 'login' ? 'Sign In' : 'Create Account' }}
            </span>
            <span *ngIf="store.isLoading()">Authenticating...</span>
          </button>
        </form>

        <div class="text-center text-xs text-slate-500">
          <p>
            {{
              store.authMode() === 'login' ? "Don't have an account?" : 'Already have an account?'
            }}
            <button
              type="button"
              class="text-pink-600 font-semibold hover:underline ml-1"
              (click)="store.toggleMode()"
            >
              {{ store.authMode() === 'login' ? 'Sign up' : 'Sign in' }}
            </button>
          </p>
        </div>
      </div>
    </div>
  `
})
export class AuthComponent {
  store = inject(AuthStore);

  email = '';
  password = '';
  fullName = '';
  showPassword = signal(false);

  handleSubmit() {
    if (this.store.authMode() === 'login') {
      this.store.login({
        email: this.email,
        password: this.password
      });
    } else {
      this.store.register({
        email: this.email,
        password: this.password,
        fullName: this.fullName
      });
    }
  }

  onBackdropClick(_event: MouseEvent) {
    this.store.closeModal();
  }
}
