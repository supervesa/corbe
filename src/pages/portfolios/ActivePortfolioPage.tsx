import React, { useEffect, useState } from 'react';
import { fetchActivePortfolio, type PortfolioTicker } from '../../db/queries/portfolios';
import { useSentinel } from '../../contexts/SentinelContext';
import { Loader } from '../../ui/Loader';
import { Heading, Text, Prose } from '../../ui/Typography';
import { FlexTable, type ColumnDef } from '../../ui/FlexTable';

export const ActivePortfolioPage = () => {
  const { userProfile } = useSentinel();
  const [data, setData] = useState<PortfolioTicker[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!userProfile?.id) return;
      setIsLoading(true);
      const portfolio = await fetchActivePortfolio(userProfile.id);
      setData(portfolio);
      setIsLoading(false);
    };
    loadData();
  }, [userProfile?.id]);

  const columns: ColumnDef<PortfolioTicker>[] = [
    {
      header: 'Asset (Symbol)',
      flex: 2,
      render: (row) => <Text variant="primary" tabular>{row.symbol}</Text>
    },
    {
      header: 'Shares',
      flex: 1,
      render: (row) => <Text tabular>{row.shares}</Text>
    },
    {
      header: 'Avg Buy Price',
      flex: 1,
      render: (row) => <Text tabular>€{Number(row.average_buy_price).toFixed(2)}</Text>
    },
    {
      header: 'Promoted At',
      flex: 1.5,
      render: (row) => <Text variant="muted" size="sm">{new Date(row.added_at).toLocaleDateString('fi-FI')}</Text>
    }
  ];

  return (
    <div style={{ padding: '0 1.5rem', maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      <section style={{ marginBottom: '3.5rem', paddingTop: '2rem' }}>
        <Heading level={2} spacing="sm">Active Portfolio</Heading>
        <Prose rule>
          <Text as="p" variant="muted" weight="light">
            Assets promoted from the staging buffer. These instruments are currently active and awaiting capital allocation or hold status tracking.
          </Text>
        </Prose>
      </section>

      {isLoading ? <Loader /> : data.length > 0 ? (
        <FlexTable data={data} columns={columns} keyExtractor={(item) => item.id} />
      ) : (
        <Text as="p" variant="muted" weight="light">No active assets in the portfolio yet.</Text>
      )}
    </div>
  );
};