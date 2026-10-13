// src/db/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Varoitus: Supabase ympäristömuuttujia ei ole asetettu!");
}

// Luodaan yhteys nimenomaan CORBE-skeemaan!
export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || '',
  {
    db: {
      schema: 'corbe' // <-- Tämä pakottaa kaikki kyselyt corbe-skeemaan
    }
  }
);