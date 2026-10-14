import React, { createContext, useContext, useState, useEffect } from 'react';
import { sentinelClient } from '../db/sentinelClient'; // PILVI-YHTEYS!

const ROLE_HIERARCHY = ['user', 'moderator', 'admin', 'superadmin'];

interface SentinelContextType {
  userProfile: any;
  systemModules: any[];
  isSentinelLoading: boolean;
  hasModule: (moduleKey: string) => boolean;
  hasRole: (requiredRole: string) => boolean;
  login: (email: string, pass: string) => Promise<{error: any}>;
  logout: () => Promise<void>;
}

const SentinelContext = createContext<SentinelContextType>({} as SentinelContextType);

export function SentinelProvider({ children }: { children: React.ReactNode }) {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [systemModules, setSystemModules] = useState<any[]>([]);
  const [isSentinelLoading, setIsSentinelLoading] = useState(true);

  useEffect(() => {
    const { data: authListener } = sentinelClient.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          if (event === 'PASSWORD_RECOVERY' || event === 'USER_UPDATED') {
            setIsSentinelLoading(false);
            return; 
          }
          await loadSentinelData(session.user.id);
        } else {
          setUserProfile(null);
          setIsSentinelLoading(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const loadSentinelData = async (userId: string) => {
    setIsSentinelLoading(true);
    try {
      const { data: profile } = await sentinelClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { data: modules } = await sentinelClient
        .from('system_modules')
        .select('*')
        .eq('is_active', true);

      setUserProfile(profile);
      setSystemModules(modules || []);
    } catch (error) {
      console.error('Sentinel kohtasi virheen:', error);
    } finally {
      setIsSentinelLoading(false);
    }
  };

  // Kirjautumisfunktiot
  const login = async (email: string, pass: string) => {
    const { error } = await sentinelClient.auth.signInWithPassword({ email, password: pass });
    return { error };
  };

  const logout = async () => {
    await sentinelClient.auth.signOut();
  };

  const hasModule = (moduleKey: string) => {
    return userProfile?.permissions?.[moduleKey] === true;
  };

  const hasRole = (requiredRole: string) => {
    if (!userProfile?.role) return false;
    const currentLevel = ROLE_HIERARCHY.indexOf(userProfile.role);
    const requiredLevel = ROLE_HIERARCHY.indexOf(requiredRole);
    return currentLevel >= requiredLevel;
  };

  return (
    <SentinelContext.Provider value={{ userProfile, systemModules, isSentinelLoading, hasModule, hasRole, login, logout }}>
      {children}
    </SentinelContext.Provider>
  );
}

export const useSentinel = () => useContext(SentinelContext);