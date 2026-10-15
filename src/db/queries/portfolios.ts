import { corbeClient } from '../corbeClient';

export interface PortfolioTicker {
  id: string;
  symbol: string;
  shares: number;
  average_buy_price: number;
  added_at: string;
}

// Hakee aktiivisen salkun
export async function fetchActivePortfolio(userId: string): Promise<PortfolioTicker[]> {
  const { data, error } = await corbeClient
    .from('portfolio_tickers')
    .select('*')
    .eq('user_id', userId)
    .order('added_at', { ascending: false });

  if (error) {
    console.error("Virhe salkun haussa:", error);
    return [];
  }
  return data as PortfolioTicker[];
}