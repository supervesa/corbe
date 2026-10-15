import React from 'react';
import { StagingCard } from '../StagingCard';
import type { FlatTickerData } from '../StagingDataTable'; 

interface Props {
  data: FlatTickerData[];
  onAction: (symbol: string, name: string, action: 'approve' | 'reject') => void; // <-- LISÄTTY!
}

export const StagingCardList = ({ data, onAction }: Props) => {
  const topPicks = data.slice(0, 3);

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
      gap: '2rem' 
    }}>
      {topPicks.map((item) => {
        const trendVal = item.meta.baskets['1w'];
        const trendString = `${trendVal > 0 ? '+' : ''}${trendVal.toFixed(2)}%`;

        const mockHistory = Array.from({ length: 15 }, (_, i) => {
          const volatility = item.price * 0.05;
          return item.price + (Math.sin(i) * volatility) + (trendVal > 0 ? i : -i);
        });

        return (
          <StagingCard 
            key={item.id}
            name={item.name} 
            symbol={item.symbol} // <-- LISÄTTY! Välitetään kortille
            sector={item.meta.sector} 
            trend={trendString} 
            history={mockHistory}
            onAction={onAction}  // <-- LISÄTTY! Välitetään kortille
          />
        );
      })}
    </div>
  );
};