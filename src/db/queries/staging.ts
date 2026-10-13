const { data, error } = await supabase
  .from('staging_tickers') // <--- Hakee automaattisesti corbe.staging_tickers
  .select('*')