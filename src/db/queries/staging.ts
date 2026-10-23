// src/db/queries/staging.ts
import { corbeClient } from '../corbeClient';
import type { FlatTickerData } from '../../widgets/StagingDataTable';

// --- TYYPIT ---
export interface RejectedTicker {
  id: string;
  symbol: string;
  reject_reason: string;
  rejected_at: string;
}

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
  target_horizon: string;
  predicted_trend: number;
  confidence_score: number;
  created_at: string;
}

// --- FUNKTIOT ---

// 1. HAKU (Perus)
export async function fetchPendingTickers(userId: string): Promise<FlatTickerData[]> {
  const { data: stagingData, error: stagingErr } = await corbeClient
    .from('staging_tickers')
    .select('*')
    .order('created_at', { ascending: false });

  if (stagingErr || !stagingData) return [];

  const { data: portfolioData } = await corbeClient.from('portfolio_tickers').select('symbol').eq('user_id', userId);
  const { data: rejectedData } = await corbeClient.from('rejected_tickers').select('symbol').eq('user_id', userId);

  const handledSymbols = new Set([
    ...(portfolioData?.map(r => r.symbol) || []),
    ...(rejectedData?.map(r => r.symbol) || [])
  ]);

  const pendingData = stagingData
    .filter(row => !handledSymbols.has(row.symbol))
    .map((row: any) => ({
      ...row,
      price: Number(row.price),
    }));

  return pendingData as FlatTickerData[];
}

// 2. RIKASTETTU HAKU (Tekoäly + Graafit)
export async function fetchEnrichedPendingTickers(userId: string): Promise<FlatTickerData[]> {
  const baseTickers = await fetchPendingTickers(userId);
  if (baseTickers.length === 0) return [];

  const symbols = baseTickers.map(t => t.symbol);

  const [marketRes, featuresRes, aiRes] = await Promise.all([
    corbeClient.from('market_data_daily').select('symbol, date, open, high, low, close, volume').in('symbol', symbols).order('date', { ascending: true }),
    corbeClient.from('ticker_features').select('symbol, date, indicators, pattern_embedding').in('symbol', symbols).order('date', { ascending: false }),
    corbeClient.from('ai_predictions').select('id, symbol, target_horizon, predicted_trend, confidence_score, created_at').in('symbol', symbols).is('resolved_at', null).order('created_at', { ascending: false }),
  ]);

  const marketBySymbol = new Map<string, { latest: MarketSnapshot; history: number[] }>();
  if (marketRes.data) {
    for (const row of marketRes.data) {
      const closeVal = Number(row.close);
      const snapshot: MarketSnapshot = {
        date: row.date, open: Number(row.open), high: Number(row.high),
        low: Number(row.low), close: closeVal, volume: Number(row.volume),
      };
      const existing = marketBySymbol.get(row.symbol);
      if (existing) {
        existing.history.push(closeVal);
        existing.latest = snapshot; 
      } else {
        marketBySymbol.set(row.symbol, { latest: snapshot, history: [closeVal] });
      }
    }
  }

  const featuresBySymbol = new Map<string, { indicators: TickerIndicators; embedding: number[] }>();
  if (featuresRes.data) {
    for (const row of featuresRes.data) {
      if (!featuresBySymbol.has(row.symbol)) {
        featuresBySymbol.set(row.symbol, {
          indicators: row.indicators ?? {},
          embedding: Array.isArray(row.pattern_embedding) ? row.pattern_embedding : [],
        });
      }
    }
  }

  const aiBySymbol = new Map<string, AIPredictionData>();
  if (aiRes.data) {
    for (const row of aiRes.data) {
      if (!aiBySymbol.has(row.symbol)) {
        aiBySymbol.set(row.symbol, {
          id: row.id, target_horizon: row.target_horizon,
          predicted_trend: Number(row.predicted_trend),
          confidence_score: Number(row.confidence_score),
          created_at: row.created_at,
        });
      }
    }
  }

  return baseTickers.map(ticker => {
    const marketInfo = marketBySymbol.get(ticker.symbol);
    const featureInfo = featuresBySymbol.get(ticker.symbol);
    const aiInfo = aiBySymbol.get(ticker.symbol);

    return {
      ...ticker,
      price: marketInfo?.latest.close ?? ticker.price,
      market: marketInfo?.latest,
      history: marketInfo?.history,
      indicators: featureInfo?.indicators,
      pattern_embedding: featureInfo?.embedding,
      ai_prediction: aiInfo,
    };
  });
}

// 3. TOIMINNOT
export async function approveTicker(userId: string, symbol: string) {
  const { error } = await corbeClient.from('portfolio_tickers').insert({ user_id: userId, symbol: symbol });
  return { error };
}

export async function rejectTicker(userId: string, symbol: string) {
  const { error } = await corbeClient.from('rejected_tickers').insert({ user_id: userId, symbol: symbol });
  return { error };
}

export async function fetchRejectedTickers(userId: string): Promise<RejectedTicker[]> {
  const { data, error } = await corbeClient
    .from('rejected_tickers')
    .select('*')
    .eq('user_id', userId)
    .order('rejected_at', { ascending: false });

  if (error) return [];
  return data as RejectedTicker[];
}