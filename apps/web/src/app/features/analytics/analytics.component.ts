import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CompressionStore } from '../../core/store/compression.store';
import { formatBytes } from '../../core/utils/utils';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          class="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between"
        >
          <div class="space-y-1">
            <span class="text-xs font-medium text-slate-500">Total Images Compressed</span>
            <h3 class="text-2xl font-bold font-mono tracking-tight text-slate-900">
              {{ store.summary()?.totalImagesCompressed || 0 | number }}
            </h3>
          </div>
          <div
            class="w-10 h-10 rounded-lg bg-pink-50 border border-pink-200/80 flex items-center justify-center text-pink-600 shadow-xs"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2l1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"
              />
            </svg>
          </div>
        </div>

        <div
          class="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between"
        >
          <div class="space-y-1">
            <span class="text-xs font-medium text-slate-500">Total Bandwidth Saved</span>
            <h3 class="text-2xl font-bold font-mono tracking-tight text-pink-600">
              {{ formatBytes(store.summary()?.totalBytesSaved || 0) }}
            </h3>
          </div>
          <div
            class="w-10 h-10 rounded-lg bg-pink-600 text-white flex items-center justify-center shadow-xs"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
          </div>
        </div>

        <div
          class="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between"
        >
          <div class="space-y-1">
            <span class="text-xs font-medium text-slate-500">Average Reduction</span>
            <h3 class="text-2xl font-bold font-mono tracking-tight text-slate-900">
              {{ store.summary()?.averageSavingsPercentage || 0 }}%
            </h3>
          </div>
          <div
            class="w-10 h-10 rounded-lg bg-pink-50 border border-pink-200/80 flex items-center justify-center text-pink-600 shadow-xs"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
        </div>

        <div
          class="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between"
        >
          <div class="space-y-1">
            <span class="text-xs font-medium text-slate-500">Average Engine Latency</span>
            <h3 class="text-2xl font-bold font-mono tracking-tight text-slate-900">
              {{ store.summary()?.averageDurationMs || 0 }} ms
            </h3>
          </div>
          <div
            class="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shadow-xs"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-slate-200/80 bg-white shadow-xs p-6 space-y-4">
        <h2 class="text-base font-semibold tracking-tight text-slate-900">
          Recent Compression Events
        </h2>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-200 text-slate-500 font-medium">
                <th class="h-9 px-4">File Name</th>
                <th class="h-9 px-4">Source</th>
                <th class="h-9 px-4">Target</th>
                <th class="h-9 px-4">Original</th>
                <th class="h-9 px-4">Compressed</th>
                <th class="h-9 px-4">Savings</th>
                <th class="h-9 px-4">Latency</th>
                <th class="h-9 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                *ngFor="let item of store.recentCompressions()"
                class="hover:bg-slate-50/70 transition-colors"
              >
                <td class="py-3 px-4 font-semibold text-slate-900">
                  {{ item.fileName }}
                </td>
                <td class="py-3 px-4 text-slate-600">
                  {{ item.sourceFormat }}
                </td>
                <td class="py-3 px-4">
                  <span
                    class="inline-flex items-center rounded-md border border-pink-200 bg-pink-50 px-2 py-0.5 font-semibold text-pink-700"
                    >{{ item.targetFormat }}</span
                  >
                </td>
                <td class="py-3 px-4 text-slate-600">
                  {{ formatBytes(item.originalSizeBytes) }}
                </td>
                <td class="py-3 px-4 text-slate-600">
                  {{ formatBytes(item.compressedSizeBytes) }}
                </td>
                <td class="py-3 px-4 font-semibold text-pink-600">
                  -{{ item.compressionRatioPercent }}%
                </td>
                <td class="py-3 px-4 text-slate-600">{{ item.durationMs }} ms</td>
                <td class="py-3 px-4 text-slate-400">
                  {{ item.createdAt | date: 'shortTime' }}
                </td>
              </tr>
              <tr *ngIf="store.recentCompressions().length === 0">
                <td colspan="8" class="text-center py-6 text-slate-400">
                  No recent compression events recorded yet.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `
})
export class AnalyticsComponent {
  store = inject(CompressionStore);
  formatBytes = formatBytes;
}
