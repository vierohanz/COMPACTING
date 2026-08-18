import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { NAVIGATION_ITEMS, NavigationTab } from '../../../core/config/navigation.config';
import { AuthStore } from '../../../core/store/auth.store';
import { SpiderBadgeComponent } from '../spider-badge/spider-badge.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, SpiderBadgeComponent],
  template: `
    <header
      class="w-full rounded-2xl border border-[#132d52] bg-[#071324] px-6 py-4 shadow-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4"
    >
      <div class="flex items-center gap-3.5">
        <app-spider-badge [size]="46"></app-spider-badge>
        <div>
          <div class="flex items-center gap-2">
            <span class="marvel-badge">SPIDER ENGINE</span>
            <span class="text-[10px] spiderman-gold-sub">NEURAL PLATFORM</span>
          </div>
          <h1 class="text-2xl spiderman-3d-title leading-none mt-0.5 tracking-wider">
            COMPACTING
          </h1>
        </div>
      </div>

      <nav
        class="inline-flex items-center rounded-xl bg-[#040914] border border-[#132d52] p-1.5 text-slate-400 overflow-x-auto"
      >
        <button
          *ngFor="let item of navItems"
          class="inline-flex items-center gap-1.5 justify-center whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer"
          [ngClass]="
            activeTab === item.id
              ? 'bg-[#e21b24] text-white shadow-md shadow-[#e21b24]/30'
              : 'hover:text-white hover:bg-[#0c1e38] text-slate-300'
          "
          (click)="tabChange.emit(item.id)"
        >
          <span>{{ item.label }}</span>
          <svg
            *ngIf="!authStore.isAuthenticated() && (item.id === 'apikeys' || item.id === 'analytics')"
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            class="text-slate-400 opacity-90"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </button>
      </nav>

      <div class="flex items-center gap-3">
        <div *ngIf="!authStore.isAuthenticated()">
          <button
            class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-xs font-black transition-all bg-[#e21b24] hover:bg-[#b50e16] text-white shadow-lg shadow-[#e21b24]/30 border border-[#e21b24] h-9 px-5 py-2 cursor-pointer active:scale-98"
            (click)="authStore.openModal('login')"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
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
          class="flex items-center gap-2.5 pl-2 pr-3.5 py-1 bg-[#0c1e38] border border-[#132d52] rounded-full"
        >
          <div
            class="h-7 w-7 rounded-full bg-[#e21b24] text-white font-black text-xs flex items-center justify-center shadow-md shadow-[#e21b24]/30"
          >
            {{ (authStore.currentUser()?.fullName || 'U')[0].toUpperCase() }}
          </div>
          <div class="flex flex-col text-left">
            <span class="text-xs font-bold text-slate-100 leading-none">
              {{ authStore.currentUser()?.fullName }}
            </span>
            <span class="text-[10px] font-bold text-[#ffcc00] uppercase tracking-wider">
              {{ authStore.currentUser()?.role }}
            </span>
          </div>
          <button
            class="text-slate-400 hover:text-[#e21b24] hover:bg-[#040914] p-1 rounded-full transition ml-1 cursor-pointer"
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


