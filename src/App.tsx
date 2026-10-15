// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './commons/css/global.css';

import { SentinelProvider, useSentinel } from './contexts/SentinelContext';
import { ToastProvider } from './contexts/ToastContext';
import { AppLayout } from './layouts/AppLayout';
import { WalletPage } from './pages/wallet/WalletPage';
import { StagingPage } from './pages/staging/StagingPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { LoginPage } from './pages/auth/LoginPage';
import { Loader } from './ui/Loader';

// Uudet sivut tuotu sisään!
import { ActivePortfolioPage } from './pages/portfolios/ActivePortfolioPage';
import { RejectedPage } from './pages/staging/RejectedPage';

// --- VÄLIAIKAISET PLACEHOLDER-SIVUT ---
// PortfoliosDummy poistettu, koska meillä on nyt oikea salkkusivu!
const AnalyticsDummy = () => <div style={{ padding: '0 3rem' }}><h2 className="font-display">Analytics Module</h2><p className="font-ui" style={{color: 'var(--c-text-muted)'}}>Coming soon...</p></div>;

// --- PORTINVARTIJA (Protected Route) ---
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { userProfile, isSentinelLoading, hasRole, hasModule } = useSentinel();

  if (isSentinelLoading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader /></div>;
  }

  // Jos ei kirjautunut -> heitä login-sivulle
  if (!userProfile) {
    return <Navigate to="/login" replace />;
  }

  // Jos ei oikeuksia -> näytä Access Denied
  if (!hasRole('superadmin') || !hasModule('corbe')) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--c-accent)', fontSize: '3rem', marginBottom: '1rem' }}>✗</div>
        <h1 className="font-display" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>ACCESS DENIED</h1>
        <p className="font-ui" style={{ color: 'var(--c-text-muted)' }}>Executive clearance required.</p>
        <button 
          onClick={() => window.location.href = '/login'} 
          style={{ marginTop: '2rem', background: 'none', border: '1px solid var(--c-text-muted)', color: 'var(--c-text)', padding: '0.5rem 1rem', cursor: 'pointer' }}
        >
          Sign Out
        </button>
      </div>
    );
  }

  // Pääsy myönnetty! Kääritään sivu AppLayout-kehykseen (jossa on valikko)
  return <AppLayout>{children}</AppLayout>;
};

// --- PÄÄSOVELLUS & REITITYS ---
export default function App() {
  return (
    <BrowserRouter>
      <SentinelProvider>
        <ToastProvider> 
          <Routes>
            
            {/* Julkinen reitti */}
            <Route path="/login" element={<LoginPage />} />

            {/* Suojatut reitit */}
            <Route path="/" element={<ProtectedRoute><Navigate to="/staging" replace /></ProtectedRoute>} />
            
            {/* ETEINEN */}
            <Route path="/staging" element={<ProtectedRoute><StagingPage /></ProtectedRoute>} />

            {/* LOMPAKKO */}
            <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />

            <Route path="/staging/approved" element={<ProtectedRoute><Navigate to="/portfolios/active" replace /></ProtectedRoute>} />
            
            {/* HYLÄTYT (Archived) */}
            <Route path="/staging/rejected" element={<ProtectedRoute><RejectedPage /></ProtectedRoute>} />
            
            {/* AKTIIVINEN SALKKU */}
            <Route path="/portfolios/active" element={<ProtectedRoute><ActivePortfolioPage /></ProtectedRoute>} />
            
            {/* ANALYTIIKKA (Vielä tyhjä) */}
            <Route path="/analytics" element={<ProtectedRoute><AnalyticsDummy /></ProtectedRoute>} />3

            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

          </Routes>
        </ToastProvider> 
      </SentinelProvider>
    </BrowserRouter>
  );
}