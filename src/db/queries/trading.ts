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
  tradeType: 'buy' | 'sell', 
  tradeValueEur: number,     // Summa euroina (maksettu tai saatu)
  tradeShares: number,       // Osakkeiden määrä
  currentShares: number,
  currentAvgPrice: number
) {
  // Lompakon suunta: Osto on miinusta, Myynti on plussaa
  const amountSnt = Math.round(tradeValueEur * 100) * (tradeType === 'buy' ? -1 : 1);

  // A) Päivitä lompakko (Ledger)
  const { error: walletError } = await corbeClient
    .from('wallet_ledger')
    .insert({
      user_id: userId,
      amount_snt: amountSnt,
      transaction_type: tradeType === 'buy' ? 'trade_buy' : 'trade_sell',
      description: `Market ${tradeType.toUpperCase()}: ${symbol} (${tradeShares.toFixed(3)} shares)`
    });

  if (walletError) return { error: walletError };

  // B) Laske uudet salkun arvot
  const newTotalShares = tradeType === 'buy' 
    ? currentShares + tradeShares 
    : currentShares - tradeShares;

  // Myynnissä keskihinta ei ikinä muutu, vain ostaessa!
  let newAvgPrice = currentAvgPrice;
  if (tradeType === 'buy') {
    const oldTotalValue = currentShares * currentAvgPrice;
    const newTotalValue = oldTotalValue + tradeValueEur;
    newAvgPrice = newTotalShares > 0 ? newTotalValue / newTotalShares : 0;
  }

  // C) Päivitä salkku tai SIIRRÄ ARKISTOON (jos myydään tyhjäksi)
  // Käytetään pientä marginaalia (0.0001) JavaScriptin desimaalivirheiden varalta
  if (newTotalShares <= 0.0001) {
    
    // 1. Laske myynnin lopullinen voitto/tappio euroina
    const profitLossEur = (currentAvgPrice > 0) 
      ? tradeValueEur - (currentShares * currentAvgPrice)
      : 0;

    // 2. Kirjaa osake myytyjen arkistoon (Archived Portfolio)
    await corbeClient.from('archived_portfolio').insert({
      user_id: userId,
      symbol: symbol,
      total_profit_loss_eur: profitLossEur
    });

    // 3. Poista aktiivisesta salkusta
    const { error: deleteError } = await corbeClient
      .from('portfolio_tickers')
      .delete()
      .eq('id', tickerId);
      
    return { error: deleteError };
    
  } else {
    // Vain osittainen myynti tai osto -> Päivitetään aktiivista salkkua
    const { error: updateError } = await corbeClient
      .from('portfolio_tickers')
      .update({
        shares: newTotalShares,
        average_buy_price: newAvgPrice
      })
      .eq('id', tickerId);
      
    return { error: updateError };
  }
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