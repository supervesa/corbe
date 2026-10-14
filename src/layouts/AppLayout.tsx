import React from 'react';
import { TopNavigation } from '../widgets/TopNavigation';
import { Sidebar } from '../widgets/Sidebar';
import { Footer } from '../widgets/Footer';

interface AppLayoutProps {
  children: React.ReactNode;
  /** Jos haluat sivukohtaisen sivupalkin. Jos false, sivu käyttää koko leveyden. */
  sidebar?: React.ReactNode | boolean;
  /** Sivupalkin puoli pöytäkoneella (oletuksena oikealla tai vasemmalla) */
  sidebarPosition?: 'left' | 'right';
}

export const AppLayout = ({
  children,
  sidebar = true,
  sidebarPosition = 'right',
}: AppLayoutProps) => {
  const showSidebar = sidebar !== false;
  const sidebarContent = sidebar === true ? <Sidebar /> : sidebar;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '1400px',
        margin: '0 auto',
        // Mukautuva reunaväli: mobiilissa 1rem, desktopissa 2.5rem
        padding: '0 clamp(1rem, 3vw, 2.5rem)',
      }}
    >
      <TopNavigation />

      {/* Keskiosa: taittuu automaattisesti 2 sarakkeesta (desktop) -> 1 sarakkeeseen (mobiili) */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          gap: '3rem',
          marginTop: '2.5rem',
          flex: 1,
        }}
      >
        {showSidebar && sidebarPosition === 'left' && (
          <aside style={{ flex: '1 1 280px', maxWidth: '100%' }}>
            {sidebarContent}
          </aside>
        )}

        {/* Pääsisältö: min(100%, 640px) estää sivuttaisvenymisen mobiilissa */}
        <main
          style={{
            flex: '999 1 0%',
            minWidth: 'min(100%, 640px)',
            maxWidth: '100%',
          }}
        >
          {children}
        </main>

        {showSidebar && sidebarPosition === 'right' && (
          <aside style={{ flex: '1 1 280px', maxWidth: '100%' }}>
            {sidebarContent}
          </aside>
        )}
      </div>

      <Footer />
    </div>
  );
};