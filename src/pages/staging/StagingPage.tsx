import React from 'react';
import { StagingCardList } from '../../widgets/StagingCardList';

export const StagingPage = () => {
  return (
    <div style={{ padding: '0 3rem' }}>
      
      {/* Ylätunnisteen alue, johon on jätetty reilusti eleganttia tyhjää tilaa alle */}
      <div style={{ marginBottom: '4rem' }}>
        <h2 
          className="font-display" 
          style={{ 
            fontSize: '1.5rem', 
            color: 'var(--c-text)',
            fontWeight: 'var(--fw-light)',
            marginBottom: '0.5rem'
          }}
        >
          Pending Discoveries
        </h2>
        <p 
          className="font-ui"
          style={{ 
            color: 'var(--c-text-muted)', 
            fontSize: '0.95rem',
            fontWeight: 'var(--fw-light)',
            margin: 0
          }}
        >
          Automated quantitative screening results. Awaiting executive approval.
        </p>
      </div>

      {/* Itse korttilistaus */}
      <StagingCardList />
      
    </div>
  );
};