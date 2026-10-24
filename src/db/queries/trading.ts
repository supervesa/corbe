// src/db/queries/trading.ts
import { corbeClient } from '../corbeClient';

// 1. HAE KÄYTTÄJÄN ASETUKSET
export async function fetchUserSettings(userId: string) {
  const { data, error } = await corbeClient
    .from('settings')
    .select('preferences')
    .eq('user_id', userId)
    .maybeSingle(); 

  // Oletusarvot, jos asetuksia ei löydy
  const defaultPrefs = { strict_wallet_mode: false, blitz_allocation_pct: 40 };

  if (error || !data || !data.preferences) return defaultPrefs;
  
  return {
    strict_wallet_mode: data.preferences.strict_wallet_mode ?? defaultPrefs.strict_wallet_mode,
    blitz_allocation_pct: data.preferences.blitz_allocation_pct ?? defaultPrefs.blitz_allocation_pct
  };
}

// 2. TOTEUTA KAUPPA
export async function executeTrade(
  userId: string,
  tickerId: string, 
  symbol: string,
  tradeType: 'buy' | 'sell', 
  tradeValueEur: number,
  tradeShares: number,
  currentShares: number,
  currentAvgPrice: number,
  strategyType: 'core' | 'blitz' = 'core'
) {
  const amountSnt = Math.round(tradeValueEur * 100) * (tradeType === 'buy' ? -1 : 1);

  const { error: walletError } = await corbeClient
    .from('wallet_ledger')
    .insert({
      user_id: userId,
      amount_snt: amountSnt,
      transaction_type: tradeType === 'buy' ? 'trade_buy' : 'trade_sell',
      description: `Market ${tradeType.toUpperCase()} (${strategyType.toUpperCase()}): ${symbol} (${tradeShares.toFixed(3)} shares)`
    });

  if (walletError) return { error: walletError };

  const newTotalShares = tradeType === 'buy' 
    ? currentShares + tradeShares 
    : currentShares - tradeShares;

  let newAvgPrice = currentAvgPrice;
  if (tradeType === 'buy') {
    const oldTotalValue = currentShares * currentAvgPrice;
    const newTotalValue = oldTotalValue + tradeValueEur;
    newAvgPrice = newTotalShares > 0 ? newTotalValue / newTotalShares : 0;
  }

  if (newTotalShares <= 0.0001) {
    const profitLossEur = (currentAvgPrice > 0) 
      ? tradeValueEur - (currentShares * currentAvgPrice)
      : 0;

    await corbeClient.from('archived_portfolio').insert({
      user_id: userId,
      symbol: symbol,
      total_profit_loss_eur: profitLossEur,
      strategy_type: strategyType,
      archived_by: 'manual'
    });

    const { error: deleteError } = await corbeClient
      .from('portfolio_tickers')
      .delete()
      .eq('id', tickerId);
      
    return { error: deleteError };
    
  } else {
    const { error: updateError } = await corbeClient
      .from('portfolio_tickers')
      .update({
        shares: newTotalShares,
        average_buy_price: newAvgPrice,
        strategy_type: strategyType,
        acquired_by: 'manual'
      })
      .eq('id', tickerId);
      
    return { error: updateError };
  }
}

// 3. PÄIVITÄ KÄYTTÄJÄN ASETUKSET (Upsert: luo tai päivitä)
export async function updateUserSettings(userId: string, isStrict: boolean, blitzAllocation: number) {
  const preferences = { 
    strict_wallet_mode: isStrict,
    blitz_allocation_pct: blitzAllocation
  };
  
  const { error } = await corbeClient
    .from('settings')
    .upsert({ 
      user_id: userId, 
      preferences: preferences,
      updated_at: new Date().toISOString()
    });

  return { error };
}