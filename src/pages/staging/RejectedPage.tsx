import React, { useEffect, useState } from 'react';
import { fetchRejectedTickers, type RejectedTicker } from '../../db/queries/staging';
import { useSentinel } from '../../contexts/SentinelContext';
import { Loader } from '../../ui/Loader';
import { Heading, Text, Prose } from '../../ui/Typography';
import { FlexTable, type ColumnDef } from '../../ui/FlexTable';

export const RejectedPage = () => {
  const { userProfile } = useSentinel();
  const [data, setData] = useState<RejectedTicker[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!userProfile?.id) return;
      setIsLoading(true);
      const rejected = await fetchRejectedTickers(userProfile.id);
      setData(rejected);
      setIsLoading(false);
    };
    loadData();
  }, [userProfile?.id]);

  const columns: ColumnDef<RejectedTicker>[] = [
    {
      header: 'Asset (Symbol)',
      flex: 2,
      render: (row) => <Text variant="accent" tabular>{row.symbol}</Text> /* Korostetaan Oxblood-värillä */
    },
    {
      header: 'Reason',
      flex: 2,
      render: (row) => <Text variant="muted">{row.reject_reason || 'Manual Executive Rejection'}</Text>
    },
    {
      header: 'Archived At',
      flex: 1.5,
      render: (row) => <Text variant="muted" size="sm">{new Date(row.rejected_at).toLocaleDateString('fi-FI')}</Text>
    }
  ];

  return (
    <div style={{ padding: '0 1.5rem', maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      <section style={{ marginBottom: '3.5rem', paddingTop: '2rem' }}>
        <Heading level={2} spacing="sm">Archived Discoveries</Heading>
        <Prose rule>
          <Text as="p" variant="muted" weight="light">
            Historical record of rejected staging candidates. The quantitative engine uses this data as negative reinforcement to optimize future screening passes.
          </Text>
        </Prose>
      </section>

      {isLoading ? <Loader /> : data.length > 0 ? (
        <FlexTable data={data} columns={columns} keyExtractor={(item) => item.id} />
      ) : (
        <Text as="p" variant="muted" weight="light">No archived discoveries found.</Text>
      )}
    </div>
  );
};