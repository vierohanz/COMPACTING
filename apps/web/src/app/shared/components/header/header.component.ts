import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { NAVIGATION_ITEMS, NavigationTab } from '../../../core/config/navigation.config';
import { AuthStore } from '../../../core/store/auth.store';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header
      class="w-full rounded-2xl border border-pink-100 bg-white/95 backdrop-blur-md px-6 py-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4"
    >
      <div class="flex items-center gap-3.5">
        <div
          class="w-10 h-10 rounded-xl bg-pink-500 text-white flex items-center justify-center shadow-md shadow-pink-500/20"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M4 16L8.586 11.414C9.367 10.633 10.633 10.633 11.414 11.414L16 16M14 14L15.586 12.414C16.367 11.633 17.633 11.633 18.414 12.414L20 14M14 8H14.01M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z"
            />
          </svg>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="text-base font-extrabold tracking-tight text-slate-900">COMPACTING</span>
            <span
              class="inline-flex items-center rounded-full border border-pink-200 bg-pink-50 px-2 py-0.5 text-[10px] font-bold text-pink-700 uppercase tracking-wider"
              >v1.0</span
            >
          </div>
          <p class="text-xs text-slate-500 font-medium">Self-Hosted Image Compression SaaS</p>
        </div>
      </div>

      <nav
        class="inline-flex items-center rounded-xl bg-slate-100/90 p-1.5 text-slate-500 overflow-x-auto"
      >
        <button
          *ngFor="let item of navItems"
          class="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer"
          [ngClass]="
            activeTab === item.id
              ? 'bg-white text-pink-600 shadow-sm'
              : 'hover:text-slate-900 text-slate-600'
          "
          (click)="tabChange.emit(item.id)"
        >
          <span>{{ item.label }}</span>
        </button>
      </nav>

      <div class="flex items-center gap-3">
        <div *ngIf="!authStore.isAuthenticated()">
          <button
            class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-xs font-bold transition-all bg-pink-600 text-white shadow-md shadow-pink-600/20 hover:bg-pink-700 h-9 px-4 py-2 cursor-pointer active:scale-98"
            (click)="authStore.openModal('login')"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
              <polyline points="10 17 15 12 10 7"></polyline>
              <line x1="15" y1="12" x2="3" y2="12"></line>
            </svg>
            <span>Sign In</span>
          </button>
        </div>

        <div
          *ngIf="authStore.isAuthenticated()"
          class="flex items-center gap-2.5 pl-2 pr-3.5 py-1 bg-pink-50/50 border border-pink-100 rounded-full"
        >
          <div
            class="h-7 w-7 rounded-full bg-pink-600 text-white font-bold text-xs flex items-center justify-center shadow-sm"
          >
            {{ (authStore.currentUser()?.fullName || 'U')[0].toUpperCase() }}
          </div>
          <div class="flex flex-col text-left">
            <span class="text-xs font-bold text-slate-900 leading-none">
              {{ authStore.currentUser()?.fullName }}
            </span>
            <span class="text-[10px] font-semibold text-pink-600 uppercase">
              {{ authStore.currentUser()?.role }}
            </span>
          </div>
          <button
            class="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1 rounded-full transition ml-1 cursor-pointer"
            (click)="authStore.logout()"
            title="Log out"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  authStore = inject(AuthStore);

  @Input() activeTab: NavigationTab = 'playground';
  @Output() tabChange = new EventEmitter<NavigationTab>();
  navItems = NAVIGATION_ITEMS;
}
