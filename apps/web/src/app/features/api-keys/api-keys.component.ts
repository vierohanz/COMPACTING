import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthStore } from '../../core/store/auth.store';
import { CompressionStore } from '../../core/store/compression.store';
import { createClipboard } from '../../core/utils/clipboard.util';
import { formatBytes } from '../../core/utils/utils';
import { CustomSelectComponent, SelectOption } from '../../shared/components/custom-select/custom-select.component';

@Component({
  selector: 'app-api-keys',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomSelectComponent],
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
            <path
              d="M21 2l-2 2m-1.5 1.5L16 7l-1.5-1.5M19 5l2 2-2 2M15 9l-2-2m-1.5 1.5L10 10l-1.5-1.5M13 11l2 2-2 2M7.5 14.5A5.5 5.5 0 1 0 2 20a5.5 5.5 0 0 0 5.5-5.5z"
            />
          </svg>
        </div>

        <div class="space-y-2">
          <span
            class="inline-flex items-center rounded-full border border-[#e21b24]/50 bg-[#e21b24]/15 px-3 py-0.5 text-xs font-extrabold text-[#e21b24] uppercase tracking-wider"
          >
            Authentication Required
          </span>
          <h2 class="text-xl sm:text-2xl font-black tracking-wide text-white">
            Sign In to Manage Spider API Keys
          </h2>
          <p class="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Generate unlimited permanent keys, configure custom rate limits, and integrate high-speed
            image compression into your production apps and CI/CD pipelines.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-2">
          <div class="rounded-xl border border-[#132d52] bg-[#0c1e38] p-3.5 space-y-1">
            <h4 class="text-xs font-bold text-white">Unlimited / Permanent Keys</h4>
            <p class="text-[11px] text-slate-400">
              Create keys that never expire for long-running servers.
            </p>
          </div>
          <div class="rounded-xl border border-[#132d52] bg-[#0c1e38] p-3.5 space-y-1">
            <h4 class="text-xs font-bold text-white">Custom Rate Limits</h4>
            <p class="text-[11px] text-slate-400">
              Control throughput and requests per minute per key.
            </p>
          </div>
          <div class="rounded-xl border border-[#132d52] bg-[#0c1e38] p-3.5 space-y-1">
            <h4 class="text-xs font-bold text-white">One-Click Revoke</h4>
            <p class="text-[11px] text-slate-400">
              Instantly disable compromised keys with zero downtime.
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

      <!-- Authenticated Dashboard -->
      <div *ngIf="authStore.isAuthenticated()" class="space-y-6">
        <div class="rounded-2xl border border-[#132d52] bg-[#071324] shadow-2xl p-6 sm:p-8 space-y-6">
          <div class="space-y-1 border-b border-[#132d52] pb-4">
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-black tracking-wide text-white">Generate API Key</h2>
              <span
                class="inline-flex items-center rounded-md border border-[#e21b24]/40 bg-[#e21b24]/10 px-2 py-0.5 text-[10px] font-extrabold text-[#e21b24]"
                >X-API-KEY</span
              >
            </div>
            <p class="text-xs text-slate-400">
              Create credentials for external websites, apps, and CI/CD pipelines to offload
              compression.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-200 block"
                >Key Name / Application</label
              >
              <input
                type="text"
                [(ngModel)]="newKeyName"
                placeholder="e.g. Production Server, NextJS Blog, CI/CD"
                class="flex h-10 w-full rounded-xl border border-[#132d52] bg-[#0c1e38] px-3.5 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e21b24] text-white placeholder:text-slate-500 font-bold"
              />
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-200 block">Rate Limit (req/min)</label>
              <input
                type="number"
                [(ngModel)]="newKeyRateLimit"
                class="flex h-10 w-full rounded-xl border border-[#132d52] bg-[#0c1e38] px-3.5 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e21b24] text-white font-mono font-bold"
              />
            </div>

            <!-- Expiration Selection with Unlimited / Never Option -->
            <div class="space-y-1.5">
              <app-custom-select
                label="Key Expiration"
                [options]="expirationOptions"
                [value]="selectedExpiryOption"
                (valueChange)="onExpiryOptionChange($event)"
              ></app-custom-select>

              <!-- Custom Days Input if 'custom' is selected -->
              <div *ngIf="selectedExpiryOption === 'custom'" class="pt-2">
                <input
                  type="number"
                  min="1"
                  [(ngModel)]="customExpiresDays"
                  placeholder="Enter number of days"
                  class="flex h-10 w-full rounded-xl border border-[#132d52] bg-[#0c1e38] px-3.5 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e21b24] text-white font-bold"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-xs font-bold transition-all bg-[#e21b24] hover:bg-[#b50e16] text-white shadow-xl shadow-[#e21b24]/30 border border-[#e21b24] h-10 px-6 disabled:opacity-50 cursor-pointer active:scale-98"
              (click)="handleCreate()"
              [disabled]="store.isCreatingKey() || !newKeyName.trim()"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span>Generate API Key</span>
            </button>
          </div>

          <div
            *ngIf="store.createdKeySecret()"
            class="rounded-2xl border border-[#e21b24]/50 bg-[#0c1e38] p-5 flex gap-3.5 mt-2 shadow-2xl"
          >
            <div class="text-[#e21b24] mt-0.5">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div class="flex-1 space-y-1.5">
              <h4 class="text-xs font-black text-white">
                Make sure to copy your API key secret now
              </h4>
              <p class="text-[11px] text-slate-400">
                For security reasons, this secret key will not be shown again once you refresh this page.
              </p>
              <div
                class="flex items-center gap-2.5 bg-[#040914] border border-[#132d52] px-3.5 py-2 rounded-xl mt-2"
              >
                <code class="font-mono text-xs font-bold text-[#ffcc00] flex-1 break-all select-all">{{
                  store.createdKeySecret()
                }}</code>
                <button
                  class="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-xs font-bold bg-[#e21b24] hover:bg-[#b50e16] text-white shadow-xs h-8 px-3.5 cursor-pointer"
                  (click)="clipboard.copy(store.createdKeySecret()!)"
                >
                  {{ clipboard.isCopied() ? 'Copied' : 'Copy Key' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-[#132d52] bg-[#071324] shadow-2xl p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-base font-black tracking-wide text-white">
              Active API Keys ({{ store.apiKeys().length }})
            </h2>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-[#132d52] text-slate-400 font-semibold">
                  <th class="h-10 px-4">Name</th>
                  <th class="h-10 px-4">Prefix</th>
                  <th class="h-10 px-4">Created</th>
                  <th class="h-10 px-4">Expiration</th>
                  <th class="h-10 px-4">Rate Limit</th>
                  <th class="h-10 px-4">Total Requests</th>
                  <th class="h-10 px-4">Bytes Saved</th>
                  <th class="h-10 px-4">Status</th>
                  <th class="h-10 px-4">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#132d52]">
                <tr
                  *ngFor="let key of store.apiKeys()"
                  class="hover:bg-[#0c1e38] transition-colors"
                >
                  <td class="py-3.5 px-4 font-bold text-white">
                    {{ key.name }}
                  </td>
                  <td class="py-3.5 px-4 font-mono text-[#00d2ff] font-bold">
                    {{ key.keyPrefix }}
                  </td>
                  <td class="py-3.5 px-4 text-slate-400">
                    {{ key.createdAt | date: 'shortDate' }}
                  </td>
                  <!-- Expiry Column showing Unlimited / Date -->
                  <td class="py-3.5 px-4">
                    <span
                      *ngIf="!key.expiresAt"
                      class="inline-flex items-center gap-1.5 text-[#ffcc00] font-black text-[11px] uppercase tracking-wider"
                    >
                      <span class="w-1.5 h-1.5 rounded-full bg-[#ffcc00]"></span>
                      Unlimited
                    </span>
                    <span
                      *ngIf="key.expiresAt"
                      class="text-slate-300 font-mono text-[11px]"
                    >
                      {{ key.expiresAt | date: 'shortDate' }}
                    </span>
                  </td>
                  <td class="py-3.5 px-4 text-slate-300">{{ key.rateLimitPerMin }} req/m</td>
                  <td class="py-3.5 px-4 text-slate-300 font-mono">
                    {{ key.totalRequests | number }}
                  </td>
                  <td class="py-3.5 px-4 font-bold text-[#e21b24] font-mono">
                    {{ formatBytes(key.totalBytesSaved) }}
                  </td>
                  <td class="py-3.5 px-4">
                    <span
                      class="inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-extrabold"
                      [ngClass]="
                        !key.isRevoked
                          ? 'border-[#00d2ff]/40 bg-[#00d2ff]/10 text-[#00d2ff]'
                          : 'border-rose-500/40 bg-rose-500/10 text-rose-400'
                      "
                    >
                      {{ key.isRevoked ? 'Revoked' : 'Active' }}
                    </span>
                  </td>
                  <td class="py-3.5 px-4">
                    <button
                      *ngIf="!key.isRevoked"
                      class="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-[11px] font-bold border border-rose-500/40 bg-[#0c1e38] text-rose-400 shadow-xs hover:bg-rose-500/20 hover:text-rose-300 h-7 px-3 transition-colors cursor-pointer"
                      (click)="store.revokeKey(key.id)"
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
                <tr *ngIf="store.apiKeys().length === 0">
                  <td colspan="9" class="text-center py-8 text-slate-500">
                    No API keys generated yet.
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
export class ApiKeysComponent {
  store = inject(CompressionStore);
  authStore = inject(AuthStore);
  clipboard = createClipboard();
  formatBytes = formatBytes;

  newKeyName = '';
  newKeyRateLimit = 120;
  selectedExpiryOption: string = 'unlimited';
  customExpiresDays: number | null = null;

  expirationOptions: SelectOption[] = [
    {
      label: 'Unlimited (Never Expires)',
      value: 'unlimited',
      badge: 'Permanent',
      description: 'Key never expires, recommended for production & CI/CD'
    },
    {
      label: '30 Days',
      value: '30',
      description: 'Standard 1-month trial / staging cycle'
    },
    {
      label: '60 Days',
      value: '60',
      description: '2-month temporary integration token'
    },
    {
      label: '90 Days',
      value: '90',
      description: 'Quarterly key rotation cycle'
    },
    {
      label: '365 Days',
      value: '365',
      description: '1-year long-term deployment access'
    },
    {
      label: 'Custom Days',
      value: 'custom',
      description: 'Specify a custom expiration duration in days'
    }
  ];

  onExpiryOptionChange(option: string) {
    this.selectedExpiryOption = option;
  }

  handleCreate() {
    if (!this.newKeyName.trim()) return;

    let expiresDays: number | undefined;
    if (this.selectedExpiryOption === 'unlimited') {
      expiresDays = undefined;
    } else if (this.selectedExpiryOption === 'custom') {
      expiresDays = this.customExpiresDays ? this.customExpiresDays : undefined;
    } else {
      expiresDays = parseInt(this.selectedExpiryOption, 10) || undefined;
    }

    this.store.createKey(
      this.newKeyName,
      this.newKeyRateLimit,
      expiresDays
    );
    this.newKeyName = '';
  }
}
