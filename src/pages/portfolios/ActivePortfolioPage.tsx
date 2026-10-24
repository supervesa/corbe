// src/pages/portfolios/ActivePortfolioPage.tsx
import React, { useEffect, useState } from 'react';
import { Bot } from 'lucide-react';
import { fetchActivePortfolio, type PortfolioTicker } from '../../db/queries/portfolios';
import { fetchWalletLedger } from '../../db/queries/wallet';
import { fetchUserSettings } from '../../db/queries/trading';
import { useSentinel } from '../../contexts/SentinelContext';
import { Loader } from '../../ui/Loader';
import { Heading, Text, Prose, Tag } from '../../ui/Typography';
import { FlexTable, type ColumnDef } from '../../ui/FlexTable';
import { Button } from '../../ui/Button';
import { AssetTerminalModal } from '../../widgets/AssetTerminalModal';

export const ActivePortfolioPage = () => {
  const { userProfile } = useSentinel();
  
  const [data, setData] = useState<PortfolioTicker[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isStrict, setIsStrict] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Modaalin kohde
  const [tradeTarget, setTradeTarget] = useState<PortfolioTicker | null>(null);

  const loadData = async () => {
    if (!userProfile?.id) return;
    setIsLoading(true);
    
    const [portfolio, ledger, settings] = await Promise.all([
      fetchActivePortfolio(userProfile.id),
      fetchWalletLedger(userProfile.id),
      fetchUserSettings(userProfile.id)
    ]);
    
    setData(portfolio);
    setWalletBalance(ledger.reduce((sum: number, t: any) => sum + t.amount_snt, 0) / 100);
    setIsStrict(settings.strict_wallet_mode);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [userProfile?.id]);

  // --- TAULUKON SARAKKEET ---
  const columns: ColumnDef<PortfolioTicker>[] = [
    { 
      header: 'Asset', 
      flex: 1.5, 
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
          {row.acquired_by === 'harry_the_broker' && (
            <div title="Acquired by Quantitative Engine" style={{ display: 'flex', alignItems: 'center' }}>
              <Bot size={16} color="var(--c-text-muted)" />
            </div>
          )}
        </div>
      ) 
    },
    { 
      header: 'Shares', 
      flex: 1, 
      render: (row) => <Text tabular>{Number(row.shares).toFixed(3)}</Text> 
    },
    { 
      header: 'Avg Price', 
      flex: 1, 
      render: (row) => <Text variant="muted" tabular>€{Number(row.average_buy_price).toFixed(2)}</Text> 
    },
    { 
      header: 'Live Price', 
      flex: 1, 
      render: (row) => <Text tabular>€{Number(row.current_price).toFixed(2)}</Text> 
    },
    { 
      header: 'Unrealized P&L', 
      flex: 1.5, 
      render: (row) => {
        const curPrice = Number(row.current_price);
        const buyPrice = Number(row.average_buy_price);
        const pnlEur = (curPrice - buyPrice) * Number(row.shares);
        const pnlPct = buyPrice > 0 ? ((curPrice - buyPrice) / buyPrice) * 100 : 0;
        
        if (Number(row.shares) === 0) return <Text variant="muted">—</Text>;

        const isPos = pnlEur >= 0;
        return (
          <Text variant={isPos ? 'green' : 'accent'} tabular>
            {isPos ? '+' : ''}€{pnlEur.toFixed(2)} ({isPos ? '+' : ''}{pnlPct.toFixed(2)}%)
          </Text>
        );
      } 
    },
    { 
      header: '', 
      flex: 1, 
      align: 'right', 
      render: (row) => (
        <Button variant="secondary" size="sm" onClick={() => setTradeTarget(row)}>
          Analyze
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
            Real-time market valuation of promoted assets. Select an asset to view quantitative intelligence and execute trades.
          </Text>
        </Prose>
      </section>

      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="ghost" size="sm" onClick={loadData}>
          ↻ Refresh Market Data
        </Button>
      </div>

      {isLoading ? (
        <Loader />
      ) : data.length > 0 ? (
        <FlexTable data={data} columns={columns} keyExtractor={(item) => item.id} />
      ) : (
        <Text as="p" variant="muted" weight="light">
          No active assets in the portfolio yet.
        </Text>
      )}

      {/* --- ASSET TERMINAL -MODAALI --- */}
      {tradeTarget && userProfile?.id && (
        <AssetTerminalModal
          isOpen={!!tradeTarget}
          onClose={() => setTradeTarget(null)}
          userId={userProfile.id}
          tickerId={tradeTarget.id}
          symbol={tradeTarget.symbol}
          currentMarketPrice={Number(tradeTarget.current_price) || 0}
          currentShares={Number(tradeTarget.shares) || 0}
          currentAvgPrice={Number(tradeTarget.average_buy_price) || 0}
          walletBalance={walletBalance}
          isStrict={isStrict}
          onTradeSuccess={() => loadData()} // Päivittää salkun kun kauppa onnistuu
        />
      )}
    </div>
  );
};