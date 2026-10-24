// src/pages/settings/SettingsPage.tsx
import React, { useEffect, useState } from 'react';
import { useSentinel } from '../../contexts/SentinelContext';
import { useToast } from '../../contexts/ToastContext';
import { fetchUserSettings, updateUserSettings } from '../../db/queries/trading';
import { fetchConfigTickers, addConfigTicker, toggleTickerActive, type ConfigTicker } from '../../db/queries/config';
import { Heading, Text, Prose, Tag } from '../../ui/Typography';
import { Checkbox } from '../../ui/Checkbox';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Loader } from '../../ui/Loader';
import { FlexTable, type ColumnDef } from '../../ui/FlexTable';

export const SettingsPage = () => {
  const { userProfile } = useSentinel();
  const { showToast } = useToast();
  
  // Wallet Settings
  const [isStrict, setIsStrict] = useState(false);
  const [blitzAllocation, setBlitzAllocation] = useState<number>(40);
  const [isSaving, setIsSaving] = useState(false);

  // Ticker Settings
  const [tickers, setTickers] = useState<ConfigTicker[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Ticker Form
  const [newSymbol, setNewSymbol] = useState('');
  const [newName, setNewName] = useState('');
  const [newSector, setNewSector] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const loadData = async () => {
    if (!userProfile?.id) return;
    setIsLoading(true);
    
    const [settings, tickersData] = await Promise.all([
      fetchUserSettings(userProfile.id),
      fetchConfigTickers()
    ]);
    
    setIsStrict(settings.strict_wallet_mode);
    setBlitzAllocation(settings.blitz_allocation_pct);
    setTickers(tickersData);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [userProfile?.id]);

  // --- KÄSITTELIJÄT ---

  const handleSaveWalletConfig = async () => {
    if (!userProfile?.id) return;
    setIsSaving(true);
    
    const { error } = await updateUserSettings(userProfile.id, isStrict, blitzAllocation);
    
    if (error) {
      showToast('SYSTEM ERROR', 'Failed to update preferences.', 'error');
    } else {
      showToast('CONFIG SAVED', 'Execution environment updated.', 'success');
    }
    setIsSaving(false);
  };

  const handleAddTicker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.id || !newSymbol || !newName || !newSector) return;
    setIsAdding(true);

    const { error } = await addConfigTicker(newSymbol, newName, newSector, userProfile.id);
    
    if (error) {
      showToast('SYSTEM ERROR', `Failed to add ${newSymbol}. Symbol might already exist.`, 'error');
    } else {
      showToast('TICKER ADDED', `${newSymbol} added to quantitative universe.`, 'success');
      setNewSymbol('');
      setNewName('');
      setNewSector('');
      await loadData();
    }
    setIsAdding(false);
  };

  const handleToggleTicker = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    setTickers(prev => prev.map(t => t.id === id ? { ...t, is_active: newStatus } : t));
    
    const { error } = await toggleTickerActive(id, newStatus);
    if (error) {
      showToast('SYSTEM ERROR', 'Failed to toggle ticker status.', 'error');
      await loadData();
    }
  };

  // --- TAULUKON SARAKKEET ---
  const columns: ColumnDef<ConfigTicker>[] = [
    {
      header: 'Asset',
      flex: 2,
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Text variant="primary">{row.name}</Text>
          <Text variant="muted" size="sm" tabular>{row.symbol}</Text>
        </div>
      )
    },
    {
      header: 'Sector',
      flex: 1.5,
      render: (row) => <Tag label={row.sector} variant="copper" />
    },
    {
      header: 'Active Tracking',
      flex: 1,
      align: 'right',
      render: (row) => (
        <Checkbox 
          label={row.is_active ? 'Active' : 'Paused'} 
          checked={row.is_active}
          onChange={() => handleToggleTicker(row.id, row.is_active)}
        />
      )
    }
  ];

  return (
    <div style={{ padding: '0 1.5rem', maxWidth: '1000px', margin: '0 auto', paddingBottom: '4rem' }}>
      
      <section style={{ marginBottom: '3.5rem', paddingTop: '2rem' }}>
        <Heading level={2} spacing="sm">System Configuration</Heading>
        <Prose rule>
          <Text as="p" variant="muted" weight="light">
            Manage global parameters for the Corbè quantitative engine and trading execution environments. 
            Changes applied here will immediately affect all connected terminals.
          </Text>
        </Prose>
      </section>

      {isLoading ? (
        <Loader />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          
          {/* PANEELI 1: Execution Environment & Strategy Allocation */}
          <div style={{ background: 'var(--c-card)', padding: '2.5rem', borderRadius: 'var(--radius-sharp)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Heading level={3} spacing="sm">Execution Environment</Heading>
            <Text as="p" variant="muted" size="sm" style={{ marginBottom: '1.5rem' }}>
              Configure capital constraints and algorithmic portfolio allocation limits.
            </Text>
            
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sharp)', border: '1px solid rgba(255,255,255,0.02)', marginBottom: '1.5rem' }}>
              <Checkbox 
                label="Strict Wallet Mode (Enforce liquidity constraints)" 
                checked={isStrict}
                onChange={(e) => setIsStrict(e.target.checked)}
              />
            </div>

            <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sharp)', border: '1px solid rgba(255,255,255,0.02)', marginBottom: '2rem' }}>
              <Heading level={4} spacing="sm">Strategy Allocation (Blitz)</Heading>
              <Text as="p" variant="muted" size="sm" style={{ marginBottom: '1rem' }}>
                Set the maximum percentage of total liquidity allocated to the high-frequency BLITZ strategy. The remainder is reserved for CORE positions.
              </Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Input 
                  type="number" 
                  min="0" 
                  max="100" 
                  value={blitzAllocation} 
                  onChange={(e) => setBlitzAllocation(Number(e.target.value))}
                  style={{ width: '100px', marginBottom: 0, textAlign: 'center' }}
                />
                <Text variant="primary" size="lg">%</Text>
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="primary" 
                onClick={handleSaveWalletConfig}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Configuration'}
              </Button>
            </div>
          </div>

          {/* PANEELI 2: Quantitative Universe (Tickers) */}
          <div style={{ background: 'var(--c-card)', padding: '2.5rem', borderRadius: 'var(--radius-sharp)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Heading level={3} spacing="sm">Quantitative Universe</Heading>
            <Text as="p" variant="muted" size="sm" style={{ marginBottom: '2rem' }}>
              Define the assets tracked by the Python engine. Pausing an asset excludes it from daily screening and AI oracle predictions.
            </Text>

            <form onSubmit={handleAddTicker} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end', marginBottom: '3rem', padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sharp)' }}>
              <Input 
                label="Symbol (e.g. AAPL)" 
                value={newSymbol} 
                onChange={(e) => setNewSymbol(e.target.value)} 
                required 
                style={{ marginBottom: 0 }}
              />
              <Input 
                label="Company Name" 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)} 
                required 
                style={{ marginBottom: 0 }}
              />
              <Input 
                label="Sector" 
                value={newSector} 
                onChange={(e) => setNewSector(e.target.value)} 
                required 
                style={{ marginBottom: 0 }}
              />
              <Button type="submit" variant="copper" disabled={isAdding} style={{ height: '42px', marginBottom: '1.5rem' }}>
                {isAdding ? 'Adding...' : 'Add Asset'}
              </Button>
            </form>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <FlexTable data={tickers} columns={columns} keyExtractor={(item) => item.id} />
            </div>

          </div>

        </div>
      )}

    </div>
  );
};