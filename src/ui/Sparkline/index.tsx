// src/ui/Sparkline/index.tsx
import React from 'react';

interface SparklineProps {
  data: number[];
  color?: string; // esim. var(--c-accent)
  strokeWidth?: number;
}

export const Sparkline = ({ 
  data, 
  color = 'var(--c-accent)', 
  strokeWidth = 1.5 
}: SparklineProps) => {
  // Jos dataa ei ole, ei piirretä mitään
  if (!data || data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1; // Estetään nollalla jako

  const viewBoxWidth = 100;
  const viewBoxHeight = 30;

  // Skaalataan luvut SVG-koordinaateiksi
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * viewBoxWidth;
    // Y-akseli on SVG:ssä ylösalaisin, siksi height - arvo
    const y = viewBoxHeight - ((value - min) / range) * viewBoxHeight;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg 
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} 
      style={{ width: '100%', height: '60px', overflow: 'visible' }}
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        /* Tämä antaa siihen aavistuksen hehkua ilman paksua varjoa */
        style={{ filter: `drop-shadow(0px 2px 4px ${color}40)` }}
      />
    </svg>
  );
};