// src/pages/settings/SettingsPage.tsx
import React, { useEffect, useState } from 'react';
import { useSentinel } from '../../contexts/SentinelContext';
import { useToast } from '../../contexts/ToastContext';
import { fetchUserSettings, updateUserSettings } from '../../db/queries/trading';
import { Heading, Text, Prose } from '../../ui/Typography';
import { Checkbox } from '../../ui/Checkbox';
import { Button } from '../../ui/Button';
import { Loader } from '../../ui/Loader';

export const SettingsPage = () => {
  const { userProfile } = useSentinel();
  const { showToast } = useToast();
  
  const [isStrict, setIsStrict] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Ladataan nykyiset asetukset kannasta
  useEffect(() => {
    const loadSettings = async () => {
      if (!userProfile?.id) return;
      setIsLoading(true);
      const settings = await fetchUserSettings(userProfile.id);
      setIsStrict(settings.strict_wallet_mode);
      setIsLoading(false);
    };
    loadSettings();
  }, [userProfile?.id]);

  // Tallennetaan uudet asetukset
  const handleSave = async () => {
    if (!userProfile?.id) return;
    setIsSaving(true);
    
    const { error } = await updateUserSettings(userProfile.id, isStrict);
    
    if (error) {
      showToast('SYSTEM ERROR', 'Failed to update preferences.', 'error');
    } else {
      showToast('CONFIG SAVED', 'System preferences updated successfully.', 'success');
    }
    
    setIsSaving(false);
  };

  return (
    <div style={{ padding: '0 1.5rem', maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
      
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
        <div style={{ 
          background: 'var(--c-card)', 
          padding: '2.5rem', 
          borderRadius: 'var(--radius-sharp)', 
          border: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem'
        }}>
          
          <div>
            <Heading level={3} spacing="sm">Execution Environment</Heading>
            <Text as="p" variant="muted" size="sm" style={{ marginBottom: '1.5rem' }}>
              Toggle between realistic capital constraints and sandbox mode for strategy testing.
            </Text>
            
            {/* Käytetään aiemmin tehtyä Checkbox-komponenttiamme */}
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sharp)', border: '1px solid rgba(255,255,255,0.02)' }}>
              <Checkbox 
                label="Strict Wallet Mode (Enforce liquidity constraints)" 
                checked={isStrict}
                onChange={(e) => setIsStrict(e.target.checked)}
              />
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="primary" 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>

        </div>
      )}

    </div>
  );
};