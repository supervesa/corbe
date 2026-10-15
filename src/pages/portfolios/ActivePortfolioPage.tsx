// src/pages/portfolios/ActivePortfolioPage.tsx
import React, { useEffect, useState } from 'react';
import { fetchActivePortfolio, type PortfolioTicker } from '../../db/queries/portfolios';
import { fetchWalletLedger } from '../../db/queries/wallet';
import { fetchUserSettings, executeTrade } from '../../db/queries/trading';
import { useSentinel } from '../../contexts/SentinelContext';
import { useToast } from '../../contexts/ToastContext';
import { Loader } from '../../ui/Loader';
import { Heading, Text, Prose, Tag } from '../../ui/Typography';
import { FlexTable, type ColumnDef } from '../../ui/FlexTable';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';

export const ActivePortfolioPage = () => {
  const { userProfile } = useSentinel();
  const { showToast } = useToast();
  
  const [data, setData] = useState<PortfolioTicker[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isStrict, setIsStrict] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Modaalin tilat
  const [tradeTarget, setTradeTarget] = useState<PortfolioTicker | null>(null);
  const [tradeMode, setTradeMode] = useState<'buy' | 'sell'>('buy');
  const [tradeAmount, setTradeAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const loadData = async () => {
    if (!userProfile?.id) return;
    setIsLoading(true);
    const [portfolio, ledger, settings] = await Promise.all([
      fetchActivePortfolio(userProfile.id),
      fetchWalletLedger(userProfile.id),
      fetchUserSettings(userProfile.id)
    ]);
    setData(portfolio);
    setWalletBalance(ledger.reduce((sum, t) => sum + t.amount_snt, 0) / 100);
    setIsStrict(settings.strict_wallet_mode);
    setIsLoading(false);
  };

  useEffect(() => { loadData(); }, [userProfile?.id]);

  // --- KAUPANKÄYNTILOGIIKKA ---
  // Simuloidaan markkinahinta tässä kokeilua varten (Python hoitaa oikeasti myöhemmin)
  const currentMarketPrice = 30.50; 
  
  const currentShares = tradeTarget ? Number(tradeTarget.shares) : 0;
  const avgPrice = tradeTarget ? Number(tradeTarget.average_buy_price) : 0;
  const isSell = tradeMode === 'sell';
  const numericInput = parseFloat(tradeAmount) || 0;

  // LASKENTA (Riippuu ollaanko ostamassa vai myymässä)
  let estimatedShares = 0;
  let estimatedEur = 0;
  let profitLoss = 0;
  let profitLossPercent = 0;

  if (isSell) {
    // Myydessä input on KAPPALEMÄÄRÄ
    estimatedShares = numericInput;
    estimatedEur = estimatedShares * currentMarketPrice;
    profitLoss = (currentMarketPrice - avgPrice) * estimatedShares;
    profitLossPercent = avgPrice > 0 ? ((currentMarketPrice - avgPrice) / avgPrice) * 100 : 0;
  } else {
    // Ostaessa input on EUROT
    estimatedEur = numericInput;
    estimatedShares = currentMarketPrice > 0 ? numericInput / currentMarketPrice : 0;
  }

  // TARKISTUKSET
  const canAfford = !isStrict || walletBalance >= estimatedEur;
  let isTradeValid = false;
  if (isSell) {
    isTradeValid = numericInput > 0 && numericInput <= currentShares;
  } else {
    isTradeValid = numericInput > 0 && canAfford;
  }

  const handleExecuteTrade = async () => {
    if (!userProfile?.id || !tradeTarget || !isTradeValid) return;
    setIsProcessing(true);

    const { error } = await executeTrade(
      userProfile.id, tradeTarget.id, tradeTarget.symbol,
      tradeMode, estimatedEur, estimatedShares,
      currentShares, avgPrice
    );

    if (error) {
      showToast('ERROR', 'Trade execution failed.', 'error');
    } else {
      showToast('ORDER FILLED', `${tradeMode.toUpperCase()} executed for ${tradeTarget.symbol}.`, 'success');
      setTradeTarget(null);
      setTradeAmount('');
      await loadData();
    }
    setIsProcessing(false);
  };

  const columns: ColumnDef<PortfolioTicker>[] = [
    { header: 'Asset', flex: 2, render: (row) => <Text variant="primary" tabular>{row.symbol}</Text> },
    { header: 'Shares', flex: 1, render: (row) => <Text tabular>{Number(row.shares).toFixed(3)}</Text> },
    { header: 'Avg Price', flex: 1, render: (row) => <Text tabular>€{Number(row.average_buy_price).toFixed(2)}</Text> },
    { header: '', flex: 1, align: 'right', render: (row) => (
        <Button variant="secondary" size="sm" onClick={() => { 
          setTradeTarget(row); 
          setTradeAmount(''); 
          setTradeMode('buy'); // Oletuksena aina osto
        }}>Trade</Button>
      )
    }
  ];

  return (
    <div style={{ padding: '0 1.5rem', maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      <section style={{ marginBottom: '3.5rem', paddingTop: '2rem' }}>
        <Heading level={2} spacing="sm">Active Portfolio</Heading>
        <Prose rule><Text as="p" variant="muted" weight="light">Assets promoted from the staging buffer.</Text></Prose>
      </section>

      {isLoading ? <Loader /> : data.length > 0 ? (
        <FlexTable data={data} columns={columns} keyExtractor={(item) => item.id} />
      ) : (
        <Text as="p" variant="muted" weight="light">No active assets in the portfolio yet.</Text>
      )}

      {/* --- KAUPANKÄYNTI-MODAALI --- */}
      <Modal isOpen={!!tradeTarget} title={`${tradeTarget?.symbol}`} onClose={() => { setTradeTarget(null); setTradeAmount(''); }}>
        {tradeTarget && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* BUY / SELL - KYTKIN */}
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '0.3rem', borderRadius: 'var(--radius-sharp)' }}>
              <button 
                style={{ flex: 1, padding: '0.6rem', border: 'none', borderRadius: '2px', cursor: 'pointer', fontFamily: 'var(--font-heading)', letterSpacing: '0.1em',
                  background: !isSell ? 'var(--c-copper)' : 'transparent', color: !isSell ? '#fff' : 'var(--c-text-muted)' }}
                onClick={() => { setTradeMode('buy'); setTradeAmount(''); }}
              >BUY</button>
              <button 
                style={{ flex: 1, padding: '0.6rem', border: 'none', borderRadius: '2px', fontFamily: 'var(--font-heading)', letterSpacing: '0.1em',
                  background: isSell ? 'var(--c-copper)' : 'transparent', color: isSell ? '#fff' : 'var(--c-text-muted)',
                  cursor: currentShares > 0 ? 'pointer' : 'not-allowed', opacity: currentShares > 0 ? 1 : 0.4 }}
                onClick={() => { if(currentShares > 0) { setTradeMode('sell'); setTradeAmount(''); } }}
                disabled={currentShares <= 0}
              >SELL</button>
            </div>

            {/* SYÖTTÖKENTTÄ */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text variant="muted" size="sm" style={{ textTransform: 'uppercase' }}>
                  {isSell ? 'Amount (Shares)' : 'Investment (EUR)'}
                </Text>
                {/* MYY KAIKKI -nappi */}
                {isSell && (
                  <span style={{ color: 'var(--c-copper)', fontSize: '0.8rem', cursor: 'pointer' }} onClick={() => setTradeAmount(currentShares.toString())}>
                    MAX ({currentShares.toFixed(3)})
                  </span>
                )}
              </div>
              
              <input 
                type="number" placeholder="0.00" value={tradeAmount} onChange={(e) => setTradeAmount(e.target.value)}
                style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '2px solid var(--c-copper)', color: 'var(--c-text)', fontSize: '3rem', fontFamily: 'var(--font-body)', fontVariantNumeric: 'tabular-nums', outline: 'none', padding: '0.5rem 0' }}
              />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <Text variant="muted" size="sm">Market: €{currentMarketPrice.toFixed(2)}</Text>
                <Text variant="primary" size="sm" tabular>
                  {isSell ? `Value: €${estimatedEur.toFixed(2)}` : `≈ ${estimatedShares.toFixed(3)} Shares`}
                </Text>
              </div>
            </div>

            {/* P&L LASKURI (Näkyy vain myydessä) */}
            {isSell && numericInput > 0 && (
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-sharp)', borderLeft: `2px solid ${profitLoss >= 0 ? 'var(--c-green)' : 'var(--c-accent)'}` }}>
                <Text variant="muted" size="sm" style={{ display: 'block', marginBottom: '0.2rem' }}>Estimated Return (P&L)</Text>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'baseline' }}>
                  <Text variant={profitLoss >= 0 ? 'green' : 'accent'} size="lg" tabular>
                    {profitLoss >= 0 ? '+' : ''}€{profitLoss.toFixed(2)}
                  </Text>
                  <Text variant={profitLoss >= 0 ? 'green' : 'accent'} size="sm" tabular>
                    ({profitLossPercent >= 0 ? '+' : ''}{profitLossPercent.toFixed(2)}%)
                  </Text>
                </div>
              </div>
            )}

            {/* VIRHEILMOITUKSET */}
            {!isTradeValid && numericInput > 0 && (
              <Text variant="accent" size="sm" style={{ textAlign: 'center' }}>
                {isSell ? 'Cannot sell more shares than owned.' : 'Insufficient funds in ledger.'}
              </Text>
            )}

            {/* NAPIT */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <Button variant="primary" fullWidth onClick={handleExecuteTrade} disabled={!isTradeValid || isProcessing}>
                {isProcessing ? 'Processing...' : 'Confirm Execution'}
              </Button>
            </div>

          </div>
        )}
      </Modal>

    </div>
  );
};