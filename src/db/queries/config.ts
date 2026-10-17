// src/db/queries/config.ts
import { corbeClient } from '../corbeClient';

export interface ConfigTicker {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  is_active: boolean;
}

// 1. Hae kaikki osakkeet
export async function fetchConfigTickers(): Promise<ConfigTicker[]> {
  const { data, error } = await corbeClient
    .from('config_tickers')
    .select('*')
    .order('symbol', { ascending: true });

  if (error) {
    console.error("Virhe haettaessa osakkeita:", error);
    return [];
  }
  return data as ConfigTicker[];
}

// 2. Lisää uusi osake
export async function addConfigTicker(symbol: string, name: string, sector: string, userId: string) {
  const { error } = await corbeClient
    .from('config_tickers')
    .insert({
      symbol: symbol.toUpperCase(),
      name: name,
      sector: sector,
      added_by: userId
    });
  return { error };
}

// 3. Kytke osake päälle/pois
export async function toggleTickerActive(id: string, isActive: boolean) {
  const { error } = await corbeClient
    .from('config_tickers')
    .update({ is_active: isActive })
    .eq('id', id);
  return { error };
}