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

  // Kaupankäynti-Modaalin tilat
  const [tradeTarget, setTradeTarget] = useState<PortfolioTicker | null>(null);
  const [tradeAmount, setTradeAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Ladataan kaikki data (Salkku, Lompakko, Asetukset)
  const loadData = async () => {
    if (!userProfile?.id) return;
    setIsLoading(true);
    
    const [portfolio, ledger, settings] = await Promise.all([
      fetchActivePortfolio(userProfile.id),
      fetchWalletLedger(userProfile.id),
      fetchUserSettings(userProfile.id)
    ]);

    setData(portfolio);
    
    // Lasketaan lompakon saldo euroina
    const balanceEur = ledger.reduce((sum, t) => sum + t.amount_snt, 0) / 100;
    setWalletBalance(balanceEur);
    
    setIsStrict(settings.strict_wallet_mode);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [userProfile?.id]);

  // --- KAUPANKÄYNTILOGIIKKA ---
  
  // Koska Python-botti ei vielä päivitä reaaliaikaisia hintoja kantaan, 
  // simuloidaan markkinahinta tässä kokeilua varten (esim. 25.50€)
  const currentMarketPrice = 25.50; 
  
  const numericAmount = parseFloat(tradeAmount) || 0;
  const estimatedShares = numericAmount > 0 ? numericAmount / currentMarketPrice : 0;
  
  // Voiko kaupan tehdä? (Jos strict mode päällä, saldo ei saa mennä pakkaselle)
  const canAfford = !isStrict || walletBalance >= numericAmount;
  const isTradeValid = numericAmount > 0 && canAfford;

  const handleExecuteTrade = async () => {
    if (!userProfile?.id || !tradeTarget || !isTradeValid) return;
    setIsProcessing(true);

    const { error } = await executeTrade(
      userProfile.id,
      tradeTarget.id,
      tradeTarget.symbol,
      numericAmount,
      estimatedShares,
      Number(tradeTarget.shares) || 0,
      Number(tradeTarget.average_buy_price) || 0
    );

    if (error) {
      showToast('ERROR', 'Trade execution failed.', 'error');
    } else {
      showToast('ORDER FILLED', `${estimatedShares.toFixed(3)} shares of ${tradeTarget.symbol} acquired.`, 'success');
      setTradeTarget(null);
      setTradeAmount('');
      await loadData(); // Päivitetään ruudun luvut heti!
    }
    setIsProcessing(false);
  };

  // --- TAULUKON SARAKKEET ---
  const columns: ColumnDef<PortfolioTicker>[] = [
    {
      header: 'Asset (Symbol)',
      flex: 2,
      render: (row) => <Text variant="primary" tabular>{row.symbol}</Text>
    },
    {
      header: 'Shares',
      flex: 1,
      render: (row) => <Text tabular>{Number(row.shares).toFixed(3)}</Text>
    },
    {
      header: 'Avg Buy Price',
      flex: 1,
      render: (row) => <Text tabular>€{Number(row.average_buy_price).toFixed(2)}</Text>
    },
    {
      header: '',
      flex: 1,
      align: 'right',
      render: (row) => (
        <Button variant="secondary" size="sm" onClick={() => setTradeTarget(row)}>
          Trade
        </Button>
      )
    }
  ];

  return (
    <div style={{ padding: '0 1.5rem', maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      <section style={{ marginBottom: '3.5rem', paddingTop: '2rem' }}>
        <Heading level={2} spacing="sm">Active Portfolio</Heading>
        <Prose rule>
          <Text as="p" variant="muted" weight="light">
            Assets promoted from the staging buffer. These instruments are currently active and awaiting capital allocation.
          </Text>
        </Prose>
      </section>

      {isLoading ? <Loader /> : data.length > 0 ? (
        <FlexTable data={data} columns={columns} keyExtractor={(item) => item.id} />
      ) : (
        <Text as="p" variant="muted" weight="light">No active assets in the portfolio yet.</Text>
      )}

      {/* --- KAUPANKÄYNTI-MODAALI --- */}
      <Modal 
        isOpen={!!tradeTarget} 
        title={`Execute Trade: ${tradeTarget?.symbol}`} 
        onClose={() => { setTradeTarget(null); setTradeAmount(''); }}
      >
        {tradeTarget && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Lompakon tila & Asetukset */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-sharp)' }}>
              <div>
                <Text variant="muted" size="sm" style={{ textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Available Liquidity</Text>
                <Text tabular size="lg" variant={isStrict && walletBalance < numericAmount ? 'accent' : 'primary'}>
                  €{walletBalance.toFixed(2)}
                </Text>
              </div>
              <Tag label={isStrict ? 'Strict Mode' : 'Simulator Mode'} variant={isStrict ? 'default' : 'copper'} />
            </div>

            {/* Jättimäinen syöttökenttä (Big Number Input) */}
            <div>
              <Text variant="muted" size="sm" style={{ textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>
                Investment Amount (EUR)
              </Text>
              <input 
                type="number" 
                placeholder="0.00"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(e.target.value)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '2px solid var(--c-copper)',
                  color: 'var(--c-text)',
                  fontSize: '3rem',
                  fontFamily: 'var(--font-body)',
                  fontVariantNumeric: 'tabular-nums',
                  outline: 'none',
                  padding: '0.5rem 0'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <Text variant="muted" size="sm">Market Price: €{currentMarketPrice.toFixed(2)}</Text>
                <Text variant="green" size="sm" tabular>≈ {estimatedShares.toFixed(3)} Shares</Text>
              </div>
            </div>

            {/* Virheilmoitus jos Strict Mode estää */}
            {!canAfford && (
              <Text variant="accent" size="sm" style={{ textAlign: 'center' }}>
                Insufficient funds. Please inject capital into your ledger.
              </Text>
            )}

            {/* Napit */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <Button variant="ghost" onClick={() => { setTradeTarget(null); setTradeAmount(''); }}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleExecuteTrade} 
                disabled={!isTradeValid || isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Confirm Execution'}
              </Button>
            </div>

          </div>
        )}
      </Modal>

    </div>
  );
};