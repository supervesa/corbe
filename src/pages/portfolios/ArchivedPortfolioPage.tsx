// src/pages/portfolios/ArchivedPortfolioPage.tsx
import React, { useEffect, useState } from 'react';
import { corbeClient } from '../../db/corbeClient';
import { useSentinel } from '../../contexts/SentinelContext';
import { Loader } from '../../ui/Loader';
import { Heading, Text, Prose } from '../../ui/Typography';
import { FlexTable, type ColumnDef } from '../../ui/FlexTable';

interface ArchivedTicker {
  id: string;
  symbol: string;
  total_profit_loss_eur: number;
  archived_at: string;
}

export const ArchivedPortfolioPage = () => {
  const { userProfile } = useSentinel();
  const [data, setData] = useState<ArchivedTicker[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!userProfile?.id) return;
      setIsLoading(true);
      const { data: archived } = await corbeClient
        .from('archived_portfolio')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('archived_at', { ascending: false });
      
      setData(archived as ArchivedTicker[] || []);
      setIsLoading(false);
    };
    loadData();
  }, [userProfile?.id]);

  const columns: ColumnDef<ArchivedTicker>[] = [
    {
      header: 'Asset (Symbol)',
      flex: 2,
      render: (row) => <Text variant="primary" tabular>{row.symbol}</Text>
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