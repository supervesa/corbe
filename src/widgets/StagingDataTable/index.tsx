// src/widgets/StagingDataTable/index.tsx
import React from 'react';
import { Tag, Text } from '../../ui/Typography';
import { Button } from '../../ui/Button';
import { FlexTable, type ColumnDef } from '../../ui/FlexTable'; // <-- TÄMÄ 'type' SANA KORJASI ONGELMAN!

export interface FlatTickerData {
  id: string;
  symbol: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected';
  price: number;
  meta: {
    sector: string;
    baskets: { '1w': number; '1m': number; '6m': number; '2y': number; };
  };
}

interface TableProps {
  data: FlatTickerData[];
}

export const StagingDataTable = ({ data }: TableProps) => {

  const formatTrend = (val: number) => {
    const isPos = val >= 0;
    return (
      <Text variant={isPos ? 'green' : 'accent'} tabular size="sm">
        {isPos ? '+' : ''}{val.toFixed(2)}%
      </Text>
    );
  };

  const columns: ColumnDef<FlatTickerData>[] = [
    {
      header: 'Asset',
      flex: 2,
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Text variant="primary">{row.name}</Text>
          <Text variant="muted" size="sm" tabular>{row.symbol}</Text>
        </div>
      )
    },
    {
      header: 'Sector',
      flex: 1.5,
      render: (row) => <Tag label={row.meta.sector} variant="copper" />
    },
    {
      header: 'Price',
      flex: 1,
      render: (row) => <Text tabular>€{row.price.toFixed(2)}</Text>
    },
    {
      header: '1W Trend',
      flex: 1,
      render: (row) => formatTrend(row.meta.baskets['1w'])
    },
    {
      header: '2Y Trend',
      flex: 1,
      render: (row) => formatTrend(row.meta.baskets['2y'])
    },
    {
      header: '', 
      flex: 2,
      align: 'right', 
      render: () => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="danger" size="sm">Reject</Button>
          <Button variant="primary" size="sm">Approve</Button>
        </div>
      )
    }
  ];

  return (
    <div style={{ borderTop: '1px solid var(--c-card)', borderBottom: '1px solid var(--c-card)' }}>
      <FlexTable 
        data={data} 
        columns={columns} 
        keyExtractor={(item) => item.id} 
      />
    </div>
  );
};