#!/bin/bash

# ==========================================
# Corbè Frontend - Projektin alustus-skripti
# ==========================================

PROJECT_NAME="corbe-frontend"

echo "Luodaan React + TypeScript -projekti nimeltä $PROJECT_NAME..."
npm create vite@latest $PROJECT_NAME -- --template react-ts

cd $PROJECT_NAME

echo "Asennetaan riippuvuudet..."
npm install

echo "Siivotaan Viten oletustiedostot..."
rm -rf src/assets
rm src/App.css
rm src/index.css

echo "Luodaan kansion rakenne..."
mkdir -p src/commons/css
mkdir -p src/commons/components

# ==========================================
# 1. CSS Muuttujat (Variables)
# ==========================================
echo "Luodaan src/commons/css/variables.css..."
cat << 'EOF' > src/commons/css/variables.css
:root {
  /* Väripaletti - Executive Sedan / Nightclub */
  --c-base: #18181a;       /* Syvä hiilenharmaa tausta */
  --c-card: #221f20;       /* Korttien hieman vaaleampi tausta */
  --c-accent: #8e3a33;     /* Oxblood / Ruosteenpunainen (Graafit jne) */
  --c-copper: #7d4b3a;     /* Himmeä kupari (Kromiefekti ja napit) */
  --c-green: #5e8b5d;      /* Tyylikäs vihreä (Positiiviset arvot) */
  --c-text: #dfdfdf;       /* Hopeanvalkoinen leipäteksti */
  --c-text-muted: #808080; /* Himmeä teksti (aputekstit) */

  /* Typografia (Haetaan Google Fontsista global.css:ssä) */
  --font-main: 'Jost', 'Inter', system-ui, sans-serif;
  
  /* Mitat */
  --radius-sharp: 3px;     /* Kova, mutta ei sormia leikkaava kulma */
}
EOF

# ==========================================
# 2. Globaali tyyli ja valaistus
# ==========================================
echo "Luodaan src/commons/css/global.css..."
cat << 'EOF' > src/commons/css/global.css
@import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500&display=swap');
@import './variables.css';

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  
  font-family: var(--font-main);
  color: var(--c-text);
  
  /* Taustan spottivalo oikeassa yläkulmassa + syvä base-väri */
  background: radial-gradient(circle at top right, #2a2a2d 0%, var(--c-base) 40%);
  background-color: var(--c-base);
  background-attachment: fixed;
}

h1, h2, h3, h4, h5, h6 {
  font-weight: 400;
  letter-spacing: 0.05em;
  margin: 0;
}
EOF

# ==========================================
# 3. Card-komponentin CSS
# ==========================================
echo "Luodaan src/commons/components/Card.css..."
cat << 'EOF' > src/commons/components/Card.css
.corbe-card {
  position: relative;
  background-color: var(--c-card);
  border-radius: var(--radius-sharp);
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

/* Kromikiilto: 1 pikselin viiva joka katoaa */
.corbe-card::before {
  content: "";
  position: absolute;
  inset: -1px;
  border-radius: calc(var(--radius-sharp) + 1px);
  background: linear-gradient(135deg, var(--c-copper) 0%, rgba(34, 31, 32, 0) 40%);
  z-index: -1;
}
EOF

# ==========================================
# 4. Card-komponentti (React / TSX)
# ==========================================
echo "Luodaan src/commons/components/Card.tsx..."
cat << 'EOF' > src/commons/components/Card.tsx
import React from 'react';
import './Card.css';

interface CardProps {
  children: React.ReactNode;
}

export const Card = ({ children }: CardProps) => {
  return (
    <div className="corbe-card">
      {children}
    </div>
  );
};
EOF

# ==========================================
# 5. App.tsx (Pääkäyttöliittymä)
# ==========================================
echo "Päivitetään src/App.tsx..."
cat << 'EOF' > src/App.tsx
import React from 'react';
import './commons/css/global.css';
import { Card } from './commons/components/Card';

export default function App() {
  return (
    <div style={{ padding: '3rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Corbè Logo */}
      <div style={{ 
        display: 'inline-block',
        border: '1px solid var(--c-text-muted)', 
        padding: '0.5rem 1.2rem',
        marginBottom: '4rem',
        fontSize: '1.4rem',
        letterSpacing: '0.1em'
      }}>
        Corbè
      </div>

      {/* Grid-asettelu Eteisen korteille */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '2rem'
      }}>
        
        {/* Testikortti */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Valmet Oyj</h3>
            <span style={{ color: 'var(--c-green)', fontSize: '0.9rem' }}>+3.76%</span>
          </div>
          <p style={{ color: 'var(--c-text-muted)', margin: '0 0 1.5rem 0', fontSize: '0.9rem' }}>
            Toimiala: Teollisuus<br/>
            2v trendi erinomainen. Odottaa eteisessä.
          </p>
          
          {/* Oma nappi */}
          <button style={{
            background: 'var(--c-copper)',
            color: 'white',
            border: 'none',
            padding: '0.6rem 1rem',
            borderRadius: 'var(--radius-sharp)',
            cursor: 'pointer',
            width: '100%',
            fontFamily: 'inherit',
            fontSize: '0.9rem',
            letterSpacing: '0.05em'
          }}>
            Hyväksy seurantaan
          </button>
        </Card>

      </div>
    </div>
  );
}
EOF

# ==========================================
# 6. main.tsx (Reactin kiinnitys)
# ==========================================
echo "Päivitetään src/main.tsx..."
cat << 'EOF' > src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF

echo "=========================================="
echo "Valmis! Corbè on pystytetty onnistuneesti."
echo "Mene kansioon: cd $PROJECT_NAME"
echo "Käynnistä kehityspalvelin: npm run dev"
echo "=========================================="