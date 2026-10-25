// src/pages/wallet/WalletPage.tsx
import React, { useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Shield, Zap } from 'lucide-react';
import { fetchWalletLedger, addFunds, type WalletTransaction } from '../../db/queries/wallet';
import { fetchUserSettings } from '../../db/queries/trading';
import { useSentinel } from '../../contexts/SentinelContext';
import { useToast } from '../../contexts/ToastContext';
import { Loader } from '../../ui/Loader';
import { Heading, Text, Prose, Tag } from '../../ui/Typography';
import { FlexTable, type ColumnDef } from '../../ui/FlexTable';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';
import { Chip } from '../../ui/Chip';

export const WalletPage = () => {
  const { userProfile } = useSentinel();
  const { showToast } = useToast();
  
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [blitzPct, setBlitzPct] = useState(40);
  const [isLoading, setIsLoading] = useState(true);

  // Modaalin tilat
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [manageMode, setManageMode] = useState<'deposit' | 'extract'>('deposit');
  const [manageAmount, setManageAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const loadData = async () => {
    if (!userProfile?.id) return;
    setIsLoading(true);
    const [ledger, settings] = await Promise.all([
      fetchWalletLedger(userProfile.id),
      fetchUserSettings(userProfile.id)
    ]);
    setTransactions(ledger);
    setBlitzPct(settings.blitz_allocation_pct ?? 40);
    setIsLoading(false);
  };

  useEffect(() => { loadData(); }, [userProfile?.id]);

  const balanceEur = transactions.reduce((sum: number, t: any) => sum + t.amount_snt, 0) / 100;
  
  // Allokaation matematiikka
  const blitzLiquidity = balanceEur * (blitzPct / 100);
  const coreLiquidity = balanceEur - blitzLiquidity;

  // --- KAUPANKÄYNTI / HALLINTA ---
  const numericAmount = parseFloat(manageAmount) || 0; 
  const isExtract = manageMode === 'extract';
  const isValid = numericAmount > 0 && (!isExtract || numericAmount <= balanceEur);

  const handleTransaction = async () => {
    if (!userProfile?.id || !isValid) return;
    setIsProcessing(true);
    
    const finalAmount = isExtract ? -numericAmount : numericAmount;
    const actionType = isExtract ? 'manual_extraction' : 'manual_deposit';
    const desc = isExtract ? 'Manual capital extraction' : 'Manual capital injection';

    const { error } = await addFunds(userProfile.id, finalAmount, actionType, desc);
    
    if (error) {
      showToast('ERROR', 'Transaction failed.', 'error');
    } else {
      showToast(
        isExtract ? 'FUNDS EXTRACTED' : 'FUNDS CLEARED', 
        `€${numericAmount.toFixed(2)} ${isExtract ? 'removed from' : 'added to'} available capital.`, 
        isExtract ? 'info' : 'success'
      );
      setIsManageOpen(false);
      setManageAmount('');
      await loadData();
    }
    setIsProcessing(false);
  };

  // --- TAULUKON SARAKKEET ---
  const columns: ColumnDef<WalletTransaction>[] = [
    {
      header: 'Date', flex: 1,
      render: (row) => <Text variant="muted" size="sm" tabular>{new Date(row.created_at).toLocaleString('fi-FI')}</Text>
    },
    {
      header: 'Type', flex: 1.2,
      render: (row) => {
        let variant: 'default' | 'copper' | 'green' | 'danger' = 'default';
        if (row.transaction_type.includes('solar')) variant = 'green';
        if (row.transaction_type.includes('deposit')) variant = 'copper';
        if (row.transaction_type.includes('extract')) variant = 'default';
        if (row.transaction_type.includes('trade_buy')) variant = 'danger';
        if (row.transaction_type.includes('trade_sell')) variant = 'green';
        return <Tag label={row.transaction_type.replace(/_/g, ' ').toUpperCase()} variant={variant} />;
      }
    },
    { header: 'Description', flex: 2, render: (row) => <Text variant="primary">{row.description}</Text> },
    {
      header: 'Amount', flex: 1, align: 'right',
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
        <div style={{ flex: '1 1 400px' }}>
          <Heading level={2} spacing="sm">Capital Ledger</Heading>
          <Prose rule>
            <Text as="p" variant="muted" weight="light">
              Unified treasury management. Displays available liquidity bridging ecosystem savings (solar, HVAC) and manual capital injections.
            </Text>
          </Prose>
        </div>

        {/* SALDOLAATIKKO & ALLOKAATIOPALKKI */}
        <div style={{ 
          flex: '1 1 400px', background: 'var(--c-card)', padding: '2rem 2.5rem', borderRadius: 'var(--radius-sharp)', 
          border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
            <div>
              <Text variant="muted" size="sm" style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>Available Liquidity</Text>
              <div className="font-display font-numbers" style={{ fontSize: '3rem', color: 'var(--c-text)', marginTop: '0.2rem' }}>
                €{balanceEur.toFixed(2)}
              </div>
            </div>
            <Button variant="primary" size="sm" onClick={() => { setManageMode('deposit'); setManageAmount(''); setIsManageOpen(true); }}>
              Manage Capital
            </Button>
          </div>

          {/* PROGRESS BAR (Core vs Blitz) */}
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', display: 'flex', overflow: 'hidden', marginBottom: '0.8rem' }}>
            <div style={{ width: `${100 - blitzPct}%`, background: 'var(--c-text-muted)', height: '100%' }} title="Core Allocation" />
            <div style={{ width: `${blitzPct}%`, background: 'var(--c-copper)', height: '100%' }} title="Blitz Allocation" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text variant="muted" size="sm" tabular style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Shield size={14} /> Core: €{coreLiquidity.toFixed(2)}
            </Text>
            <Text variant="muted" size="sm" tabular style={{ color: 'var(--c-copper)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Zap size={14} /> Blitz: €{blitzLiquidity.toFixed(2)}
            </Text>
          </div>
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

      {/* --- MANAGE CAPITAL -MODAALI --- */}
      <Modal isOpen={isManageOpen} title="Capital Management" onClose={() => setIsManageOpen(false)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* DEPOSIT / EXTRACT - KYTKIN */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '0.3rem', borderRadius: 'var(--radius-sharp)' }}>
            <button 
              style={{ flex: 1, padding: '0.6rem', border: 'none', borderRadius: '2px', cursor: 'pointer', fontFamily: 'var(--font-heading)', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                background: !isExtract ? 'var(--c-green)' : 'transparent', color: !isExtract ? '#fff' : 'var(--c-text-muted)' }}
              onClick={() => { setManageMode('deposit'); setManageAmount(''); }}
            >
              <ArrowDownLeft size={16} /> DEPOSIT
            </button>
            <button 
              style={{ flex: 1, padding: '0.6rem', border: 'none', borderRadius: '2px', fontFamily: 'var(--font-heading)', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                background: isExtract ? 'var(--c-accent)' : 'transparent', color: isExtract ? '#fff' : 'var(--c-text-muted)',
                cursor: balanceEur > 0 ? 'pointer' : 'not-allowed', opacity: balanceEur > 0 ? 1 : 0.4 }}
              onClick={() => { if(balanceEur > 0) { setManageMode('extract'); setManageAmount(''); } }}
              disabled={balanceEur <= 0}
            >
              <ArrowUpRight size={16} /> EXTRACT
            </button>
          </div>

          {/* SYÖTTÖKENTTÄ & PIKAVALINNAT (CHIPS) */}
          <div>
            <Text variant="muted" size="sm" style={{ textTransform: 'uppercase' }}>Amount (EUR)</Text>
            
            <input 
              type="number" 
              placeholder="0.00" 
              value={manageAmount} 
              onChange={(e) => setManageAmount(e.target.value)}
              style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: `2px solid ${isExtract ? 'var(--c-accent)' : 'var(--c-green)'}`, color: 'var(--c-text)', fontSize: '3rem', fontFamily: 'var(--font-body)', fontVariantNumeric: 'tabular-nums', outline: 'none', padding: '0.5rem 0' }}
            />
            
            <div className="corbe-chip-container">
              {!isExtract ? (
                <>
                  <Chip label="+ 50" onClick={() => setManageAmount((numericAmount + 50).toString())} />
                  <Chip label="+ 100" onClick={() => setManageAmount((numericAmount + 100).toString())} />
                  <Chip label="+ 500" onClick={() => setManageAmount((numericAmount + 500).toString())} />
                </>
              ) : (
                <>
                  <Chip label="25%" onClick={() => setManageAmount((balanceEur * 0.25).toFixed(2))} />
                  <Chip label="50%" onClick={() => setManageAmount((balanceEur * 0.50).toFixed(2))} />
                  <Chip label="MAX" onClick={() => setManageAmount(balanceEur.toFixed(2))} />
                </>
              )}
              <Chip label="CLEAR" onClick={() => setManageAmount('')} />
            </div>

          </div>

          {!isValid && numericAmount > 0 && (
            <Text variant="accent" size="sm" style={{ textAlign: 'center' }}>
              {isExtract ? 'Insufficient funds for extraction.' : 'Invalid amount.'}
            </Text>
          )}

          <Button variant="primary" fullWidth onClick={handleTransaction} disabled={!isValid || isProcessing} style={{ marginTop: '1rem' }}>
            {isProcessing ? 'Processing...' : 'Confirm Transaction'}
          </Button>

        </div>
      </Modal>

    </div>
  );
};