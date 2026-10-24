// src/pages/portfolios/ArchivedPortfolioPage.tsx
import React, { useEffect, useState } from 'react';
import { corbeClient } from '../../db/corbeClient';
import { useSentinel } from '../../contexts/SentinelContext';
import { Loader } from '../../ui/Loader';
import { Heading, Text, Prose, Tag } from '../../ui/Typography';
import { FlexTable, type ColumnDef } from '../../ui/FlexTable';

interface ArchivedTicker {
  id: string;
  symbol: string;
  total_profit_loss_eur: number;
  archived_at: string;
  strategy_type: 'core' | 'blitz';
  archived_by: string;
  name?: string; // Haetaan lennosta
}

export const ArchivedPortfolioPage = () => {
  const { userProfile } = useSentinel();
  const [data, setData] = useState<ArchivedTicker[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!userProfile?.id) return;
      setIsLoading(true);
      
      // 1. Hae arkistoidut rivit
      const { data: archived } = await corbeClient
        .from('archived_portfolio')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('archived_at', { ascending: false });
      
      if (!archived || archived.length === 0) {
        setData([]);
        setIsLoading(false);
        return;
      }

      // 2. Hae oikeat yhtiönimet Universumista
      const symbols = archived.map(a => a.symbol);
      const { data: config } = await corbeClient
        .from('config_tickers')
        .select('symbol, name')
        .in('symbol', symbols);

      const nameMap = new Map(config?.map(c => [c.symbol, c.name]) || []);

      // 3. Rikasta data nimillä
      const enriched = archived.map(a => ({
        ...a,
        name: nameMap.get(a.symbol) || a.symbol
      }));

      setData(enriched as ArchivedTicker[]);
      setIsLoading(false);
    };

    loadData();
  }, [userProfile?.id]);

  const columns: ColumnDef<ArchivedTicker>[] = [
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
      header: 'Strategy', 
      flex: 1.2, 
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Tag 
            label={row.strategy_type?.toUpperCase() || 'CORE'} 
            variant={row.strategy_type === 'blitz' ? 'copper' : 'default'} 
          />
          {row.archived_by === 'harry_the_broker' && (
            <span title="Sold by Harry the Broker" style={{ fontSize: '1.2rem' }}>🤖</span>
          )}
        </div>
      ) 
    },
    {
      header: 'Realized P&L',
      flex: 1,
      render: (row) => {
        const isPos = row.total_profit_loss_eur >= 0;
        return (
          <Text variant={isPos ? 'green' : 'accent'} tabular>
            {isPos ? '+' : ''}€{Number(row.total_profit_loss_eur).toFixed(2)}
          </Text>
        );
      }
    },
    {
      header: 'Archived Date',
      flex: 1.5,
      render: (row) => <Text variant="muted" size="sm">{new Date(row.archived_at).toLocaleString('fi-FI')}</Text>
    }
  ];

  return (
    <div style={{ padding: '0 1.5rem', maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      <section style={{ marginBottom: '3.5rem', paddingTop: '2rem' }}>
        <Heading level={2} spacing="sm">Archived Portfolio</Heading>
        <Prose rule>
          <Text as="p" variant="muted" weight="light">
            Historical record of fully exited positions. This ledger tracks realized returns and serves as a feedback loop for quantitative strategy evaluation.
          </Text>
        </Prose>
      </section>

      {isLoading ? <Loader /> : data.length > 0 ? (
        <FlexTable data={data} columns={columns} keyExtractor={(item) => item.id} />
      ) : (
        <Text as="p" variant="muted" weight="light">No archived positions found.</Text>
      )}
    </div>
  );
};