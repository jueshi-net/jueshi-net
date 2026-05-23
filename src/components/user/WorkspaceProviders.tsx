'use client';

import { UserPreferencesProvider } from './UserPreferencesContext';

export function WorkspaceProviders({ children }: { children: React.ReactNode }) {
  return (
    <UserPreferencesProvider>
      {children}
    </UserPreferencesProvider>
  );
}
