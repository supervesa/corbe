// src/widgets/StagingCard/StagingCard.tsx
import React from 'react';
import './StagingCard.css';
import { Sparkline } from '../../ui/Sparkline';
import { Button } from '../../ui/Button';
import { Tag, Text } from '../../ui/Typography';
import { MetricBar } from '../../ui/MetricBar';
import { ambientBorder } from '../../commons/ambientBorder';
import {
  formatVolume,
  formatSignedPercent,
  formatHorizon,
  getRsiStatus,
} from '../../commons/formatters';
import type {
  MarketSnapshot,
  TickerIndicators,
  AIPredictionData,
} from '../../db/queries/staging';

interface Props {
  name: string;
  symbol: string;
  sector: string;
  price: number;
  trend: string;
  history: number[];
  market?: MarketSnapshot;
  indicators?: TickerIndicators;
  aiPrediction?: AIPredictionData;
  onAction: (symbol: string, name: string, action: 'approve' | 'reject') => void;
}

export const StagingCard = ({
  name,
  symbol,
  sector,
  price,
  trend,
  history,
  market,
  indicators,
  aiPrediction,
  onAction,
}: Props) => {
  const isPositive = trend.startsWith('+');
  const lineColor = isPositive ? 'var(--c-green)' : 'var(--c-accent)';
  const rsiStatus = getRsiStatus(indicators?.RSI_14);

  return (
    <div
      className="corbe-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        ...ambientBorder('var(--c-card)'),
      }}
    >
      {/* Ylärivi: Nimi, symboli, nykyhinta ja 1W-trendi */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div>
          <h3 className="font-display" style={{ margin: 0, fontSize: '1.1rem' }}>
            {name}
          </h3>
          <Text size="sm" variant="muted" tabular>
            {symbol} • €{price.toFixed(2)}
          </Text>
        </div>

        <span className="font-numbers" style={{ color: lineColor, fontSize: '0.95rem' }}>
          {trend}
        </span>
      </div>

      {/* Sparkline-käyrä */}
      <div style={{ margin: '0.5rem 0 1.25rem 0' }}>
        <Sparkline data={history} color={lineColor} />
      </div>

      {/* Tekniset indikaattorit (Sektori, RSI-14 ja MACD) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
        <Tag label={sector} variant="copper" />
        {indicators?.RSI_14 !== undefined && (
          <Tag label={rsiStatus.label} variant={rsiStatus.variant} />
        )}
        {indicators?.MACD !== undefined && (
          <Tag
            label={`MACD ${indicators.MACD > 0 ? '+' : ''}${indicators.MACD.toFixed(2)}`}
            variant={indicators.MACD >= 0 ? 'green' : 'default'}
          />
        )}
      </div>

      {/* AI-ennuste (jos saatavilla) tai RSI-mittari + Volyymi */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: '0.9rem',
          marginBottom: '1.25rem',
          borderTop: '1px solid var(--c-border-subtle, rgba(255,255,255,0.07))',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem',
        }}
      >
        {aiPrediction ? (
          <MetricBar
            label={`AI Target (${formatHorizon(aiPrediction.target_horizon)}): ${formatSignedPercent(aiPrediction.predicted_trend, 1)}`}
            value={aiPrediction.confidence_score}
            displayValue={`${aiPrediction.confidence_score.toFixed(0)}% conf.`}
            tone={aiPrediction.predicted_trend >= 0 ? 'green' : 'accent'}
          />
        ) : indicators?.RSI_14 !== undefined ? (
          <MetricBar
            label="Momentum (RSI-14)"
            value={indicators.RSI_14}
            displayValue={indicators.RSI_14.toFixed(1)}
            tone="copper"
          />
        ) : null}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
          <Text size="sm" variant="muted" weight="light">
            {market?.date ? `Close ${market.date}` : 'Awaiting approval'}
          </Text>
          <Text size="sm" variant="muted" tabular>
            Vol {formatVolume(market?.volume)}
          </Text>
        </div>
      </div>

      {/* Toimintonapit */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
        <Button variant="danger" fullWidth onClick={() => onAction(symbol, name, 'reject')}>
          Reject
        </Button>

        <Button variant="primary" fullWidth onClick={() => onAction(symbol, name, 'approve')}>
          Approve
        </Button>
      </div>
    </div>
  );
};