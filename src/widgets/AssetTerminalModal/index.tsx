import React, { useEffect, useState } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Text, Heading, Tag } from '../../ui/Typography';
import { Sparkline } from '../../ui/Sparkline';
import { fetchAssetIntelligence, type AssetIntelligence } from '../../db/queries/intelligence';
import { executeTrade } from '../../db/queries/trading';
import { useToast } from '../../contexts/ToastContext';
import './AssetTerminal.css';

interface AssetTerminalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  tickerId: string;
  symbol: string;
  currentMarketPrice: number;
  currentShares: number;
  currentAvgPrice: number;
  walletBalance: number;
  isStrict: boolean;
  onTradeSuccess: () => void;
  companySummary?: string; // <-- LISÄTTY
  themeMatch?: string;     // <-- LISÄTTY
}

export const AssetTerminalModal = ({
  isOpen, onClose, userId, tickerId, symbol, currentMarketPrice, 
  currentShares, currentAvgPrice, walletBalance, isStrict, onTradeSuccess,
  companySummary, themeMatch
}: AssetTerminalProps) => {

  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'intelligence' | 'trade'>('intelligence');
  
  const [intelligence, setIntelligence] = useState<AssetIntelligence | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [tradeMode, setTradeMode] = useState<'buy' | 'sell'>('buy');
  const [tradeAmount, setTradeAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen && symbol) {
      setIsLoading(true);
      fetchAssetIntelligence(symbol).then(data => {
        setIntelligence(data);
        setIsLoading(false);
      });
      setTradeAmount('');
      setTradeMode(currentShares > 0 ? 'sell' : 'buy');
      setActiveTab('intelligence');
    }
  }, [isOpen, symbol, currentShares]);

  // --- MATEMATIIKKA ---
  const isSell = tradeMode === 'sell';
  const numericInput = parseFloat(tradeAmount) || 0;

  let estimatedShares = 0;
  let estimatedEur = 0;
  let profitLoss = 0;
  let profitLossPercent = 0;

  if (isSell) {
    estimatedShares = numericInput;
    estimatedEur = estimatedShares * currentMarketPrice;
    profitLoss = (currentMarketPrice - currentAvgPrice) * estimatedShares;
    profitLossPercent = currentAvgPrice > 0 ? ((currentMarketPrice - currentAvgPrice) / currentAvgPrice) * 100 : 0;
  } else {
    estimatedEur = numericInput;
    estimatedShares = currentMarketPrice > 0 ? numericInput / currentMarketPrice : 0;
  }

  const canAfford = !isStrict || walletBalance >= estimatedEur;
  const isTradeValid = isSell 
    ? (numericInput > 0 && numericInput <= currentShares)
    : (numericInput > 0 && canAfford);

  // --- KAUPPA ---
  const handleExecuteTrade = async () => {
    if (!isTradeValid) return;
    setIsProcessing(true);

    const { error } = await executeTrade(
      userId, tickerId, symbol, tradeMode, 
      estimatedEur, estimatedShares, currentShares, currentAvgPrice
    );

    if (error) {
      showToast('ERROR', 'Trade execution failed.', 'error');
    } else {
      showToast('ORDER FILLED', `${tradeMode.toUpperCase()} executed for ${symbol}.`, 'success');
      onTradeSuccess();
      onClose();
    }
    setIsProcessing(false);
  };

  if (!isOpen) return null;

  const historyPrices = intelligence?.history.map(h => h.close) || [];
  const trendColor = historyPrices.length > 1 && historyPrices[historyPrices.length - 1] >= historyPrices[0] 
    ? 'var(--c-green)' : 'var(--c-accent)';

  return (
    <Modal isOpen={isOpen} title={symbol} onClose={onClose}>
      <div className="terminal-container">
        
        <div className="terminal-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <Text variant="muted" size="sm" style={{ display: 'block', textTransform: 'uppercase' }}>Live Market</Text>
              <Text tabular size="lg">€{currentMarketPrice.toFixed(2)}</Text>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Text variant="muted" size="sm" style={{ display: 'block', textTransform: 'uppercase' }}>Position</Text>
              <Text tabular>{currentShares > 0 ? `${currentShares.toFixed(3)} shrs` : 'None'}</Text>
            </div>
          </div>
        </div>

        <div className="terminal-tabs">
          <button 
            className={`terminal-tab-btn ${activeTab === 'intelligence' ? 'active' : 'inactive'}`}
            onClick={() => setActiveTab('intelligence')}
          >INTELLIGENCE</button>
          <button 
            className={`terminal-tab-btn ${activeTab === 'trade' ? 'active' : 'inactive'}`}
            onClick={() => setActiveTab('trade')}
          >EXECUTE</button>
        </div>

        <div className="terminal-content-split">
          
          {/* VASEN SARAKE: INTELLIGENCE */}
          <div className={`terminal-col-left terminal-tab-content ${activeTab === 'trade' ? 'hide-on-mobile' : ''}`}>
            
            {/* UUSI: AI Yhtiöprofiili (Näkyy vain jos dataa on, eli Eteisessä) */}
            {(companySummary || themeMatch) && (
              <div className="terminal-panel" style={{ borderLeft: '2px solid var(--c-copper)', marginBottom: '1.5rem' }}>
                <Heading level={4} spacing="sm">AI Company Profiler</Heading>
                {companySummary && (
                  <Text as="p" variant="muted" size="sm" style={{ marginBottom: themeMatch ? '1rem' : '0' }}>
                    {companySummary}
                  </Text>
                )}
                {themeMatch && (
                  <div>
                    <Tag label={`THEME MATCH: ${themeMatch.toUpperCase()}`} variant="copper" />
                  </div>
                )}
              </div>
            )}

            {isLoading ? (
              <Text variant="muted">Loading telemetry...</Text>
            ) : (
              <>
                <div className="terminal-panel">
                  <Heading level={4} spacing="sm">30-Day Trajectory</Heading>
                  {historyPrices.length > 0 ? (
                    <Sparkline data={historyPrices} color={trendColor} strokeWidth={2} />
                  ) : (
                    <Text variant="muted" size="sm">No historical data available.</Text>
                  )}
                </div>

                {intelligence?.prediction && (
                  <div className="terminal-panel">
                    <Heading level={4} spacing="sm">AI Oracle</Heading>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text variant="muted" size="sm">Horizon: {intelligence.prediction.target_horizon}</Text>
                      <Text tabular variant={intelligence.prediction.predicted_trend >= 0 ? 'green' : 'accent'}>
                        Target: {intelligence.prediction.predicted_trend >= 0 ? '+' : ''}{intelligence.prediction.predicted_trend}%
                      </Text>
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <Text variant="muted" size="sm">Confidence: {intelligence.prediction.confidence_score}%</Text>
                    </div>
                  </div>
                )}

                {intelligence?.anomalies && intelligence.anomalies.length > 0 && (
                  <div className="terminal-panel">
                    <Heading level={4} spacing="sm">System Alerts</Heading>
                    {intelligence.anomalies.map((anom, idx) => (
                      <div key={idx} style={{ marginBottom: '1rem' }}>
                        <Tag label={anom.anomaly_type} variant={anom.severity >= 4 ? 'danger' : 'copper'} />
                        <Text as="p" variant="muted" size="sm" style={{ marginTop: '0.5rem' }}>{anom.description}</Text>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* OIKEA SARAKE: TRADE */}
          <div className={`terminal-col-right terminal-tab-content ${activeTab === 'intelligence' ? 'hide-on-mobile' : ''}`}>
            
            <div className="terminal-tabs" style={{ display: 'flex', marginBottom: '2rem' }}>
              <button 
                className={`terminal-tab-btn ${!isSell ? 'active' : 'inactive'}`}
                onClick={() => { setTradeMode('buy'); setTradeAmount(''); }}
              >BUY</button>
              <button 
                className={`terminal-tab-btn ${isSell ? 'active' : 'inactive'}`}
                onClick={() => { if(currentShares > 0) { setTradeMode('sell'); setTradeAmount(''); } }}
                disabled={currentShares <= 0}
                style={{ opacity: currentShares > 0 ? 1 : 0.4, cursor: currentShares > 0 ? 'pointer' : 'not-allowed' }}
              >SELL</button>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text variant="muted" size="sm" style={{ textTransform: 'uppercase' }}>
                  {isSell ? 'Amount (Shares)' : 'Investment (EUR)'}
                </Text>
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
                <Text variant="muted" size="sm">
                  {isStrict ? `Ledger: €${walletBalance.toFixed(2)}` : 'Simulator Mode'}
                </Text>
                <Text variant="primary" size="sm" tabular>
                  {isSell ? `Value: €${estimatedEur.toFixed(2)}` : `≈ ${estimatedShares.toFixed(3)} Shares`}
                </Text>
              </div>
            </div>

            {isSell && numericInput > 0 && (
              <div className="terminal-panel" style={{ borderLeft: `2px solid ${profitLoss >= 0 ? 'var(--c-green)' : 'var(--c-accent)'}` }}>
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

            {!isTradeValid && numericInput > 0 && (
              <Text variant="accent" size="sm" style={{ textAlign: 'center', display: 'block', marginBottom: '1rem' }}>
                {isSell ? 'Cannot sell more shares than owned.' : 'Insufficient funds in ledger.'}
              </Text>
            )}

            <Button variant="primary" fullWidth onClick={handleExecuteTrade} disabled={!isTradeValid || isProcessing}>
              {isProcessing ? 'Processing...' : 'Confirm Execution'}
            </Button>

          </div>

        </div>
      </div>
    </Modal>
  );
};