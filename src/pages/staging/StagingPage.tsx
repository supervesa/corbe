import React, { useEffect, useState } from 'react';
import { StagingDataTable, type FlatTickerData } from '../../widgets/StagingDataTable';
import { StagingCardList } from '../../widgets/StagingCardList';
import { fetchPendingTickers } from '../../db/queries/staging';
import { Loader } from '../../ui/Loader';
import { Heading, Text, Prose } from '../../ui/Typography';

// Varadata (Placeholder), jos tietokannasta ei löydy rivejä
const PLACEHOLDER_TICKERS: FlatTickerData[] = [
  {
    id: '47b46e7f-d795-4b97-b2c0-6f2099cf46fa',
    symbol: 'VALMT.HE',
    name: 'Valmet Oyj',
    price: 26.45,
    meta: {
      sector: 'Industrials',
      baskets: { '1w': -2.1, '1m': 4.5, '6m': 12.0, '2y': 34.2 },
    },
    created_at: '2026-10-14T17:08:29.230539+00:00',
  } as unknown as FlatTickerData,
  {
    id: '7289b686-0026-4a0c-9259-c4aa94cbc8a2',
    symbol: 'GOFORE.HE',
    name: 'Gofore Oyj',
    price: 18.2,
    meta: {
      sector: 'Technology',
      baskets: { '1w': 1.2, '1m': 8.4, '6m': 5.2, '2y': 45.1 },
    },
    created_at: '2026-10-14T17:08:29.230539+00:00',
  } as unknown as FlatTickerData,
  {
    id: '9192d864-468b-46c8-b092-c29e73ce19ec',
    symbol: 'NESTE.HE',
    name: 'Neste Oyj',
    price: 24.1,
    meta: {
      sector: 'Energy',
      baskets: { '1w': -4.2, '1m': -8.1, '6m': -15.4, '2y': -22.0 },
    },
    created_at: '2026-10-14T17:08:29.230539+00:00',
  } as unknown as FlatTickerData,
];

export const StagingPage = () => {
  const [data, setData] = useState<FlatTickerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const tickers = await fetchPendingTickers();
      // Jos kanta palauttaa tyhjää, näytetään placeholder-osakkeet
      setData(tickers.length > 0 ? tickers : PLACEHOLDER_TICKERS);
      setIsLoading(false);
    };

    loadData();
  }, []);

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
            <StagingCardList data={data} />
          </section>

          {/* Välianalyysi / leipäteksti ennen taulukkoa */}
          <section style={{ marginBottom: '3rem' }}>
            <Heading level={3} variant="muted" spacing="sm">
              Screening Commentary
            </Heading>
            <Prose>
              <Text as="p" variant="muted" weight="light" size="sm">
                Industrial and technology constituents continue to demonstrate 
                relative resilience across the 6-month ja 2-year observation windows, 
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
            <StagingDataTable data={data} />
          </section>
        </>
      ) : (
        <Text as="p" variant="muted" weight="light">
          No pending discoveries at the moment.
        </Text>
      )}
    </div>
  );
};