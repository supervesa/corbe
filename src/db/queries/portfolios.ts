// src/db/queries/portfolios.ts
import { corbeClient } from '../corbeClient';

export interface PortfolioTicker {
  id: string;
  symbol: string;
  shares: number;
  average_buy_price: number;
  added_at: string;
  current_price?: number; 
  strategy_type: 'core' | 'blitz'; 
  acquired_by: string;             
  name?: string; // <-- LISÄTTY: Osakkeen selkokielinen nimi
}

export async function fetchActivePortfolio(userId: string): Promise<PortfolioTicker[]> {
  const { data: portfolio, error } = await corbeClient
    .from('portfolio_tickers')
    .select('*')
    .eq('user_id', userId)
    .order('added_at', { ascending: false });

  if (error || !portfolio) {
    console.error("Virhe salkun haussa:", error);
    return [];
  }

  const symbols = portfolio.map(p => p.symbol);

  // Haetaan rinnakkain hinnat Eteisestä JA nimet Universumi-taulusta
  const [marketRes, configRes] = await Promise.all([
    corbeClient.from('staging_tickers').select('symbol, price').in('symbol', symbols),
    corbeClient.from('config_tickers').select('symbol, name').in('symbol', symbols)
  ]);

  const priceMap = new Map(marketRes.data?.map(m => [m.symbol, Number(m.price)]) || []);
  const nameMap = new Map(configRes.data?.map(c => [c.symbol, c.name]) || []);

  return portfolio.map(p => ({
    ...p,
    current_price: priceMap.get(p.symbol) || Number(p.average_buy_price),
    name: nameMap.get(p.symbol) || p.symbol // Jos nimeä ei löydy, näytetään symboli
  }));
}