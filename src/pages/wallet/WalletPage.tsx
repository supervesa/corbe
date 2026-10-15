// src/pages/wallet/WalletPage.tsx
import React, { useEffect, useState } from 'react';
import { fetchWalletLedger, addFunds, type WalletTransaction } from '../../db/queries/wallet';
import { useSentinel } from '../../contexts/SentinelContext';
import { useToast } from '../../contexts/ToastContext';
import { Loader } from '../../ui/Loader';
import { Heading, Text, Prose, Tag } from '../../ui/Typography';
import { FlexTable, type ColumnDef } from '../../ui/FlexTable';
import { Button } from '../../ui/Button';

export const WalletPage = () => {
  const { userProfile } = useSentinel();
  const { showToast } = useToast();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDepositing, setIsDepositing] = useState(false);

  const loadData = async () => {
    if (!userProfile?.id) return;
    setIsLoading(true);
    const data = await fetchWalletLedger(userProfile.id);
    setTransactions(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [userProfile?.id]);

  // Lasketaan kokonaissaldo senteistä euroiksi
  const balanceEur = transactions.reduce((sum, t) => sum + t.amount_snt, 0) / 100;

  // Manuaalinen 10€ testi-talletus
  const handleManualDeposit = async () => {
    if (!userProfile?.id) return;
    setIsDepositing(true);
    
    const { error } = await addFunds(userProfile.id, 10.00, 'manual_deposit', 'Manual capital injection');
    
    if (error) {
      showToast('ERROR', 'Transaction failed.', 'error');
    } else {
      showToast('FUNDS CLEARED', '€10.00 added to available capital.', 'success');
      await loadData(); // Ladataan tiliote heti uudestaan, jotta saldo päivittyy!
    }
    setIsDepositing(false);
  };

  // Taulukon sarakkeet
  const columns: ColumnDef<WalletTransaction>[] = [
    {
      header: 'Date',
      flex: 1,
      render: (row) => <Text variant="muted" size="sm" tabular>{new Date(row.created_at).toLocaleString('fi-FI')}</Text>
    },
    {
      header: 'Type',
      flex: 1,
      render: (row) => {
        // Värjätään tagi tyypin mukaan
        let variant: 'default' | 'copper' | 'green' | 'danger' = 'default';
        if (row.transaction_type.includes('solar')) variant = 'green';
        if (row.transaction_type.includes('deposit')) variant = 'copper';
        if (row.transaction_type.includes('trade')) variant = 'danger';
        return <Tag label={row.transaction_type.replace('_', ' ')} variant={variant} />;
      }
    },
    {
      header: 'Description',
      flex: 2,
      render: (row) => <Text variant="primary">{row.description}</Text>
    },
    {
      header: 'Amount',
      flex: 1,
      align: 'right',
      render: (row) => {
        const eur = row.amount_snt / 100;
        const isPos = eur > 0;
        return (
          <Text variant={isPos ? 'green' : 'accent'} tabular>
            {isPos ? '+' : ''}€{eur.toFixed(2)}
          </Text>
        );
      }
    }
  ];

  return (
    <div style={{ padding: '0 1.5rem', maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      
      {/* HEADER & SALDO */}
      <section style={{ marginBottom: '4rem', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
        <div>
          <Heading level={2} spacing="sm">Capital Ledger</Heading>
          <Prose rule>
            <Text as="p" variant="muted" weight="light">
              Unified treasury management. Displays available liquidity bridging ecosystem savings (solar, HVAC) and manual capital injections.
            </Text>
          </Prose>
        </div>

        {/* Massiivinen saldo-laatikko */}
        <div style={{ 
          background: 'var(--c-card)', padding: '2rem 3rem', borderRadius: 'var(--radius-sharp)', 
          border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' 
        }}>
          <Text variant="muted" size="sm" style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>Available Liquidity</Text>
          <div className="font-display font-numbers" style={{ fontSize: '3rem', color: 'var(--c-text)', marginTop: '0.5rem' }}>
            €{balanceEur.toFixed(2)}
          </div>
          <Button 
            variant="primary" 
            size="sm" 
            style={{ marginTop: '1.5rem' }} 
            onClick={handleManualDeposit}
            disabled={isDepositing}
          >
            {isDepositing ? 'Processing...' : 'Inject €10.00'}
          </Button>
        </div>
      </section>

      {/* TILIOTE */}
      <section>
        <Heading level={3} variant="muted" spacing="md">Transaction History</Heading>
        {isLoading ? (
          <Loader />
        ) : transactions.length > 0 ? (
          <FlexTable data={transactions} columns={columns} keyExtractor={(item) => item.id} />
        ) : (
          <Text as="p" variant="muted" weight="light">No capital transactions recorded yet.</Text>
        )}
      </section>

    </div>
  );
};