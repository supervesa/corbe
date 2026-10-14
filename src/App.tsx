// src/App.tsx
import React from 'react';
import './commons/css/global.css';

import { SentinelProvider, useSentinel } from './contexts/SentinelContext';
import { AppLayout } from './layouts/AppLayout';
import { StagingPage } from './pages/staging/StagingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { Loader } from './ui/Loader';

// Tämä komponentti sisältää varsinaisen reitityslogiikan
const Gatekeeper = () => {
  const { userProfile, isSentinelLoading, hasRole, hasModule } = useSentinel();

  // 1. Lataus käynnissä
  if (isSentinelLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader />
      </div>
    );
  }

  // 2. Ei kirjautunut -> Näytä Login
  if (!userProfile) {
    return <LoginPage />;
  }

  // 3. Kirjautunut, mutta ei oikeuksia!
  // Vaaditaan 'superadmin' ja 'corbe' moduuli
  if (!hasRole('superadmin') || !hasModule('corbe')) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--c-accent)', fontSize: '3rem', marginBottom: '1rem' }}>✗</div>
        <h1 className="font-display" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>ACCESS DENIED</h1>
        <p className="font-ui" style={{ color: 'var(--c-text-muted)' }}>Executive clearance required.</p>
        <button 
          onClick={() => window.location.reload()} 
          style={{ marginTop: '2rem', background: 'none', border: '1px solid var(--c-text-muted)', color: 'var(--c-text)', padding: '0.5rem 1rem', cursor: 'pointer' }}
        >
          Sign Out
        </button>
      </div>
    );
  }

  // 4. Kaikki kunnossa -> Pääsy myönnetty sovellukseen!
  return (
    <AppLayout>
      <StagingPage />
    </AppLayout>
  );
};

// Pääkomponentti käärii kaiken Provideriin
export default function App() {
  return (
    <SentinelProvider>
      <Gatekeeper />
    </SentinelProvider>
  );
}