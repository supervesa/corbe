import React from 'react';
import './StagingCard.css';
import { Sparkline } from '../../ui/Sparkline';
import { Button } from '../../ui/Button'; // Tuodaan uusi komponentti

interface Props { 
  name: string; 
  sector: string; 
  trend: string;
  history: number[];
}

export const StagingCard = ({ name, sector, trend, history }: Props) => {
  const isPositive = trend.startsWith('+');
  const lineColor = isPositive ? 'var(--c-green)' : 'var(--c-accent)';

  return (
    <div className="corbe-card" style={{ display: 'flex', flexDirection: 'column' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 className="font-display" style={{ margin: 0, fontSize: '1.1rem' }}>{name}</h3>
        <span className="font-numbers" style={{ color: lineColor, fontSize: '0.9rem' }}>
          {trend}
        </span>
      </div>
      
      <div style={{ margin: '0.5rem 0 1.5rem 0' }}>
        <Sparkline data={history} color={lineColor} />
      </div>

      <div style={{ marginTop: 'auto' }}>
        <p className="font-ui" style={{ color: 'var(--c-text-muted)', margin: '0 0 1.5rem 0', fontSize: '0.85rem' }}>
          Sector: {sector}<br/>Awaiting executive approval.
        </p>
        
        {/* Nappien asettelu rinnakkain (Grid) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
          {/* Harmaa, joka hoverilla muuttuu Oxblood punaiseksi */}
          <Button variant="danger" fullWidth onClick={() => console.log('Rejected')}>
            Reject
          </Button>

          {/* Oletus Primary: Kuparinen, jossa light-catch reuna */}
          <Button variant="primary" fullWidth onClick={() => console.log('Approved')}>
            Approve
          </Button>
        </div>

      </div>
    </div>
  );
};