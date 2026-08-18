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
      class="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
      *ngIf="store.isAuthModalOpen()"
      (click)="onBackdropClick($event)"
    >
      <div
        class="relative w-full max-w-md bg-[#0e121a] border border-[#242e42] rounded-2xl shadow-2xl p-6 sm:p-7 flex flex-col gap-5 overflow-hidden"
        (click)="$event.stopPropagation()"
      >
        <button
          class="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
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

        <div class="text-center flex flex-col items-center gap-2 mt-1">
          <div
            class="w-12 h-12 rounded-2xl bg-[#ef233c] text-white flex items-center justify-center shadow-lg shadow-[#ef233c]/30 border border-[#ef233c]"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v6" />
              <path d="M12 16v6" />
              <path d="M4.93 4.93l4.24 4.24" />
              <path d="M14.83 14.83l4.24 4.24" />
              <path d="M2 12h6" />
              <path d="M16 12h6" />
            </svg>
          </div>
          <h2 class="text-xl font-black tracking-wide text-white">
            {{
              store.authMode() === 'login' ? 'Sign in to COMPACTING' : 'Create Developer Account'
            }}
          </h2>
          <p class="text-xs text-slate-400">
            {{
              store.authMode() === 'login'
                ? 'Enter your credentials to access your API keys and analytics'
                : 'Get started with high-performance image compression'
            }}
          </p>
        </div>

        <div
          class="h-10 items-center justify-center rounded-xl bg-[#080a0f] border border-[#1b2232] p-1 text-slate-400 w-full grid grid-cols-2"
        >
          <button
            type="button"
            class="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer"
            [ngClass]="
              store.authMode() === 'login'
                ? 'bg-[#ef233c] text-white shadow-md shadow-[#ef233c]/20'
                : 'text-slate-400 hover:text-white hover:bg-[#141a26]'
            "
            (click)="store.openModal('login')"
          >
            <span>Sign In</span>
          </button>
          <button
            type="button"
            class="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer"
            [ngClass]="
              store.authMode() === 'register'
                ? 'bg-[#ef233c] text-white shadow-md shadow-[#ef233c]/20'
                : 'text-slate-400 hover:text-white hover:bg-[#141a26]'
            "
            (click)="store.openModal('register')"
          >
            <span>Register</span>
          </button>
        </div>

        <div
          *ngIf="store.authError()"
          class="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-semibold"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{{ store.authError() }}</span>
        </div>

        <form (ngSubmit)="handleSubmit()" class="space-y-4">
          <div *ngIf="store.authMode() === 'register'" class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-200">Full Name</label>
            <input
              type="text"
              [(ngModel)]="fullName"
              name="fullName"
              placeholder="Peter Parker"
              class="flex h-10 w-full rounded-xl border border-[#242e42] bg-[#141a26] px-3.5 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef233c] text-white placeholder:text-slate-500"
              required
            />
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-200">Email Address</label>
            <input
              type="email"
              [(ngModel)]="email"
              name="email"
              placeholder="spidey@dailybugle.com"
              class="flex h-10 w-full rounded-xl border border-[#242e42] bg-[#141a26] px-3.5 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef233c] text-white placeholder:text-slate-500"
              required
            />
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-200">Password</label>
            <div class="relative flex items-center">
              <input
                [type]="showPassword() ? 'text' : 'password'"
                [(ngModel)]="password"
                name="password"
                placeholder="Enter secure password"
                class="flex h-10 w-full rounded-xl border border-[#242e42] bg-[#141a26] px-3.5 pr-10 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef233c] text-white placeholder:text-slate-500"
                required
              />
              <button
                type="button"
                class="absolute right-3 text-slate-400 hover:text-white cursor-pointer"
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
                  <line x1="1" y1="2" x2="23" y2="23"></line>
                </svg>
              </button>
            </div>
          </div>

          <button
            type="submit"
            class="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-bold transition-all bg-[#ef233c] hover:bg-[#d90429] text-white shadow-lg shadow-[#ef233c]/25 border border-[#ef233c] h-10 px-4 py-2 w-full mt-2 disabled:opacity-50 cursor-pointer active:scale-98"
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
              {{ store.authMode() === 'login' ? 'Sign In to Spider Console' : 'Create Developer Account' }}
            </span>
            <span *ngIf="store.isLoading()">Authenticating...</span>
          </button>
        </form>

        <div class="text-center text-xs text-slate-400">
          <p>
            {{
              store.authMode() === 'login' ? "Don't have an account?" : 'Already have an account?'
            }}
            <button
              type="button"
              class="text-[#ef233c] font-bold hover:underline ml-1 cursor-pointer"
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

