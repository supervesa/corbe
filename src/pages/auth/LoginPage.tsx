// src/pages/auth/LoginPage.tsx
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom'; // 1. TUODAAN NAVIGATE
import { useSentinel } from '../../contexts/SentinelContext';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Checkbox } from '../../ui/Checkbox';

export const LoginPage = () => {
  // 2. HAETAAN USERPROFILE KONTEKSTISTA
  const { login, userProfile } = useSentinel(); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 3. ÄLYKÄS REITITYS: Jos olemme jo kirjautuneet (esim. onnistuneen napinpainalluksen jälkeen),
  // selain heittää meidät salamana sisään Eteiseen!
  if (userProfile) {
    return <Navigate to="/staging" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: loginError } = await login(email, password);
    
    if (loginError) {
      setError(loginError.message);
      setLoading(false); // 4. UX-KORJAUS: Palautetaan nappi ennalleen VAIN jos tuli virhe.
    }
    // Jos virhettä ei tullut, Supabasen Auth-tila muuttuu taustalla, userProfile päivittyy
    // ja yllä oleva if-lause (Navigate) ottaa ohjat!
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '400px', 
        backgroundColor: 'var(--c-card)',
        padding: '3rem',
        borderRadius: 'var(--radius-sharp)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        borderTop: '1px solid rgba(255,255,255,0.05)'
      }}>
        
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ 
            display: 'inline-block',
            border: '1px solid var(--c-text-muted)', 
            padding: '0.4rem 1.2rem',
            fontFamily: 'var(--font-heading)',
            fontSize: '1.5rem', 
            letterSpacing: 'var(--ls-lux)'
          }}>Corbè</div>
        </div>

        {/* Lomake */}
        <form onSubmit={handleLogin}>
          <Input 
            label="Email Address" 
            type="email" 
            placeholder="executive@nsg.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <Checkbox label="Remember me" />
          </div>

          {error && (
            <div style={{ 
              color: 'var(--c-accent)', 
              fontSize: '0.85rem', 
              marginBottom: '1rem',
              textAlign: 'center' 
            }}>
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? 'Authenticating...' : 'Access Terminal'}
          </Button>
        </form>

      </div>
    </div>
  );
};