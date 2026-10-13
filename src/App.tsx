import React from 'react';
import './commons/css/global.css';
import { AppLayout } from './layouts/AppLayout';
import { StagingPage } from './pages/staging/StagingPage';

export default function App() {
  return (
    <AppLayout>
      <StagingPage />
    </AppLayout>
  );
}