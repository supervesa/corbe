import React from 'react';

export const TopNavigation = () => {
  return (
    <header style={{ padding: '2rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ 
        border: '1px solid var(--c-text-muted)', padding: '0.4rem 1.2rem',
        fontSize: '1.4rem', letterSpacing: '0.1em'
      }}>Corbè</div>
      <nav style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem' }}>
        <span style={{ color: 'var(--c-text-muted)' }}>Portfolios</span>
        <span style={{ color: 'var(--c-text-muted)' }}>Analytics</span>
        <span style={{ color: 'var(--c-accent)', borderBottom: '1px solid var(--c-accent)', paddingBottom: '0.2rem' }}>Staging Area</span>
      </nav>
    </header>
  );
};