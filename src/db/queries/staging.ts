import { supabase } from '../supabase';
import type { FlatTickerData } from '../../widgets/StagingDataTable';

export async function fetchPendingTickers(): Promise<FlatTickerData[]> {
  const { data, error } = await supabase
    .from('staging_tickers') // Hakee nyt corbe.staging_tickers
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Virhe haettaessa osakkeita Supabasesta:", error);
    return [];
  }

  return data as FlatTickerData[];
}