// src/widgets/StagingCardList/StagingCardList.tsx
import React from 'react';
import { StagingCard } from '../StagingCard';
import type { FlatTickerData } from '../StagingDataTable';

interface Props {
  data: FlatTickerData[];
  onAction: (symbol: string, name: string, action: 'approve' | 'reject') => void;
}

export const StagingCardList = ({ data, onAction }: Props) => {
  // Nostetaan kärkeen ne osakkeet, joilla on vahvin AI-luottamusaste
  const topPicks = [...data]
    .sort((a, b) => (b.ai_prediction?.confidence_score ?? 0) - (a.ai_prediction?.confidence_score ?? 0))
    .slice(0, 3);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '2rem',
      }}
    >
      {topPicks.map((item) => {
        const trendVal = item.meta.baskets['1w'];
        const trendString = `${trendVal > 0 ? '+' : ''}${trendVal.toFixed(2)}%`;

        // 1. Jos kanta palauttaa useamman päivän päätöskurssit, käytetään niitä suoraan.
        // 2. Jos kannassa on vasta 1 pörssipäivä, muodostetaan oikea päivänsisäinen polku (open -> low/high -> close).
        // 3. Muuten käytetään mockHistory-varakäyrää.
        let chartHistory: number[];
        if (item.history && item.history.length >= 2) {
          chartHistory = item.history;
        } else if (item.market) {
          const { open, high, low, close } = item.market;
          chartHistory = close >= open ? [open, low, high, close] : [open, high, low, close];
        } else {
          chartHistory = Array.from({ length: 15 }, (_, i) => {
            const volatility = item.price * 0.05;
            return item.price + Math.sin(i) * volatility + (trendVal > 0 ? i : -i);
          });
        }

        return (
          <StagingCard
            key={item.id}
            name={item.name}
            symbol={item.symbol}
            sector={item.meta.sector}
            price={item.price}
            trend={trendString}
            history={chartHistory}
            market={item.market}
            indicators={item.indicators}
            aiPrediction={item.ai_prediction}
            onAction={onAction}
          />
        );
      })}
    </div>
  );
};