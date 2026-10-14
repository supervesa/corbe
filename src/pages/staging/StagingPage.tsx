import React, { useEffect, useState } from 'react';
import { StagingDataTable, type FlatTickerData } from '../../widgets/StagingDataTable';
import { StagingCardList } from '../../widgets/StagingCardList';
import { fetchPendingTickers } from '../../db/queries/staging';
import { Loader } from '../../ui/Loader';

export const StagingPage = () => {
  const [data, setData] = useState<FlatTickerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const tickers = await fetchPendingTickers();
      setData(tickers);
      setIsLoading(false);
    };

    loadData();
  }, []);

  return (
    <div style={{ padding: '0 1.5rem', maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      
      <div style={{ marginBottom: '3rem', paddingTop: '2rem' }}>
        <h2 className="font-display" style={{ fontSize: '1.5rem', color: 'var(--c-text)', fontWeight: 'var(--fw-light)', marginBottom: '0.5rem' }}>
          Pending Discoveries
        </h2>
        <p className="font-ui" style={{ color: 'var(--c-text-muted)', fontSize: '0.95rem', fontWeight: 'var(--fw-light)', margin: 0 }}>
          Automated quantitative screening results. Awaiting executive approval.
        </p>
      </div>

      {isLoading ? (
        <Loader />
      ) : data.length > 0 ? (
        <>
          {/* Yläosan nostot (Kortit) */}
          <div style={{ marginBottom: '4rem' }}>
            <h3 className="font-display" style={{ fontSize: '1.1rem', color: 'var(--c-text-muted)', marginBottom: '1.5rem' }}>
              Highlighted Trends
            </h3>
            <StagingCardList data={data} />
          </div>

          {/* Ala-osan analyysi (Taulukko) */}
          <div>
            <h3 className="font-display" style={{ fontSize: '1.1rem', color: 'var(--c-text-muted)', marginBottom: '1.5rem' }}>
              Detailed Analysis (All Discoveries)
            </h3>
            <StagingDataTable data={data} />
          </div>
        </>
      ) : (
        <p className="font-ui" style={{ color: 'var(--c-text-muted)' }}>No pending discoveries at the moment.</p>
      )}
      
    </div>
  );
};