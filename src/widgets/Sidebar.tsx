import React from 'react';
import { ambientBorder } from '../commons/ambientBorder';
import { Heading, Text } from '../ui/Typography';

interface SidebarProps {
  title?: string;
  children?: React.ReactNode;
}

export const Sidebar = ({ title = 'Market Brief', children }: SidebarProps) => {
  return (
    <div
      style={{
        padding: '1.75rem',
        borderRadius: '12px',
        ...ambientBorder(),
      }}
    >
      <Heading level={3} spacing="sm">
        {title}
      </Heading>

      {children ? (
        children
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Text as="p" size="sm" variant="muted" weight="light">
            Quantitative screening active on Helsinki (OMXH) universe. 
            Signals update automatically after market close.
          </Text>

          <div
            style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              paddingTop: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <Text size="sm" variant="muted">Schema</Text>
            <Text size="sm" tabular>corbe.staging</Text>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text size="sm" variant="muted">Status</Text>
            <Text size="sm" variant="green">Synchronized</Text>
          </div>
        </div>
      )}
    </div>
  );
};