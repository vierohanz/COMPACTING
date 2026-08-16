export type NavigationTab = 'playground' | 'apikeys' | 'analytics' | 'docs';

export interface NavItem {
  id: NavigationTab;
  label: string;
}

export const NAVIGATION_ITEMS: NavItem[] = [
  { id: 'playground', label: 'Playground' },
  { id: 'apikeys', label: 'API Keys' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'docs', label: 'Integration Docs' }
];
