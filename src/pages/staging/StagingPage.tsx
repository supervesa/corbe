// src/pages/staging/StagingPage.tsx
import React, { useEffect, useState } from 'react';
import { StagingDataTable, type FlatTickerData } from '../../widgets/StagingDataTable';
import { StagingCardList } from '../../widgets/StagingCardList';
import { fetchPendingTickers, approveTicker, rejectTicker } from '../../db/queries/staging';
import { Loader } from '../../ui/Loader';
import { Heading, Text, Prose } from '../../ui/Typography';
import { useSentinel } from '../../contexts/SentinelContext';
import { useToast } from '../../contexts/ToastContext';

export const StagingPage = () => {
  const { userProfile } = useSentinel();
  const { showToast } = useToast();
  const [data, setData] = useState<FlatTickerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Datan lataus (käyttää nyt userId:tä suodatukseen)
  useEffect(() => {
    const loadData = async () => {
      if (!userProfile?.id) return;
      setIsLoading(true);
      const tickers = await fetchPendingTickers(userProfile.id);
      setData(tickers);
      setIsLoading(false);
    };

    loadData();
  }, [userProfile?.id]);

  // 2. Yleinen käsittelijä Approve/Reject -toiminnoille (Optimistic UI)
  const handleAction = async (symbol: string, name: string, action: 'approve' | 'reject') => {
    if (!userProfile?.id) return;

    // Poistetaan osake VÄLITTÖMÄSTI ruudulta (Optimistic Update)
    setData(prevData => prevData.filter(item => item.symbol !== symbol));

    let error = null;

    if (action === 'approve') {
      const res = await approveTicker(userProfile.id, symbol);
      error = res.error;
      if (!error) showToast(`PROMOTED`, `${name} added to active portfolio.`, 'success');
    } else {
      const res = await rejectTicker(userProfile.id, symbol);
      error = res.error;
      if (!error) showToast(`ARCHIVED`, `${name} excluded from future screens.`, 'error'); // error-tyyli antaa oxblood-värin
    }

    // Jos kanta kaatuu (esim. verkkovirhe), tuodaan osake nätisti takaisin ja näytetään virhe
    if (error) {
      console.error("Action failed:", error);
      showToast('SYSTEM ERROR', `Failed to process ${symbol}. Please try again.`, 'error');
      // Ladataan data kokonaan uusiksi, jotta UI on synkassa kannan kanssa
      const refreshed = await fetchPendingTickers(userProfile.id);
      setData(refreshed);
    }
  };

  return (
    <div>
      {/* Otsikko ja lehtimäinen 2-palstainen johdantoteksti */}
      <section style={{ marginBottom: '3.5rem' }}>
        <Heading level={2} spacing="sm">
          Pending Discoveries
        </Heading>

        <Prose rule>
          <Text as="p" variant="muted" weight="light">
            Automated quantitative screening results awaiting executive approval. 
            Each candidate below has crossed the multi-horizon momentum threshold 
            during the latest market close cycle and is currently held in the 
            staging buffer prior to portfolio allocation.
          </Text>
          <Text as="p" variant="muted" weight="light">
            Review short-term divergence (1W / 1M) against structural trend baskets 
            (6M / 2Y) before promoting instruments to active tracking. Rejected 
            symbols are archived in the historical log and excluded from the next 
            screening pass.
          </Text>
        </Prose>
      </section>

      {isLoading ? (
        <Loader />
      ) : data.length > 0 ? (
        <>
          {/* Yläosan nostot (Kortit) */}
          <section style={{ marginBottom: '4rem' }}>
            <Heading level={3} variant="muted" spacing="md">
              Highlighted Trends
            </Heading>
            {/* Viedään onAction-funktio alas komponenteille */}
            <StagingCardList data={data} onAction={handleAction} />
          </section>

          {/* Välianalyysi / leipäteksti ennen taulukkoa */}
          <section style={{ marginBottom: '3rem' }}>
            <Heading level={3} variant="muted" spacing="sm">
              Screening Commentary
            </Heading>
            <Prose>
              <Text as="p" variant="muted" weight="light" size="sm">
                Industrial and technology constituents continue to demonstrate 
                relative resilience across the 6-month and 2-year observation windows, 
                compensating for near-term volatility in the weekly basket.
              </Text>
              <Text as="p" variant="muted" weight="light" size="sm">
                Energy sector candidates remain under mean-reversion watch following 
                sustained drawdowns. Verify liquidity and spread metrics in the 
                detailed breakdown below prior to execution.
              </Text>
            </Prose>
          </section>

          {/* Ala-osan analyysi (Taulukko) */}
          <section>
            <Heading level={3} variant="muted" spacing="md">
              Detailed Analysis (All Discoveries)
            </Heading>
            {/* Viedään onAction-funktio alas komponenteille */}
            <StagingDataTable data={data} onAction={handleAction} />
          </section>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <Text as="p" variant="muted" weight="light">
            No pending discoveries at the moment. The quantitative engine is monitoring for new anomalies.
          </Text>
        </div>
      )}
    </div>
  );
};