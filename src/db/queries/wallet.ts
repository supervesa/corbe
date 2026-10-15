// src/db/queries/wallet.ts
import { corbeClient } from '../corbeClient';

export interface WalletTransaction {
  id: string;
  amount_snt: number;
  transaction_type: string;
  description: string;
  created_at: string;
}

// 1. HAKU: Haetaan koko tiliote
export async function fetchWalletLedger(userId: string): Promise<WalletTransaction[]> {
  const { data, error } = await corbeClient
    .from('wallet_ledger')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Virhe lompakon haussa:", error);
    return [];
  }
  return data as WalletTransaction[];
}

// 2. TALLETUS: Lisätään uusi rivi pääkirjaan
export async function addFunds(userId: string, amountEur: number, type: string, description: string) {
  const amount_snt = Math.round(amountEur * 100); // Muutetaan eurot senteiksi!
  
  const { error } = await corbeClient
    .from('wallet_ledger')
    .insert({ 
      user_id: userId, 
      amount_snt: amount_snt, 
      transaction_type: type, 
      description: description 
    });
    
  return { error };
}