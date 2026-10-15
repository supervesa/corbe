// src/commons/formatters.ts

/** Muotoilee volyymin kompaktiin muotoon: 65043063 -> "65.0M", 56479 -> "56.5K" */
export function formatVolume(volume?: number): string {
    if (volume === undefined || volume === null || isNaN(volume)) return '—';
    if (volume >= 1_000_000) return `${(volume / 1_000_000).toFixed(1)}M`;
    if (volume >= 1_000) return `${(volume / 1_000).toFixed(1)}K`;
    return volume.toString();
  }
  
  /** Muotoilee etumerkillisen prosentin: 8.5 -> "+8.50%", -3.5 -> "-3.50%" */
  export function formatSignedPercent(val?: number, decimals = 2): string {
    if (val === undefined || val === null || isNaN(val)) return '—';
    return `${val > 0 ? '+' : ''}${val.toFixed(decimals)}%`;
  }
  
  /** Muotoilee AI-horisontin: '1_week' -> '1W', '1_month' -> '1M' */
  export function formatHorizon(horizon?: string): string {
    if (!horizon) return '';
    const map: Record<string, string> = {
      '1_week': '1W',
      '1_month': '1M',
      '6_months': '6M',
      '2_years': '2Y',
    };
    return map[horizon] ?? horizon.toUpperCase();
  }
  
  /** Tulkitsee RSI-14 arvon ja palauttaa Tag-komponentille sopivan teemavärin */
  export function getRsiStatus(rsi?: number): {
    label: string;
    variant: 'default' | 'copper' | 'green' | 'danger';
  } {
    if (rsi === undefined || isNaN(rsi)) return { label: '—', variant: 'default' };
    if (rsi <= 30) return { label: `RSI ${rsi.toFixed(0)} • OVERSOLD`, variant: 'green' };
    if (rsi >= 70) return { label: `RSI ${rsi.toFixed(0)} • OVERBOUGHT`, variant: 'danger' };
    return { label: `RSI ${rsi.toFixed(0)}`, variant: 'default' };
  }