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

// ============================================================================
// LISÄYKSET: Markkinadata, tekniset indikaattorit ja AI-ennusteet
// ============================================================================

export interface MarketSnapshot {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TickerIndicators {
  MACD?: number;
  RSI_14?: number;
}

export interface AIPredictionData {
  id: string;
  target_horizon: string; // esim. '1_week' | '1_month'
  predicted_trend: number;
  confidence_score: number;
  created_at: string;
}

// Laajennettu tyyppi, joka on 100 % yhteensopiva nykyisen FlatTickerData-tyypin kanssa
export type EnrichedTickerData = FlatTickerData & {
  market?: MarketSnapshot;
  history?: number[]; // Oikea päätöskurssihistoria Sparkline-käyrälle
  indicators?: TickerIndicators;
  pattern_embedding?: number[];
  ai_prediction?: AIPredictionData;
};

/**
 * Hakee odottavat osakkeet (käyttäen olemassa olevaa fetchPendingTickers-funktiota)
 * ja rikastaa ne market_data_daily-, ticker_features- ja ai_predictions-taulujen datalla.
 */
export async function fetchEnrichedPendingTickers(userId: string): Promise<EnrichedTickerData[]> {
  const baseTickers = await fetchPendingTickers(userId);
  if (baseTickers.length === 0) return [];

  const symbols = baseTickers.map(t => t.symbol);

  // Haetaan kaikkien kolmen taulun tiedot rinnakkain vain tarvittaville symboleille
  const [marketRes, featuresRes, aiRes] = await Promise.all([
    corbeClient
      .from('market_data_daily')
      .select('symbol, date, open, high, low, close, volume')
      .in('symbol', symbols)
      .order('date', { ascending: true }),

    corbeClient
      .from('ticker_features')
      .select('symbol, date, indicators, pattern_embedding')
      .in('symbol', symbols)
      .order('date', { ascending: false }),

    corbeClient
      .from('ai_predictions')
      .select('id, symbol, target_horizon, predicted_trend, confidence_score, created_at')
      .in('symbol', symbols)
      .is('resolved_at', null)
      .order('created_at', { ascending: false }),
  ]);

  // 1. Ryhmitellään markkinadata ja muodostetaan kurssihistoria
  const marketBySymbol = new Map<string, { latest: MarketSnapshot; history: number[] }>();
  if (marketRes.data) {
    for (const row of marketRes.data) {
      const closeVal = Number(row.close);
      const snapshot: MarketSnapshot = {
        date: row.date,
        open: Number(row.open),
        high: Number(row.high),
        low: Number(row.low),
        close: closeVal,
        volume: Number(row.volume),
      };

      const existing = marketBySymbol.get(row.symbol);
      if (existing) {
        existing.history.push(closeVal);
        existing.latest = snapshot; // Koska järjestys on ascending, viimeisin jää voimaan
      } else {
        marketBySymbol.set(row.symbol, { latest: snapshot, history: [closeVal] });
      }
    }
  }

  // 2. Poimitaan tuoreimmat tekniset indikaattorit (RSI_14, MACD)
  const featuresBySymbol = new Map<string, { indicators: TickerIndicators; embedding: number[] }>();
  if (featuresRes.data) {
    for (const row of featuresRes.data) {
      if (!featuresBySymbol.has(row.symbol)) {
        const parsedEmbedding =
          typeof row.pattern_embedding === 'string'
            ? JSON.parse(row.pattern_embedding)
            : row.pattern_embedding;

        featuresBySymbol.set(row.symbol, {
          indicators: row.indicators ?? {},
          embedding: Array.isArray(parsedEmbedding) ? parsedEmbedding : [],
        });
      }
    }
  }

  // 3. Poimitaan tuorein avoin AI-ennuste per osake
  const aiBySymbol = new Map<string, AIPredictionData>();
  if (aiRes.data) {
    for (const row of aiRes.data) {
      if (!aiBySymbol.has(row.symbol)) {
        aiBySymbol.set(row.symbol, {
          id: row.id,
          target_horizon: row.target_horizon,
          predicted_trend: Number(row.predicted_trend),
          confidence_score: Number(row.confidence_score),
          created_at: row.created_at,
        });
      }
    }
  }

  // 4. Yhdistetään kaikki data alkuperäisiin osakkeisiin
  return baseTickers.map(ticker => {
    const marketInfo = marketBySymbol.get(ticker.symbol);
    const featureInfo = featuresBySymbol.get(ticker.symbol);
    const aiInfo = aiBySymbol.get(ticker.symbol);

    return {
      ...ticker,
      // Päivitetään hinta tuoreimpaan päätöskurssiin, jos sellainen löytyy
      price: marketInfo?.latest.close ?? ticker.price,
      market: marketInfo?.latest,
      history: marketInfo?.history,
      indicators: featureInfo?.indicators,
      pattern_embedding: featureInfo?.embedding,
      ai_prediction: aiInfo,
    };
  });
}