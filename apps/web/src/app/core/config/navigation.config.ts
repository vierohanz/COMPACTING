export type NavigationTab = 'playground' | 'upscale' | 'apikeys' | 'analytics' | 'docs';

export interface NavItem {
  id: NavigationTab;
  label: string;
}

export const NAVIGATION_ITEMS: NavItem[] = [
  { id: 'playground', label: 'Compressor' },
  { id: 'upscale', label: 'AI Upscaler' },
  { id: 'apikeys', label: 'API Keys' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'docs', label: 'Integration Docs' }
];
