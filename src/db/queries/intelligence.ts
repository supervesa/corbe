import { corbeClient } from '../corbeClient';

export interface MarketDataDaily {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TickerFeatures {
  indicators: {
    RSI_14?: number;
    MACD?: number;
    SMA_50?: number;
  };
}

export interface AIPrediction {
  target_horizon: string;
  predicted_trend: number;
  confidence_score: number;
}

export interface MarketAnomaly {
  anomaly_type: string;
  description: string;
  severity: number;
  created_at: string;
}

export interface AssetIntelligence {
  history: MarketDataDaily[];
  features: TickerFeatures | null;
  prediction: AIPrediction | null;
  anomalies: MarketAnomaly[];
}

export async function fetchAssetIntelligence(symbol: string): Promise<AssetIntelligence> {
  const [historyRes, featuresRes, predictionRes, anomaliesRes] = await Promise.all([
    // 1. Historia (30 päivää)
    corbeClient
      .from('market_data_daily')
      .select('date, open, high, low, close, volume')
      .eq('symbol', symbol)
      .order('date', { ascending: false })
      .limit(30),
    
    // 2. Indikaattorit (Tuorein)
    corbeClient
      .from('ticker_features')
      .select('indicators')
      .eq('symbol', symbol)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle(),

    // 3. Ennuste (Tuorein ratkaisematon)
    corbeClient
      .from('ai_predictions')
      .select('target_horizon, predicted_trend, confidence_score')
      .eq('symbol', symbol)
      .is('actual_result', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),

    // 4. Anomaliat (Viimeiset 5)
    corbeClient
      .from('market_anomalies')
      .select('anomaly_type, description, severity, created_at')
      .eq('symbol', symbol)
      .order('created_at', { ascending: false })
      .limit(5)
  ]);

  // Varmistetaan järjestys (vanhin ensin graafia varten)
  const sortedHistory = (historyRes.data || []).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return {
    history: sortedHistory as MarketDataDaily[],
    features: featuresRes.data as TickerFeatures | null,
    prediction: predictionRes.data as AIPrediction | null,
    anomalies: anomaliesRes.data as MarketAnomaly[] || []
  };
}