// src/widgets/BrokerLogsPanel/index.tsx
import React, { useEffect, useState } from 'react';
import { fetchBrokerLogs, type BrokerLog } from '../../db/queries/logs';
import { useSentinel } from '../../contexts/SentinelContext';
import { Heading, Text, Tag } from '../../ui/Typography';
import { Loader } from '../../ui/Loader';

interface BrokerLogsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BrokerLogsPanel = ({ isOpen, onClose }: BrokerLogsPanelProps) => {
  const { userProfile } = useSentinel();
  const [logs, setLogs] = useState<BrokerLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userProfile?.id) {
      setIsLoading(true);
      fetchBrokerLogs(userProfile.id).then(data => {
        setLogs(data);
        setIsLoading(false);
      });
    }
  }, [isOpen, userProfile?.id]);

  if (!isOpen) return null;

  return (
    <>
      {/* Tumma tausta, jota klikkaamalla paneeli sulkeutuu */}
      <div 
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)', zIndex: 9998 }}
      />
      
      {/* Oikeasta reunasta liukuva paneeli */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: '100%', maxWidth: '400px',
        backgroundColor: 'var(--c-base)',
        borderLeft: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '-10px 0 40px rgba(0,0,0,0.5)',
        zIndex: 9999, display: 'flex', flexDirection: 'column',
        animation: 'slideInRight 0.3s ease-out'
      }}>
        
        {/* Header */}
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Heading level={3} spacing="none">Broker's Notes</Heading>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--c-text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
        </div>

        {/* Sisältö */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          {isLoading ? (
            <Loader />
          ) : logs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {logs.map(log => (
                <div key={log.id} style={{ background: 'var(--c-card)', padding: '1.5rem', borderRadius: 'var(--radius-sharp)', borderLeft: '2px solid var(--c-copper)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <Text variant="muted" size="sm">{new Date(log.created_at).toLocaleString('fi-FI')}</Text>
                    <Tag label={`${log.actions_count} ACTIONS`} variant="copper" />
                  </div>
                  <Text as="p" variant="primary" style={{ whiteSpace: 'pre-line', margin: 0, lineHeight: 1.6 }}>
                    {log.message}
                  </Text>
                </div>
              ))}
            </div>
          ) : (
            <Text variant="muted">No broker activities recorded yet.</Text>
          )}
        </div>
        
        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>
      </div>
    </>
  );
};