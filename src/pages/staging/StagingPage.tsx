import React from 'react';
import { StagingDataTable } from '../../widgets/StagingDataTable';
import { StagingCardList } from '../../widgets/StagingCardList';

// Taulukon esimerkkidata
const mockFlatData = [
  {
    id: '1',
    symbol: 'VALMT.HE',
    name: 'Valmet Oyj',
    status: 'pending',
    price: 26.45,
    meta: {
      sector: 'Industrials',
      baskets: { '1w': -2.10, '1m': 4.50, '6m': 12.0, '2y': 34.20 }
    }
  },
  {
    id: '2',
    symbol: 'GOFORE.HE',
    name: 'Gofore Oyj',
    status: 'pending',
    price: 18.20,
    meta: {
      sector: 'Technology',
      baskets: { '1w': 1.20, '1m': 8.40, '6m': 5.20, '2y': 45.10 }
    }
  },
  {
    id: '3',
    symbol: 'NESTE.HE',
    name: 'Neste Oyj',
    status: 'pending',
    price: 24.10,
    meta: {
      sector: 'Energy',
      baskets: { '1w': -4.20, '1m': -8.10, '6m': -15.4, '2y': -22.0 }
    }
  }
];

export const StagingPage = () => {
  return (
    <div style={{ padding: '0 1.5rem', maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      
      {/* Pääotsikko */}
      <div style={{ marginBottom: '3rem', paddingTop: '2rem' }}>
        <h2 className="font-display" style={{ fontSize: '1.5rem', color: 'var(--c-text)', fontWeight: 'var(--fw-light)', marginBottom: '0.5rem' }}>
          Pending Discoveries
        </h2>
        <p className="font-ui" style={{ color: 'var(--c-text-muted)', fontSize: '0.95rem', fontWeight: 'var(--fw-light)', margin: 0 }}>
          Automated quantitative screening results. Awaiting executive approval.
        </p>
      </div>

      {/* 1. Osuus: Nätit graafikortit (Widgetit) */}
      <div style={{ marginBottom: '4rem' }}>
        <h3 className="font-display" style={{ fontSize: '1.1rem', color: 'var(--c-text-muted)', marginBottom: '1.5rem' }}>
          Highlighted Trends
        </h3>
        <StagingCardList />
      </div>

      {/* 2. Osuus: Yksityiskohtainen taulukko */}
      <div>
        <h3 className="font-display" style={{ fontSize: '1.1rem', color: 'var(--c-text-muted)', marginBottom: '1.5rem' }}>
          Detailed Analysis (All Discoveries)
        </h3>
        <StagingDataTable data={mockFlatData as any} />
      </div>
      
    </div>
  );
};