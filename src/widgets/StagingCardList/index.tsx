// src/widgets/StagingCardList/index.tsx
import React from 'react';
import { StagingCard } from '../StagingCard';

export const StagingCardList = () => {
  // Kuvitteellista käyrädataa (esim. viimeiset 30 päivää)
  const dataValmet = [24, 25, 23.5, 26, 26.5, 25.8, 27, 28, 29.5];
  const dataGofore = [18, 17.5, 17, 18, 19, 18.5, 19, 19.5, 19.2];
  const dataNeste = [32, 31, 29, 27, 28, 26, 25.5, 24, 23]; // Laskeva trendi!

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
      gap: '2rem' 
    }}>
      <StagingCard 
        name="Valmet Oyj" 
        sector="Industrials" 
        trend="+3.76%" 
        history={dataValmet}
      />
      <StagingCard 
        name="Gofore Oyj" 
        sector="Technology" 
        trend="+1.20%" 
        history={dataGofore}
      />
      <StagingCard 
        name="Neste Oyj" 
        sector="Energy" 
        trend="-4.20%" 
        history={dataNeste}
      />
    </div>
  );
};