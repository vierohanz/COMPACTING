import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CompressionStore } from '../../core/store/compression.store';
import { formatBytes } from '../../core/utils/utils';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="analytics-layout">
      <div class="stats-row">
        <div class="stat-card glass-panel">
          <div class="stat-icon emerald-bg">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#10B981"
              stroke-width="2"
            >
              <path
                d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2l1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"
              />
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Total Images Compressed</span>
            <h3 class="stat-number">
              {{ store.summary()?.totalImagesCompressed || 0 | number }}
            </h3>
          </div>
        </div>

        <div class="stat-card glass-panel">
          <div class="stat-icon cyan-bg">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#06B6D4"
              stroke-width="2"
            >
              <path
                d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
              />
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Total Bandwidth Saved</span>
            <h3 class="stat-number text-green">
              {{ formatBytes(store.summary()?.totalBytesSaved || 0) }}
            </h3>
          </div>
        </div>

        <div class="stat-card glass-panel">
          <div class="stat-icon indigo-bg">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6366F1"
              stroke-width="2"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Average Reduction</span>
            <h3 class="stat-number">
              {{ store.summary()?.averageSavingsPercentage || 0 }}%
            </h3>
          </div>
        </div>

        <div class="stat-card glass-panel">
          <div class="stat-icon amber-bg">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#F59E0B"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Average Engine Latency</span>
            <h3 class="stat-number">
              {{ store.summary()?.averageDurationMs || 0 }} ms
            </h3>
          </div>
        </div>
      </div>

      <div class="glass-panel recent-table-card">
        <div class="panel-header">
          <h2>Recent Compression Events</h2>
        </div>

        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Source</th>
                <th>Target</th>
                <th>Original</th>
                <th>Compressed</th>
                <th>Savings</th>
                <th>Latency</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of store.recentCompressions()">
                <td class="font-bold">{{ item.fileName }}</td>
                <td>
                  <span class="format-pill">{{ item.sourceFormat }}</span>
                </td>
                <td>
                  <span class="format-pill highlight">{{
                    item.targetFormat
                  }}</span>
                </td>
                <td>{{ formatBytes(item.originalSizeBytes) }}</td>
                <td>{{ formatBytes(item.compressedSizeBytes) }}</td>
                <td class="text-green">-{{ item.compressionRatioPercent }}%</td>
                <td>{{ item.durationMs }} ms</td>
                <td>{{ item.createdAt | date: 'shortTime' }}</td>
              </tr>
              <tr *ngIf="store.recentCompressions().length === 0">
                <td colspan="8" class="text-center py-4 text-muted">
                  No recent compression events recorded yet.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .analytics-layout {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .stats-row {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
      }
      @media (max-width: 1024px) {
        .stats-row {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      .stat-card {
        padding: 20px;
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .emerald-bg {
        background: rgba(16, 185, 129, 0.12);
        border: 1px solid rgba(16, 185, 129, 0.3);
      }
      .cyan-bg {
        background: rgba(6, 182, 212, 0.12);
        border: 1px solid rgba(6, 182, 212, 0.3);
      }
      .indigo-bg {
        background: rgba(99, 102, 241, 0.12);
        border: 1px solid rgba(99, 102, 241, 0.3);
      }
      .amber-bg {
        background: rgba(245, 158, 11, 0.12);
        border: 1px solid rgba(245, 158, 11, 0.3);
      }
      .stat-label {
        font-size: 0.8rem;
        color: var(--text-muted);
        font-weight: 500;
        display: block;
      }
      .stat-number {
        font-size: 1.4rem;
        font-weight: 800;
        font-family: var(--font-mono);
      }
      .recent-table-card {
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 18px;
      }
      .table-responsive {
        overflow-x: auto;
      }
      .custom-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
      }
      .custom-table th {
        padding: 12px 16px;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-muted);
        border-bottom: 1px solid var(--border-subtle);
      }
      .custom-table td {
        padding: 14px 16px;
        font-size: 0.875rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.03);
      }
      .format-pill {
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 700;
        background: var(--bg-surface-elevated);
      }
      .format-pill.highlight {
        background: rgba(16, 185, 129, 0.2);
        color: #34d399;
      }
      .text-green {
        color: #34d399;
      }
      .font-bold {
        font-weight: 600;
      }
    `
  ]
})
export class AnalyticsComponent {
  store = inject(CompressionStore);
  formatBytes = formatBytes;
}
