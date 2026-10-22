// src/db/queries/logs.ts
import { corbeClient } from '../corbeClient';

export interface BrokerLog {
  id: string;
  title: string;
  message: string;
  actions_count: number;
  created_at: string;
}

export async function fetchBrokerLogs(userId: string): Promise<BrokerLog[]> {
  const { data, error } = await corbeClient
    .from('broker_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50); // Haetaan 50 uusinta raporttia

  if (error) {
    console.error("Virhe haettaessa meklarin raportteja:", error);
    return [];
  }
  return data as BrokerLog[];
}