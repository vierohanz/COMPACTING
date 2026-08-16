import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CompressionStore } from './core/store/compression.store';
import { AnalyticsComponent } from './features/analytics/analytics.component';
import { ApiKeysComponent } from './features/api-keys/api-keys.component';
import { DocsComponent } from './features/docs/docs.component';
import { PlaygroundComponent } from './features/playground/playground.component';
import { HeaderComponent } from './shared/components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    PlaygroundComponent,
    ApiKeysComponent,
    AnalyticsComponent,
    DocsComponent
  ],
  template: `
    <div class="app-container">
      <app-header
        [activeTab]="store.activeTab()"
        (tabChange)="store.setTab($event)"
      >
      </app-header>

      <main class="main-content">
        <app-playground
          *ngIf="store.activeTab() === 'playground'"
        ></app-playground>
        <app-api-keys *ngIf="store.activeTab() === 'apikeys'"></app-api-keys>
        <app-analytics
          *ngIf="store.activeTab() === 'analytics'"
        ></app-analytics>
        <app-docs *ngIf="store.activeTab() === 'docs'"></app-docs>
      </main>
    </div>
  `,
  styles: [
    `
      .app-container {
        max-width: 1440px;
        margin: 0 auto;
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 28px;
      }
    `
  ]
})
export class AppComponent {
  store = inject(CompressionStore);

  ngOnInit() {
    this.store.loadAnalytics();
    this.store.loadApiKeys();
  }
}
