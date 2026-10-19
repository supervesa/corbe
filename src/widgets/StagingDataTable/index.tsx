import React from 'react';
import { Tag, Text } from '../../ui/Typography';
import { Button } from '../../ui/Button';
import { FlexTable, type ColumnDef } from '../../ui/FlexTable';
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

export interface FlatTickerData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  meta: {
    sector: string;
    baskets: { '1w': number; '1m': number; '6m': number; '2y': number };
  };
  market?: MarketSnapshot;
  history?: number[];
  indicators?: TickerIndicators;
  pattern_embedding?: number[];
  ai_prediction?: AIPredictionData;
}

interface TableProps {
  data: FlatTickerData[];
  onAction: (symbol: string, name: string, action: 'approve' | 'reject') => void;
  onAnalyze: (row: FlatTickerData) => void; // <-- LISÄTTY: Avaa Asset Terminalin
}

export const StagingDataTable = ({ data, onAction, onAnalyze }: TableProps) => {
  const formatTrend = (val: number) => {
    const isPos = val >= 0;
    return (
      <Text variant={isPos ? 'green' : 'accent'} tabular size="sm">
        {isPos ? '+' : ''}
        {val.toFixed(2)}%
      </Text>
    );
  };

  const columns: ColumnDef<FlatTickerData>[] = [
    {
      header: 'Asset',
      flex: 1.8,
      render: (row) => (
        // LISÄTTY: Klikattavuus ja hover-tyyli nimeen
        <div style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }} onClick={() => onAnalyze(row)}>
          <Text variant="primary" style={{ textDecoration: 'underline', textUnderlineOffset: '4px', textDecorationColor: 'rgba(255,255,255,0.2)' }}>
            {row.name}
          </Text>
          <Text variant="muted" size="sm" tabular>
            {row.symbol}
          </Text>
        </div>
      ),
    },
    {
      header: 'Sector',
      flex: 1.3,
      render: (row) => <Tag label={row.meta.sector} variant="copper" />,
    },
    {
      header: 'Price / Vol',
      flex: 1.2,
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Text tabular>€{row.price.toFixed(2)}</Text>
          {row.market?.volume !== undefined && (
            <Text variant="muted" size="sm" tabular>
              Vol {formatVolume(row.market.volume)}
            </Text>
          )}
        </div>
      ),
    },
    {
      header: '1W / 2Y',
      flex: 1.1,
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {formatTrend(row.meta.baskets['1w'])}
          {formatTrend(row.meta.baskets['2y'])}
        </div>
      ),
    },
    {
      header: 'Technicals',
      flex: 1.4,
      render: (row) => {
        if (!row.indicators) {
          return <Text variant="muted" size="sm">—</Text>;
        }
        const rsi = getRsiStatus(row.indicators.RSI_14);
        const macd = row.indicators.MACD;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', alignItems: 'flex-start' }}>
            <Tag label={rsi.label} variant={rsi.variant} />
            {macd !== undefined && (
              <Text variant="muted" size="sm" tabular>
                MACD {macd > 0 ? '+' : ''}{macd.toFixed(2)}
              </Text>
            )}
          </div>
        );
      },
    },
    {
      header: 'AI Signal',
      flex: 1.3,
      render: (row) => {
        const ai = row.ai_prediction;
        if (!ai) {
          return <Text variant="muted" size="sm" tabular>—</Text>;
        }
        const isPos = ai.predicted_trend >= 0;
        return (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Text variant={isPos ? 'green' : 'accent'} size="sm" tabular>
              TGT: {formatSignedPercent(ai.predicted_trend, 1)} ({formatHorizon(ai.target_horizon)})
            </Text>
            <Text variant="muted" size="sm" tabular>
              {ai.confidence_score.toFixed(0)}% conf.
            </Text>
          </div>
        );
      },
    },
    {
      header: '',
      flex: 2.2, // Levennetty aavistus jotta 3 nappia mahtuu nätisti
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          {/* LISÄTTY: Analyze-nappi avaa modaalin */}
          <Button variant="ghost" size="sm" onClick={() => onAnalyze(row)}>Analyze</Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onAction(row.symbol, row.name, 'reject')}
          >
            Reject
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onAction(row.symbol, row.name, 'approve')}
          >
            Approve
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div
      style={{
        borderTop: '1px solid var(--c-card)',
        borderBottom: '1px solid var(--c-card)',
        overflowX: 'auto',
        maxWidth: '100%',
      }}
    >
      <FlexTable data={data} columns={columns} keyExtractor={(item) => item.id} />
    </div>
  );
};