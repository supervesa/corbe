// src/widgets/TopNavigation/index.tsx
import React, { useState } from 'react';
import './TopNavigation.css';

// 1. Määritellään 3-polvisen valikon tietorakenne
type MenuItem = {
  label: string;
  href?: string;
  children?: MenuItem[];
};

const menuData: MenuItem[] = [
  {
    label: 'Portfolios',
    children: [
      { label: 'Active', href: '#' },
      { label: 'Archived', href: '#' }
    ]
  },
  {
    label: 'Analytics',
    href: '#'
  },
  {
    label: 'Staging Area',
    children: [
      { label: 'Pending Discoveries', href: '#' },
      { 
        label: 'Archive', 
        children: [
          { label: 'Approved', href: '#' },
          { label: 'Rejected', href: '#' }
        ]
      }
    ]
  }
];

export const TopNavigation = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedMobileNodes, setExpandedMobileNodes] = useState<string[]>([]);

  // Apufunktio mobiilivalikon haitarille
  const toggleMobileNode = (label: string) => {
    setExpandedMobileNodes(prev => 
      prev.includes(label) ? prev.filter(n => n !== label) : [...prev, label]
    );
  };

  return (
    <>
      {/* HEADER (Z-index 100, pysyy aina ylimpänä) */}
      <header className="corbe-header">
        <div className="corbe-logo-box">Corbè</div>

        {/* DESKTOP NAVIGAATIO */}
        <nav className="corbe-desktop-nav">
          {menuData.map(item => (
            <div key={item.label} className={`corbe-nav-item ${item.label === 'Staging Area' ? 'active' : ''}`}>
              {item.label}
              
              {/* Polvi 2 (Dropdown) */}
              {item.children && (
                <div className="corbe-dropdown">
                  {item.children.map(subItem => (
                    <div key={subItem.label} className="corbe-dropdown-item">
                      {subItem.label}
                      {subItem.children && <span>▸</span>}

                      {/* Polvi 3 (Sivu-dropdown) */}
                      {subItem.children && (
                        <div className="corbe-sub-dropdown">
                          {subItem.children.map(subSubItem => (
                            <div key={subSubItem.label} className="corbe-dropdown-item">
                              {subSubItem.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* HAMBURGER IKONI (Näkyy vain mobiilissa) */}
        <button 
          className="corbe-hamburger" 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? (
            /* Tyylikäs ohut Ruksi (X) SVG */
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            /* Tyylikäs ohut 3-viivainen hampurilainen SVG */
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          )}
        </button>
      </header>

      {/* MOBIILIVALIKKO (Takeover Overlay, Z-index 90) */}
      <div className={`corbe-mobile-takeover ${isMobileOpen ? 'open' : ''}`}>
        {menuData.map(item => (
          <div key={item.label}>
            <div 
              className="corbe-mobile-item"
              onClick={() => item.children && toggleMobileNode(item.label)}
              style={{ color: item.label === 'Staging Area' ? 'var(--c-accent)' : 'var(--c-text)' }}
            >
              {item.label} {item.children && <span style={{ fontSize: '1rem', float: 'right' }}>{expandedMobileNodes.includes(item.label) ? '−' : '+'}</span>}
            </div>

            {/* Polvi 2 (Mobiilihaitari) */}
            {item.children && expandedMobileNodes.includes(item.label) && (
              <div className="corbe-mobile-sub">
                {item.children.map(subItem => (
                  <div key={subItem.label}>
                    <div 
                      className="corbe-mobile-sub-item"
                      onClick={() => subItem.children && toggleMobileNode(subItem.label)}
                    >
                      {subItem.label} {subItem.children && <span style={{ float: 'right' }}>{expandedMobileNodes.includes(subItem.label) ? '−' : '+'}</span>}
                    </div>

                    {/* Polvi 3 (Mobiilihaitari) */}
                    {subItem.children && expandedMobileNodes.includes(subItem.label) && (
                      <div className="corbe-mobile-sub" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                        {subItem.children.map(subSubItem => (
                          <div key={subSubItem.label} className="corbe-mobile-sub-item" style={{ fontSize: '0.95rem' }}>
                            {subSubItem.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};