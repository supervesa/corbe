import React from 'react';
import { StagingCard } from '../StagingCard';
import type { FlatTickerData } from '../StagingDataTable'; // Tuodaan tyyppi

interface Props {
  data: FlatTickerData[];
}

export const StagingCardList = ({ data }: Props) => {
  // Otetaan listasta vain 3 ensimmäistä osaketta "Highlight" -korteiksi
  const topPicks = data.slice(0, 3);

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
      gap: '2rem' 
    }}>
      {topPicks.map((item) => {
        // 1. Muotoillaan 1 viikon trendi tekstiksi (esim. "+4.50%")
        const trendVal = item.meta.baskets['1w'];
        const trendString = `${trendVal > 0 ? '+' : ''}${trendVal.toFixed(2)}%`;

        // 2. Koska Python-botti ei vielä tallenna oikeaa kurssihistoriaa kantaan,
        // generoidaan nykyhinnan ympärille nätin näköinen satunnainen "fake" -käyrä.
        // Tämän voi korvata myöhemmin esim: item.meta.history
        const mockHistory = Array.from({ length: 15 }, (_, i) => {
          const volatility = item.price * 0.05;
          return item.price + (Math.sin(i) * volatility) + (trendVal > 0 ? i : -i);
        });

        return (
          <StagingCard 
            key={item.id}
            name={item.name} 
            sector={item.meta.sector} 
            trend={trendString} 
            history={mockHistory}
          />
        );
      })}
    </div>
  );
};