import { corbeClient } from '../corbeClient';
import type { FlatTickerData } from '../../widgets/StagingDataTable';

export async function fetchPendingTickers(): Promise<FlatTickerData[]> {
  const { data, error } = await corbeClient
    .from('staging_tickers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Virhe haettaessa osakkeita Supabasesta:", error);
    return [];
  }

  if (!data) return [];

  return data.map((row: any) => ({
    ...row,
    price: Number(row.price),
  })) as FlatTickerData[];
}