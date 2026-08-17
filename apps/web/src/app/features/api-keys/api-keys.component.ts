import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CompressionStore } from '../../core/store/compression.store';
import { createClipboard } from '../../core/utils/clipboard.util';
import { formatBytes } from '../../core/utils/utils';

@Component({
  selector: 'app-api-keys',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="space-y-6">
      <div class="rounded-xl border border-slate-200/80 bg-white shadow-xs p-6 space-y-5">
        <div class="space-y-1">
          <h2 class="text-base font-semibold tracking-tight text-slate-900">Generate API Key</h2>
          <p class="text-xs text-slate-500">
            Create credentials for external websites, apps, and CI/CD pipelines to offload
            compression.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-slate-700 block">Key Name / Application</label>
            <input
              type="text"
              [(ngModel)]="newKeyName"
              placeholder="e.g. NextJS Blog, WordPress Plugin, Mobile App"
              class="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-500 text-slate-900 placeholder:text-slate-400"
            />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-slate-700 block">Rate Limit (req/min)</label>
            <input
              type="number"
              [(ngModel)]="newKeyRateLimit"
              class="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-500 text-slate-900"
            />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-slate-700 block">Expires In (Days)</label>
            <input
              type="number"
              [(ngModel)]="newKeyExpiresDays"
              placeholder="Never"
              class="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-500 text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div>
          <button
            class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-semibold transition-colors bg-pink-600 text-white shadow-xs hover:bg-pink-700 h-9 px-4 disabled:opacity-50"
            (click)="handleCreate()"
            [disabled]="store.isCreatingKey() || !newKeyName.trim()"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>Generate New Key</span>
          </button>
        </div>

        <div
          *ngIf="store.createdKeySecret()"
          class="rounded-lg border border-pink-200 bg-pink-50/60 p-4 flex gap-3.5 mt-2"
        >
          <div class="text-pink-600 mt-0.5">
            <svg
              width="20"
              height="20"
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
          <div class="flex-1 space-y-1">
            <h4 class="text-xs font-semibold text-slate-900">Make sure to copy your API key now</h4>
            <p class="text-[11px] text-slate-500">
              You will not be able to see this secret again once refreshed.
            </p>
            <div
              class="flex items-center gap-2.5 bg-white border border-slate-200 px-3 py-1.5 rounded-md mt-2"
            >
              <code class="font-mono text-xs font-bold text-pink-600 flex-1 break-all select-all">{{
                store.createdKeySecret()
              }}</code>
              <button
                class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-semibold bg-pink-600 text-white shadow-xs hover:bg-pink-700 h-7 px-3"
                (click)="clipboard.copy(store.createdKeySecret()!)"
              >
                {{ clipboard.isCopied() ? 'Copied' : 'Copy' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-slate-200/80 bg-white shadow-xs p-6 space-y-4">
        <h2 class="text-base font-semibold tracking-tight text-slate-900">
          Active API Keys ({{ store.apiKeys().length }})
        </h2>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-200 text-slate-500 font-medium">
                <th class="h-9 px-4">Name</th>
                <th class="h-9 px-4">Prefix</th>
                <th class="h-9 px-4">Created</th>
                <th class="h-9 px-4">Rate Limit</th>
                <th class="h-9 px-4">Total Requests</th>
                <th class="h-9 px-4">Bytes Saved</th>
                <th class="h-9 px-4">Status</th>
                <th class="h-9 px-4">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                *ngFor="let key of store.apiKeys()"
                class="hover:bg-slate-50/70 transition-colors"
              >
                <td class="py-3 px-4 font-semibold text-slate-900">
                  {{ key.name }}
                </td>
                <td class="py-3 px-4 font-mono text-pink-600 font-semibold">
                  {{ key.keyPrefix }}
                </td>
                <td class="py-3 px-4 text-slate-600">
                  {{ key.createdAt | date: 'shortDate' }}
                </td>
                <td class="py-3 px-4 text-slate-600">{{ key.rateLimitPerMin }} req/m</td>
                <td class="py-3 px-4 text-slate-600">
                  {{ key.totalRequests | number }}
                </td>
                <td class="py-3 px-4 font-semibold text-pink-600">
                  {{ formatBytes(key.totalBytesSaved) }}
                </td>
                <td class="py-3 px-4">
                  <span
                    class="inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold"
                    [ngClass]="
                      !key.isRevoked
                        ? 'border-pink-200 bg-pink-50 text-pink-700'
                        : 'border-rose-200 bg-rose-50 text-rose-700'
                    "
                  >
                    {{ key.isRevoked ? 'Revoked' : 'Active' }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <button
                    *ngIf="!key.isRevoked"
                    class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-[11px] font-medium border border-rose-200 bg-white text-rose-600 shadow-xs hover:bg-rose-50 hover:text-rose-700 h-7 px-2.5 transition-colors"
                    (click)="store.revokeKey(key.id)"
                  >
                    Revoke
                  </button>
                </td>
              </tr>
              <tr *ngIf="store.apiKeys().length === 0">
                <td colspan="8" class="text-center py-6 text-slate-400">
                  No API keys generated yet.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `
})
export class ApiKeysComponent {
  store = inject(CompressionStore);
  clipboard = createClipboard();
  formatBytes = formatBytes;

  newKeyName = '';
  newKeyRateLimit = 120;
  newKeyExpiresDays: number | null = 30;

  handleCreate() {
    if (!this.newKeyName.trim()) return;
    this.store.createKey(
      this.newKeyName,
      this.newKeyRateLimit,
      this.newKeyExpiresDays || undefined
    );
    this.newKeyName = '';
  }
}
