import React from 'react';
import { TopNavigation } from '../widgets/TopNavigation';

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <TopNavigation />
      <main style={{ marginTop: '2rem' }}>
        {children}
      </main>
    </div>
  );
};