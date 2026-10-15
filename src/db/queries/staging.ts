// src/db/queries/staging.ts
import { corbeClient } from '../corbeClient';
import type { FlatTickerData } from '../../widgets/StagingDataTable';

// 1. HAKU: Hakee Eteisen ja suodattaa pois käyttäjän jo käsittelemät osakkeet
export async function fetchPendingTickers(userId: string): Promise<FlatTickerData[]> {
  // A) Haetaan globaali eteinen
  const { data: stagingData, error: stagingErr } = await corbeClient
    .from('staging_tickers')
    .select('*')
    .order('created_at', { ascending: false });

  if (stagingErr) {
    console.error("Virhe haettaessa osakkeita Supabasesta:", stagingErr);
    return [];
  }

  if (!stagingData) return [];

  // B) Haetaan käyttäjän omat jo hyväksytyt ja hylätyt osakkeet
  const { data: portfolioData } = await corbeClient
    .from('portfolio_tickers')
    .select('symbol')
    .eq('user_id', userId);
    
  const { data: rejectedData } = await corbeClient
    .from('rejected_tickers')
    .select('symbol')
    .eq('user_id', userId);

  // Kerätään kaikki jo käsitellyt symbolit Set-rakenteeseen (nopea haku)
  const handledSymbols = new Set([
    ...(portfolioData?.map(r => r.symbol) || []),
    ...(rejectedData?.map(r => r.symbol) || [])
  ]);

  // C) Suodatetaan data ja korjataan hinnan tyyppi numeroksi (sinun korjauksesi!)
  const pendingData = stagingData
    .filter(row => !handledSymbols.has(row.symbol))
    .map((row: any) => ({
      ...row,
      price: Number(row.price),
    }));

  return pendingData as FlatTickerData[];
}

// 2. HYVÄKSY (Approve) - Kirjaa osakkeen käyttäjän aktiiviseen salkkuun
export async function approveTicker(userId: string, symbol: string) {
  const { error } = await corbeClient
    .from('portfolio_tickers')
    .insert({ user_id: userId, symbol: symbol });
  return { error };
}

// 3. HYLKÄÄ (Reject) - Kirjaa osakkeen käyttäjän hylättyjen listalle (oppimiskirjasto)
export async function rejectTicker(userId: string, symbol: string) {
  const { error } = await corbeClient
    .from('rejected_tickers')
    .insert({ user_id: userId, symbol: symbol });
  return { error };
}
export interface RejectedTicker {
  id: string;
  symbol: string;
  reject_reason: string;
  rejected_at: string;
}

// Hakee hylätyt osakkeet
export async function fetchRejectedTickers(userId: string): Promise<RejectedTicker[]> {
  const { data, error } = await corbeClient
    .from('rejected_tickers')
    .select('*')
    .eq('user_id', userId)
    .order('rejected_at', { ascending: false });

  if (error) {
    console.error("Virhe hylättyjen haussa:", error);
    return [];
  }
  return data as RejectedTicker[];
}