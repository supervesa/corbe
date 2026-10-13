const fs = require('fs');
const path = require('path');

console.log("Rakennetaan Corbèn arkkitehtuuri oikein (suoraan src-kansioon)...");

// Osoitetaan suoraan olemassa olevaan src-kansioon!
const baseDir = path.join(process.cwd(), 'src');

try {
  // 1. Luodaan modulaariset kansiot
  const dirs = [
    'commons/css', 'commons/types',
    'contexts',
    'db/queries',
    'layouts',
    'pages/dashboard', 'pages/staging', 'pages/auth',
    'widgets/TopNavigation', 'widgets/StagingCardList', 'widgets/StagingCard',
    'ui'
  ];

  dirs.forEach(dir => {
    fs.mkdirSync(path.join(baseDir, dir), { recursive: true });
  });

  // 2. Siivotaan Viten vanhat oletustiedostot pois tieltä, jos niitä on
  const filesToDelete = ['assets', 'App.css', 'index.css'];
  filesToDelete.forEach(f => {
    const p = path.join(baseDir, f);
    if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
  });

  const write = (filePath, content) => fs.writeFileSync(path.join(baseDir, filePath), content);
  const touch = (filePath) => fs.writeFileSync(path.join(baseDir, filePath), '');

  // 3. Placeholder-tiedostot
  touch('commons/types/index.ts');
  touch('contexts/AuthContext.tsx');
  touch('contexts/NsgContext.tsx');
  touch('db/supabase.ts');
  touch('db/queries/staging.ts');
  touch('layouts/AuthLayout.tsx');
  touch('pages/dashboard/DashboardPage.tsx');
  touch('pages/auth/LoginPage.tsx');
  touch('ui/Button.tsx');
  touch('ui/Loader.tsx');

  // 4. CSS
  write('commons/css/variables.css', `:root {
  --c-base: #18181a;
  --c-card: #221f20;
  --c-accent: #8e3a33;
  --c-copper: #7d4b3a;
  --c-green: #5e8b5d;
  --c-text: #dfdfdf;
  --c-text-muted: #808080;
  --font-main: 'Jost', 'Inter', system-ui, sans-serif;
  --radius-sharp: 3px;
}`);

  write('commons/css/global.css', `@import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500&display=swap');
@import './variables.css';

* { box-sizing: border-box; }
body {
  margin: 0; min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-family: var(--font-main);
  color: var(--c-text);
  background: radial-gradient(circle at top right, #2a2a2d 0%, var(--c-base) 40%);
  background-color: var(--c-base);
  background-attachment: fixed;
}
h1, h2, h3, h4, h5, h6 { font-weight: 400; letter-spacing: 0.05em; margin: 0; }
a { color: var(--c-text); text-decoration: none; }`);

  // 5. UI Widgetit
  write('widgets/TopNavigation/index.tsx', `import React from 'react';

export const TopNavigation = () => {
  return (
    <header style={{ padding: '2rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ 
        border: '1px solid var(--c-text-muted)', padding: '0.4rem 1.2rem',
        fontSize: '1.4rem', letterSpacing: '0.1em'
      }}>Corbè</div>
      <nav style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem' }}>
        <span style={{ color: 'var(--c-text-muted)' }}>Portfolios</span>
        <span style={{ color: 'var(--c-text-muted)' }}>Analytics</span>
        <span style={{ color: 'var(--c-accent)', borderBottom: '1px solid var(--c-accent)', paddingBottom: '0.2rem' }}>Staging Area</span>
      </nav>
    </header>
  );
};`);

  write('widgets/StagingCard/StagingCard.css', `.corbe-card {
  position: relative; background-color: var(--c-card);
  border-radius: var(--radius-sharp); padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}
.corbe-card::before {
  content: ""; position: absolute; inset: -1px;
  border-radius: calc(var(--radius-sharp) + 1px);
  background: linear-gradient(135deg, var(--c-copper) 0%, rgba(34, 31, 32, 0) 40%);
  z-index: -1;
}`);

  write('widgets/StagingCard/index.tsx', `import React from 'react';
import './StagingCard.css';

interface Props { name: string; sector: string; trend: string; }

export const StagingCard = ({ name, sector, trend }: Props) => (
  <div className="corbe-card">
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
      <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{name}</h3>
      <span style={{ color: 'var(--c-green)', fontSize: '0.9rem' }}>{trend}</span>
    </div>
    <p style={{ color: 'var(--c-text-muted)', margin: '0 0 1.5rem 0', fontSize: '0.9rem' }}>
      Sector: {sector}<br/>Awaiting approval.
    </p>
    <button style={{
      background: 'var(--c-copper)', color: 'white', border: 'none',
      padding: '0.6rem 1rem', borderRadius: 'var(--radius-sharp)', cursor: 'pointer',
      width: '100%', fontFamily: 'inherit', fontSize: '0.9rem', letterSpacing: '0.05em'
    }}>Approve to 30</button>
  </div>
);`);

  write('widgets/StagingCardList/index.tsx', `import React from 'react';
import { StagingCard } from '../StagingCard';

export const StagingCardList = () => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
      <StagingCard name="Valmet Oyj" sector="Industrials" trend="+3.76%" />
      <StagingCard name="Gofore Oyj" sector="Technology" trend="+1.20%" />
      <StagingCard name="Neste Oyj" sector="Energy" trend="+5.44%" />
    </div>
  );
};`);

  // 6. Layout & Sivu
  write('pages/staging/StagingPage.tsx', `import React from 'react';
import { StagingCardList } from '../../widgets/StagingCardList';

export const StagingPage = () => {
  return (
    <div style={{ padding: '0 3rem' }}>
      <h2 style={{ marginBottom: '2rem', fontSize: '1.2rem', color: 'var(--c-text-muted)' }}>Pending Discoveries</h2>
      <StagingCardList />
    </div>
  );
};`);

  write('layouts/AppLayout.tsx', `import React from 'react';
import { TopNavigation } from '../widgets/TopNavigation';

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <TopNavigation />
      <main style={{ marginTop: '2rem' }}>
        {children}
      </main>
    </div>
  );
};`);

  // 7. App & Main
  write('App.tsx', `import React from 'react';
import './commons/css/global.css';
import { AppLayout } from './layouts/AppLayout';
import { StagingPage } from './pages/staging/StagingPage';

export default function App() {
  return (
    <AppLayout>
      <StagingPage />
    </AppLayout>
  );
}`);

  write('main.tsx', `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`);

  console.log("======================================");
  console.log("Valmis! Koko homma kirjoitettiin nätisti juuren src/ -kansioon.");
  console.log("Aja nyt vain terminaalissa:");
  console.log("npm run dev");
  console.log("======================================");

} catch (err) {
  console.error("Virhe:", err);
}