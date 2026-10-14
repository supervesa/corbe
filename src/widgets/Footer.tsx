import React from 'react';
import { Text } from '../ui/Typography';

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        marginTop: 'auto',
        paddingTop: '4rem',
        paddingBottom: '2.5rem',
      }}
    >
      <div
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.07)',
          paddingTop: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <Text size="sm" variant="muted" weight="light">
          © {year} Corbé Quantitative Systems. Executive Terminal.
        </Text>

        <Text size="sm" variant="muted" weight="light" tabular>
          Ambient Light UI • Sentinel & Corbé DB
        </Text>
      </div>
    </footer>
  );
};