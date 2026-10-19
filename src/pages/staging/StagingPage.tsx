// src/pages/staging/StagingPage.tsx
import React, { useEffect, useState } from 'react';
import { useSentinel } from '../../contexts/SentinelContext';
import { useToast } from '../../contexts/ToastContext';
import { fetchPendingTickers, approveTicker, rejectTicker } from '../../db/queries/staging';
import { fetchUserSettings } from '../../db/queries/trading';
import { fetchWalletLedger } from '../../db/queries/wallet';
import { StagingDataTable, type FlatTickerData } from '../../widgets/StagingDataTable';
import { StagingCardList } from '../../widgets/StagingCardList';
import { AssetTerminalModal } from '../../widgets/AssetTerminalModal';
import { Loader } from '../../ui/Loader';
import { Heading, Text, Prose } from '../../ui/Typography';

export const StagingPage = () => {
  const { userProfile } = useSentinel();
  const { showToast } = useToast();
  
  const [data, setData] = useState<FlatTickerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modaalin ja Lompakon tilat
  const [analyzeTarget, setAnalyzeTarget] = useState<FlatTickerData | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isStrict, setIsStrict] = useState(false);

  // 1. Datan lataus (Hakee Eteisen, Lompakon saldon ja Asetukset rinnakkain)
  const loadData = async () => {
    if (!userProfile?.id) return;
    setIsLoading(true);
    
    const [tickers, ledger, settings] = await Promise.all([
      fetchPendingTickers(userProfile.id),
      fetchWalletLedger(userProfile.id),
      fetchUserSettings(userProfile.id)
    ]);
    
    setData(tickers);
    setWalletBalance(ledger.reduce((sum, t) => sum + t.amount_snt, 0) / 100);
    setIsStrict(settings.strict_wallet_mode);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [userProfile?.id]);

  // 2. Yleinen käsittelijä Approve/Reject -toiminnoille (Optimistic UI)
  const handleAction = async (symbol: string, name: string, action: 'approve' | 'reject') => {
    if (!userProfile?.id) return;

    // Poistetaan osake valittomasti ruudulta (Optimistic Update)
    setData((prevData) => prevData.filter((item) => item.symbol !== symbol));
    
    // Sulje modaali, jos se oli auki talle osakkeelle
    if (analyzeTarget?.symbol === symbol) setAnalyzeTarget(null);

    let error = null;

    if (action === 'approve') {
      const res = await approveTicker(userProfile.id, symbol);
      error = res.error;
      if (!error) showToast('PROMOTED', `${name} added to active portfolio.`, 'success');
    } else {
      const res = await rejectTicker(userProfile.id, symbol);
      error = res.error;
      if (!error) showToast('ARCHIVED', `${name} excluded from future screens.`, 'error');
    }

    // Jos kanta kaatuu (esim. verkkovirhe), tuodaan osake natisti takaisin ja naytetaan virhe
    if (error) {
      console.error('Action failed:', error);
      showToast('SYSTEM ERROR', `Failed to process ${symbol}. Please try again.`, 'error');
      // Ladataan data kokonaan uusiksi, jotta UI on synkassa kannan kanssa
      const refreshed = await fetchPendingTickers(userProfile.id);
      setData(refreshed);
    }
  };

  return (
    <div style={{ padding: '0 1.5rem', maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      
      {/* Otsikko ja lehtimainen 2-palstainen johdantoteksti */}
      <section style={{ marginBottom: '3.5rem', paddingTop: '2rem' }}>
        <Heading level={2} spacing="sm">
          Pending Discoveries
        </Heading>

        <Prose rule>
          <Text as="p" variant="muted" weight="light">
            Automated quantitative screening results awaiting executive approval. 
            Each candidate below has crossed the multi-horizon momentum threshold 
            during the latest market close cycle and is currently held in the 
            staging buffer prior to portfolio allocation.
          </Text>
          <Text as="p" variant="muted" weight="light">
            Review short-term divergence (1W / 1M) against structural trend baskets 
            (6M / 2Y) before promoting instruments to active tracking. Rejected 
            symbols are archived in the historical log and excluded from the next 
            screening pass.
          </Text>
        </Prose>
      </section>

      {isLoading ? (
        <Loader />
      ) : data.length > 0 ? (
        <>
          {/* Ylaosan nostot (Kortit) */}
          <section style={{ marginBottom: '4rem' }}>
            <Heading level={3} variant="muted" spacing="md">
              Highlighted Trends
            </Heading>
            <StagingCardList data={data} onAction={handleAction} />
          </section>

          {/* Valianalyysi / leipateksti ennen taulukkoa */}
          <section style={{ marginBottom: '3rem' }}>
            <Heading level={3} variant="muted" spacing="sm">
              Screening Commentary
            </Heading>
            <Prose>
              <Text as="p" variant="muted" weight="light" size="sm">
                Industrial and technology constituents continue to demonstrate 
                relative resilience across the 6-month and 2-year observation windows, 
                compensating for near-term volatility in the weekly basket.
              </Text>
              <Text as="p" variant="muted" weight="light" size="sm">
                Energy sector candidates remain under mean-reversion watch following 
                sustained drawdowns. Verify liquidity and spread metrics in the 
                detailed breakdown below prior to execution.
              </Text>
            </Prose>
          </section>

          {/* Ala-osan analyysi (Taulukko) */}
          <section>
            <Heading level={3} variant="muted" spacing="md">
              Detailed Analysis (All Discoveries)
            </Heading>
            <StagingDataTable 
              data={data} 
              onAction={handleAction} 
              onAnalyze={(row) => setAnalyzeTarget(row)} 
            />
          </section>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <Text as="p" variant="muted" weight="light">
            No pending discoveries at the moment. The quantitative engine is monitoring for new anomalies.
          </Text>
        </div>
      )}

      {/* --- ASSET TERMINAL -MODAALI --- */}
      {analyzeTarget && userProfile?.id && (
        <AssetTerminalModal
          isOpen={!!analyzeTarget}
          onClose={() => setAnalyzeTarget(null)}
          userId={userProfile.id}
          tickerId={analyzeTarget.id}
          symbol={analyzeTarget.symbol}
          currentMarketPrice={Number(analyzeTarget.price) || 0}
          currentShares={0} // Eteisessa omistus on aina 0
          currentAvgPrice={0}
          walletBalance={walletBalance}
          isStrict={isStrict}
          onTradeSuccess={() => handleAction(analyzeTarget.symbol, analyzeTarget.name, 'approve')}
          companySummary={analyzeTarget.meta?.ai_company_summary}
          themeMatch={analyzeTarget.meta?.ai_theme_match}
        />
      )}

    </div>
  );
};