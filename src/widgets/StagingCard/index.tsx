import React from 'react';
import './StagingCard.css';
import { Sparkline } from '../../ui/Sparkline';
import { Button } from '../../ui/Button';
import { ambientBorder } from '../../commons/ambientBorder';

interface Props { 
  name: string; 
  symbol: string; // <-- LISÄTTY! Tarvitaan tietokantaa varten
  sector: string; 
  trend: string;
  history: number[];
  onAction: (symbol: string, name: string, action: 'approve' | 'reject') => void; // <-- LISÄTTY!
}

export const StagingCard = ({ name, symbol, sector, trend, history, onAction }: Props) => {
  const isPositive = trend.startsWith('+');
  const lineColor = isPositive ? 'var(--c-green)' : 'var(--c-accent)';

  return (
    <div 
      className="corbe-card" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column',
        ...ambientBorder()
      }}
    >
      
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
        
        {/* Napit kutsuvat nyt onAction-funktiota oikeilla parametreilla! */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
          <Button variant="danger" fullWidth onClick={() => onAction(symbol, name, 'reject')}>
            Reject
          </Button>

          <Button variant="primary" fullWidth onClick={() => onAction(symbol, name, 'approve')}>
            Approve
          </Button>
        </div>

      </div>
    </div>
  );
};