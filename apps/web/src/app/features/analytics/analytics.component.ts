import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AuthStore } from '../../core/store/auth.store';
import { CompressionStore } from '../../core/store/compression.store';
import { formatBytes } from '../../core/utils/utils';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="space-y-6">
      <!-- Auth Gate (Solid Spider Card, No Glass) -->
      <div
        *ngIf="!authStore.isAuthenticated()"
        class="rounded-3xl border border-[#132d52] bg-[#071324] p-8 sm:p-12 shadow-2xl text-center max-w-2xl mx-auto space-y-6"
      >
        <div
          class="w-16 h-16 rounded-2xl bg-[#0c1e38] border border-[#e21b24]/50 text-[#e21b24] flex items-center justify-center mx-auto shadow-lg shadow-[#e21b24]/20"
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M3 3v18h18" />
            <path d="M18 17V9" />
            <path d="M13 17V5" />
            <path d="M8 17v-3" />
          </svg>
        </div>

        <div class="space-y-2">
          <span
            class="inline-flex items-center rounded-full border border-[#e21b24]/50 bg-[#e21b24]/15 px-3 py-0.5 text-xs font-extrabold text-[#e21b24] uppercase tracking-wider"
          >
            Authentication Required
          </span>
          <h2 class="text-xl sm:text-2xl font-black tracking-wide text-white">
            Sign In to Access Your Personal Telemetry
          </h2>
          <p class="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Monitor real-time personal compression logs, personal bandwidth savings, engine latency stats,
            and comprehensive event logs specific to your account.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-2">
          <div class="rounded-xl border border-[#132d52] bg-[#0c1e38] p-3.5 space-y-1">
            <h4 class="text-xs font-bold text-white">Personal Savings</h4>
            <p class="text-[11px] text-slate-400">
              Track bytes saved and bandwidth cost cuts on your account.
            </p>
          </div>
          <div class="rounded-xl border border-[#132d52] bg-[#0c1e38] p-3.5 space-y-1">
            <h4 class="text-xs font-bold text-white">Format Breakdown</h4>
            <p class="text-[11px] text-slate-400">
              Analyze your WebP, JPEG, PNG, and GIF distribution.
            </p>
          </div>
          <div class="rounded-xl border border-[#132d52] bg-[#0c1e38] p-3.5 space-y-1">
            <h4 class="text-xs font-bold text-white">Private Event Logs</h4>
            <p class="text-[11px] text-slate-400">
              Only you can see the images and files processed by your key.
            </p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all bg-[#e21b24] hover:bg-[#b50e16] text-white shadow-xl shadow-[#e21b24]/30 border border-[#e21b24] h-10 px-6 cursor-pointer active:scale-98"
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
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            <span>Sign In to Continue</span>
          </button>
          <button
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all border border-[#132d52] bg-[#0c1e38] text-slate-200 shadow-xs hover:bg-[#132d52] h-10 px-6 cursor-pointer"
            (click)="authStore.openModal('register')"
          >
            <span>Create Free Account</span>
          </button>
        </div>
      </div>

      <!-- Authenticated Telemetry Dashboard -->
      <div *ngIf="authStore.isAuthenticated()" class="space-y-6">
        <!-- Header with Scope Selector -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#132d52] pb-4">
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-xl font-black text-white tracking-wide">Compression Telemetry</h2>
              <span
                class="inline-flex items-center rounded-md px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider"
                [ngClass]="
                  store.analyticsScope() === 'personal'
                    ? 'bg-[#e21b24]/20 text-[#ffcc00] border border-[#e21b24]/40'
                    : 'bg-[#00d2ff]/20 text-[#00d2ff] border border-[#00d2ff]/40'
                "
              >
                {{ store.analyticsScope() === 'personal' ? 'My Workspace History' : 'Global Platform History' }}
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-1">
              {{
                store.analyticsScope() === 'personal'
                  ? 'Showing analytics and event logs processed exclusively by your account and API keys.'
                  : 'Showing global server-wide analytics across all connected applications.'
              }}
            </p>
          </div>

          <!-- Scope Switcher Toggle Buttons -->
          <div class="flex items-center p-1 bg-[#0c1e38] border border-[#132d52] rounded-xl self-start sm:self-auto">
            <button
              class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
              [ngClass]="
                store.analyticsScope() === 'personal'
                  ? 'bg-[#e21b24] text-white shadow-md shadow-[#e21b24]/30'
                  : 'text-slate-400 hover:text-white'
              "
              (click)="store.setAnalyticsScope('personal')"
            >
              My Workspace
            </button>
            <button
              class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
              [ngClass]="
                store.analyticsScope() === 'global'
                  ? 'bg-[#e21b24] text-white shadow-md shadow-[#e21b24]/30'
                  : 'text-slate-400 hover:text-white'
              "
              (click)="store.setAnalyticsScope('global')"
            >
              Global Server
            </button>
          </div>
        </div>

        <!-- Metric Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            class="rounded-2xl border border-[#132d52] bg-[#071324] p-5 shadow-2xl flex items-center justify-between"
          >
            <div class="space-y-1">
              <span class="text-xs font-bold text-slate-400">Total Images Compressed</span>
              <h3 class="text-2xl font-black font-mono tracking-tight text-white">
                {{ store.summary()?.totalImagesCompressed || 0 | number }}
              </h3>
            </div>
            <div
              class="w-11 h-11 rounded-xl bg-[#0c1e38] border border-[#e21b24]/40 flex items-center justify-center text-[#e21b24] shadow-md shadow-[#e21b24]/10"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
              >
                <path
                  d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2l1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"
                />
              </svg>
            </div>
          </div>

          <div
            class="rounded-2xl border border-[#132d52] bg-[#071324] p-5 shadow-2xl flex items-center justify-between"
          >
            <div class="space-y-1">
              <span class="text-xs font-bold text-slate-400">Total Bandwidth Saved</span>
              <h3 class="text-2xl font-black font-mono tracking-tight text-[#ffcc00]">
                {{ formatBytes(store.summary()?.totalBytesSaved || 0) }}
              </h3>
            </div>
            <div
              class="w-11 h-11 rounded-xl bg-[#e21b24] text-white flex items-center justify-center shadow-lg shadow-[#e21b24]/30 border border-[#e21b24]"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
            </div>
          </div>

          <div
            class="rounded-2xl border border-[#132d52] bg-[#071324] p-5 shadow-2xl flex items-center justify-between"
          >
            <div class="space-y-1">
              <span class="text-xs font-bold text-slate-400">Average Reduction</span>
              <h3 class="text-2xl font-black font-mono tracking-tight text-[#00d2ff]">
                {{ store.summary()?.averageSavingsPercentage || 0 }}%
              </h3>
            </div>
            <div
              class="w-11 h-11 rounded-xl bg-[#0c1e38] border border-[#00d2ff]/40 flex items-center justify-center text-[#00d2ff] shadow-md shadow-[#00d2ff]/10"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
          </div>

          <div
            class="rounded-2xl border border-[#132d52] bg-[#071324] p-5 shadow-2xl flex items-center justify-between"
          >
            <div class="space-y-1">
              <span class="text-xs font-bold text-slate-400">Average Engine Latency</span>
              <h3 class="text-2xl font-black font-mono tracking-tight text-white">
                {{ store.summary()?.averageDurationMs || 0 }} ms
              </h3>
            </div>
            <div
              class="w-11 h-11 rounded-xl bg-[#0c1e38] border border-[#132d52] flex items-center justify-center text-slate-300 shadow-md"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Recent Compression Logs Table -->
        <div class="rounded-2xl border border-[#132d52] bg-[#071324] shadow-2xl p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-base font-black tracking-wide text-white">
              Recent Compression Events
            </h2>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-[#132d52] text-slate-400 font-semibold">
                  <th class="h-10 px-4">File Name</th>
                  <th class="h-10 px-4">Source</th>
                  <th class="h-10 px-4">Target</th>
                  <th class="h-10 px-4">Original</th>
                  <th class="h-10 px-4">Compressed</th>
                  <th class="h-10 px-4">Savings</th>
                  <th class="h-10 px-4">Latency</th>
                  <th class="h-10 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#132d52]">
                <tr
                  *ngFor="let item of store.recentCompressions()"
                  class="hover:bg-[#0c1e38] transition-colors"
                >
                  <td class="py-3.5 px-4 font-bold text-white max-w-[200px] truncate" [title]="item.fileName">
                    {{ item.fileName }}
                  </td>
                  <td class="py-3.5 px-4 text-slate-400">
                    {{ item.sourceFormat }}
                  </td>
                  <td class="py-3.5 px-4">
                    <span
                      class="inline-flex items-center rounded-md border border-[#00d2ff]/40 bg-[#00d2ff]/10 px-2 py-0.5 font-bold text-[#00d2ff]"
                      >{{ item.targetFormat }}</span
                    >
                  </td>
                  <td class="py-3.5 px-4 text-slate-300 font-mono">
                    {{ formatBytes(item.originalSizeBytes) }}
                  </td>
                  <td class="py-3.5 px-4 text-slate-300 font-mono">
                    {{ formatBytes(item.compressedSizeBytes) }}
                  </td>
                  <td class="py-3.5 px-4 font-bold text-[#e21b24] font-mono">
                    -{{ item.compressionRatioPercent }}%
                  </td>
                  <td class="py-3.5 px-4 text-slate-300 font-mono">{{ item.durationMs }} ms</td>
                  <td class="py-3.5 px-4 text-slate-400">
                    {{ item.createdAt | date: 'short' }}
                  </td>
                </tr>
                <tr *ngIf="store.recentCompressions().length === 0">
                  <td colspan="8" class="text-center py-8 text-slate-500">
                    No compression events recorded in this workspace yet.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  `
})
export class AnalyticsComponent {
  store = inject(CompressionStore);
  authStore = inject(AuthStore);
  formatBytes = formatBytes;
}
