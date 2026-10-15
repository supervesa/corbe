// src/db/queries/portfolios.ts
import { corbeClient } from '../corbeClient';

export interface PortfolioTicker {
  id: string;
  symbol: string;
  shares: number;
  average_buy_price: number;
  added_at: string;
  current_price?: number; // <-- LISÄTTY: Elävä markkinahinta!
}

export async function fetchActivePortfolio(userId: string): Promise<PortfolioTicker[]> {
  // 1. Hae käyttäjän salkku
  const { data: portfolio, error } = await corbeClient
    .from('portfolio_tickers')
    .select('*')
    .eq('user_id', userId)
    .order('added_at', { ascending: false });

  if (error || !portfolio) {
    console.error("Virhe salkun haussa:", error);
    return [];
  }

  // 2. Hae salkussa olevien osakkeiden LIVENÄ elävät hinnat Eteisen taulusta
  const symbols = portfolio.map(p => p.symbol);
  const { data: marketData } = await corbeClient
    .from('staging_tickers')
    .select('symbol, price')
    .in('symbol', symbols);

  // Tehdään hinnoista helppo hakukartta (Map)
  const priceMap = new Map(marketData?.map(m => [m.symbol, Number(m.price)]) || []);

  // 3. Yhdistetään salkun data ja elävä hinta
  return portfolio.map(p => ({
    ...p,
    // Jos hintaa ei jostain syystä löydy, näytetään viimeisin keskihinta
    current_price: priceMap.get(p.symbol) || Number(p.average_buy_price)
  }));
}