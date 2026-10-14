import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Tämä yhteys pakotetaan corbe-skeemaan ja sitä käytetään VAIN datan hakuun
export const corbeClient = createClient(url || '', key || '', {
  db: { schema: 'corbe' }
});