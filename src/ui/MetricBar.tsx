// src/ui/MetricBar.tsx
import React from 'react';
import { Text } from './Typography';

interface MetricBarProps {
  label: string;
  value: number; // 0 - 100
  displayValue?: string;
  tone?: 'copper' | 'green' | 'accent' | 'muted';
}

export const MetricBar = ({
  label,
  value,
  displayValue,
  tone = 'copper',
}: MetricBarProps) => {
  const clamped = Math.max(0, Math.min(100, value));

  const colorMap = {
    copper: 'var(--c-copper)',
    green: 'var(--c-green)',
    accent: 'var(--c-accent)',
    muted: 'var(--c-text-muted)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Text size="sm" variant="muted" weight="light">
          {label}
        </Text>
        <Text size="sm" tabular>
          {displayValue ?? `${clamped.toFixed(0)}%`}
        </Text>
      </div>

      <div
        style={{
          height: '2px',
          width: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.07)',
          borderRadius: 'var(--radius-sharp, 3px)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${clamped}%`,
            backgroundColor: colorMap[tone],
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  );
};