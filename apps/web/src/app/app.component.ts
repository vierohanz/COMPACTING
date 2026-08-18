import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AuthStore } from './core/store/auth.store';
import { CompressionStore } from './core/store/compression.store';
import { AnalyticsComponent } from './features/analytics/analytics.component';
import { ApiKeysComponent } from './features/api-keys/api-keys.component';
import { AuthComponent } from './features/auth/auth.component';
import { DocsComponent } from './features/docs/docs.component';
import { PlaygroundComponent } from './features/playground/playground.component';
import { UpscaleComponent } from './features/upscale/upscale.component';
import { HeaderComponent } from './shared/components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    PlaygroundComponent,
    UpscaleComponent,
    ApiKeysComponent,
    AnalyticsComponent,
    DocsComponent,
    AuthComponent
  ],
  template: `
    <div
      class="min-h-screen bg-[#040914] text-slate-100 antialiased selection:bg-[#e21b24] selection:text-white relative spider-grid-pattern overflow-x-hidden"
    >
      <div class="relative z-10 w-full px-4 sm:px-6 lg:px-10 py-6 sm:py-8 flex flex-col gap-6">
        <app-header
          [activeTab]="compressionStore.activeTab()"
          (tabChange)="compressionStore.setTab($event)"
        >
        </app-header>

        <main class="w-full flex-1">
          <app-playground *ngIf="compressionStore.activeTab() === 'playground'"></app-playground>
          <app-upscale *ngIf="compressionStore.activeTab() === 'upscale'"></app-upscale>
          <app-api-keys *ngIf="compressionStore.activeTab() === 'apikeys'"></app-api-keys>
          <app-analytics *ngIf="compressionStore.activeTab() === 'analytics'"></app-analytics>
          <app-docs *ngIf="compressionStore.activeTab() === 'docs'"></app-docs>
        </main>

        <app-auth-modal></app-auth-modal>
      </div>
    </div>
  `
})
export class AppComponent {
  compressionStore = inject(CompressionStore);
  authStore = inject(AuthStore);

  ngOnInit() {
    this.compressionStore.loadAnalytics();
    this.compressionStore.loadApiKeys();
    this.authStore.checkSession();
  }
}


