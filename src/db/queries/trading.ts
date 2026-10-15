// src/db/queries/trading.ts
import { corbeClient } from '../corbeClient';

// 1. HAE KÄYTTÄJÄN ASETUKSET (Onko Simulator vai Strict mode?)
export async function fetchUserSettings(userId: string) {
  const { data, error } = await corbeClient
    .from('settings')
    .select('preferences')
    .eq('user_id', userId)
    .maybeSingle(); // <-- TÄMÄ SANA KORJAA 406-VIRHEEN!

  // Jos asetuksia ei löydy (taulu tyhjä), oletetaan että Hiekkalaatikko on päällä
  if (error || !data) return { strict_wallet_mode: false };
  return data.preferences || { strict_wallet_mode: false };
}

// 2. TOTEUTA KAUPPA
export async function executeTrade(
  userId: string,
  tickerId: string, 
  symbol: string,
  amountEur: number,
  sharesBought: number,
  currentShares: number,
  currentAvgPrice: number
) {
  const amountSnt = Math.round(amountEur * 100);

  // A) Vähennä rahat lompakosta (Ledger)
  const { error: walletError } = await corbeClient
    .from('wallet_ledger')
    .insert({
      user_id: userId,
      amount_snt: -amountSnt,
      transaction_type: 'trade_buy',
      description: `Market Buy: ${symbol} (${sharesBought.toFixed(3)} shares)`
    });

  if (walletError) return { error: walletError };

  // B) Laske uusi keskihinta ja osakemäärä salkkuun
  const newTotalShares = currentShares + sharesBought;
  const oldTotalValue = currentShares * currentAvgPrice;
  const newTotalValue = oldTotalValue + amountEur;
  const newAvgPrice = newTotalShares > 0 ? newTotalValue / newTotalShares : 0;

  // C) Päivitä salkku
  const { error: portfolioError } = await corbeClient
    .from('portfolio_tickers')
    .update({
      shares: newTotalShares,
      average_buy_price: newAvgPrice
    })
    .eq('id', tickerId)
    .eq('user_id', userId);

  return { error: portfolioError };
}

// 3. PÄIVITÄ KÄYTTÄJÄN ASETUKSET (Upsert: luo tai päivitä)
export async function updateUserSettings(userId: string, isStrict: boolean) {
  const preferences = { strict_wallet_mode: isStrict };
  
  const { error } = await corbeClient
    .from('settings')
    .upsert({ 
      user_id: userId, 
      preferences: preferences,
      updated_at: new Date().toISOString()
    }); // <-- onConflict poistettu täältä!

  return { error };
}