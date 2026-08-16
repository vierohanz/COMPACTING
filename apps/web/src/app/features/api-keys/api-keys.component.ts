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
    <section class="apikeys-layout">
      <div class="glass-panel apikey-form-card">
        <div class="panel-header">
          <h2>Generate API Key</h2>
          <p>
            Create credentials for external websites, apps, and CI/CD pipelines
            to offload compression.
          </p>
        </div>

        <div class="form-grid">
          <div class="setting-item">
            <label class="field-label">Key Name / Application</label>
            <input
              type="text"
              [(ngModel)]="newKeyName"
              placeholder="e.g. NextJS Blog, WordPress Plugin, Mobile App"
              class="custom-input"
            />
          </div>
          <div class="setting-item">
            <label class="field-label">Rate Limit (req/min)</label>
            <input
              type="number"
              [(ngModel)]="newKeyRateLimit"
              class="custom-input"
            />
          </div>
          <div class="setting-item">
            <label class="field-label">Expires In (Days)</label>
            <input
              type="number"
              [(ngModel)]="newKeyExpiresDays"
              placeholder="Never"
              class="custom-input"
            />
          </div>
        </div>

        <button
          class="btn-primary"
          (click)="handleCreate()"
          [disabled]="store.isCreatingKey() || !newKeyName.trim()"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span>Generate New Key</span>
        </button>

        <div *ngIf="store.createdKeySecret()" class="key-secret-alert">
          <div class="alert-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#F59E0B"
              stroke-width="2"
            >
              <path
                d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
              />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div class="alert-content">
            <h4>Make sure to copy your API key now</h4>
            <p>You will not be able to see it again.</p>
            <div class="secret-box">
              <code>{{ store.createdKeySecret() }}</code>
              <button
                class="copy-btn"
                (click)="clipboard.copy(store.createdKeySecret()!)"
              >
                {{ clipboard.isCopied() ? 'Copied' : 'Copy' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="glass-panel apikey-table-card">
        <div class="panel-header">
          <h2>Active API Keys ({{ store.apiKeys().length }})</h2>
        </div>

        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Prefix</th>
                <th>Created</th>
                <th>Rate Limit</th>
                <th>Total Requests</th>
                <th>Bytes Saved</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let key of store.apiKeys()">
                <td class="font-bold">{{ key.name }}</td>
                <td>
                  <code class="code-pill">{{ key.keyPrefix }}</code>
                </td>
                <td>{{ key.createdAt | date: 'shortDate' }}</td>
                <td>{{ key.rateLimitPerMin }} req/m</td>
                <td>{{ key.totalRequests | number }}</td>
                <td class="text-green">
                  {{ formatBytes(key.totalBytesSaved) }}
                </td>
                <td>
                  <span
                    class="badge"
                    [class.badge-emerald]="!key.isRevoked"
                    [class.badge-rose]="key.isRevoked"
                  >
                    {{ key.isRevoked ? 'Revoked' : 'Active' }}
                  </span>
                </td>
                <td>
                  <button
                    *ngIf="!key.isRevoked"
                    class="btn-revoke"
                    (click)="store.revokeKey(key.id)"
                  >
                    Revoke
                  </button>
                </td>
              </tr>
              <tr *ngIf="store.apiKeys().length === 0">
                <td colspan="8" class="text-center py-4 text-muted">
                  No API keys generated yet.
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
      .apikeys-layout {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .apikey-form-card,
      .apikey-table-card {
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 18px;
      }
      .form-grid {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr;
        gap: 16px;
      }
      @media (max-width: 768px) {
        .form-grid {
          grid-template-columns: 1fr;
        }
      }
      .key-secret-alert {
        margin-top: 12px;
        background: rgba(245, 158, 11, 0.1);
        border: 1px solid rgba(245, 158, 11, 0.3);
        padding: 16px;
        border-radius: var(--radius-md);
        display: flex;
        gap: 14px;
      }
      .secret-box {
        display: flex;
        align-items: center;
        gap: 12px;
        background: rgba(0, 0, 0, 0.4);
        padding: 8px 12px;
        border-radius: var(--radius-sm);
        margin-top: 8px;
      }
      .secret-box code {
        color: #38bdf8;
        font-weight: 600;
        flex: 1;
        word-break: break-all;
      }
      .copy-btn {
        background: #10b981;
        color: white;
        border: none;
        padding: 6px 14px;
        border-radius: 4px;
        font-weight: 600;
        cursor: pointer;
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
      .code-pill {
        background: rgba(255, 255, 255, 0.06);
        padding: 3px 8px;
        border-radius: 4px;
        font-family: var(--font-mono);
        font-size: 0.8rem;
      }
      .text-green {
        color: #34d399;
      }
      .font-bold {
        font-weight: 600;
      }
      .btn-revoke {
        background: rgba(244, 63, 94, 0.15);
        border: 1px solid rgba(244, 63, 94, 0.3);
        color: #fb7185;
        padding: 4px 10px;
        border-radius: var(--radius-sm);
        font-size: 0.75rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      .btn-revoke:hover {
        background: rgba(244, 63, 94, 0.3);
      }
      .custom-input {
        width: 100%;
        background: var(--bg-surface-elevated);
        border: 1px solid var(--border-subtle);
        padding: 10px 14px;
        border-radius: var(--radius-sm);
        color: var(--text-main);
        font-size: 0.875rem;
        outline: none;
      }
      .field-label {
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--text-muted);
        margin-bottom: 6px;
        display: block;
      }
    `
  ]
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
