import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  NAVIGATION_ITEMS,
  NavigationTab
} from '../../../core/config/navigation.config';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="app-header glass-panel">
      <div class="header-left">
        <div class="logo-box">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 16L8.586 11.414C9.367 10.633 10.633 10.633 11.414 11.414L16 16M14 14L15.586 12.414C16.367 11.633 17.633 11.633 18.414 12.414L20 14M14 8H14.01M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z"
              stroke="#10B981"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M9 3V6M15 3V6M9 18V21M15 18V21"
              stroke="#06B6D4"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <div>
          <h1 class="brand-title">COMPACTING</h1>
          <p class="brand-subtitle">Self-Hosted Image Compression Engine</p>
        </div>
      </div>

      <nav class="nav-tabs">
        <button
          *ngFor="let item of navItems"
          class="nav-tab"
          [class.active]="activeTab === item.id"
          (click)="tabChange.emit(item.id)"
        >
          <span>{{ item.label }}</span>
        </button>
      </nav>

      <div class="header-right">
        <div class="status-indicator">
          <span class="pulse-dot"></span>
          <span class="status-text">API Online :5126</span>
        </div>
      </div>
    </header>
  `,
  styles: [
    `
      .app-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 24px;
        border-radius: var(--radius-xl);
      }
      .header-left {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .logo-box {
        width: 44px;
        height: 44px;
        background: rgba(16, 185, 129, 0.12);
        border: 1px solid rgba(16, 185, 129, 0.3);
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: var(--shadow-glow);
      }
      .brand-title {
        font-size: 1.3rem;
        font-weight: 800;
        letter-spacing: -0.02em;
        background: linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .brand-subtitle {
        font-size: 0.75rem;
        color: var(--text-muted);
        font-weight: 500;
      }
      .nav-tabs {
        display: flex;
        gap: 8px;
        background: rgba(0, 0, 0, 0.25);
        padding: 4px;
        border-radius: var(--radius-md);
        border: 1px solid var(--border-subtle);
      }
      .nav-tab {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        border-radius: var(--radius-sm);
        background: transparent;
        border: none;
        color: var(--text-muted);
        font-weight: 600;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .nav-tab:hover {
        color: var(--text-main);
        background: rgba(255, 255, 255, 0.05);
      }
      .nav-tab.active {
        background: var(--bg-surface-elevated);
        color: #10b981;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }
      .status-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid rgba(16, 185, 129, 0.25);
        border-radius: 9999px;
      }
      .pulse-dot {
        width: 8px;
        height: 8px;
        background: #10b981;
        border-radius: 50%;
        box-shadow: 0 0 10px #10b981;
      }
      .status-text {
        font-size: 0.75rem;
        font-weight: 600;
        color: #34d399;
      }
    `
  ]
})
export class HeaderComponent {
  @Input() activeTab: NavigationTab = 'playground';
  @Output() tabChange = new EventEmitter<NavigationTab>();
  navItems = NAVIGATION_ITEMS;
}
