import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SENTINEL_URL;
const key = import.meta.env.VITE_SENTINEL_ANON_KEY;

// Tämä on perinteinen public-yhteys pilveen (Auth ja Profiilit)
export const sentinelClient = createClient(url || '', key || '');