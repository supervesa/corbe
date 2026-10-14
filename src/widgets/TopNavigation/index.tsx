// src/widgets/TopNavigation/index.tsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './TopNavigation.css';

type MenuItem = {
  label: string;
  path?: string;
  children?: MenuItem[];
};

const menuData: MenuItem[] = [
  {
    label: 'Portfolios',
    children: [
      { label: 'Active', path: '/portfolios/active' },
      { label: 'Archived', path: '/portfolios/archived' }
    ]
  },
  {
    label: 'Analytics',
    path: '/analytics'
  },
  {
    label: 'Staging Area',
    children: [
      { label: 'Pending Discoveries', path: '/staging' },
      { 
        label: 'Archive', 
        children: [
          { label: 'Approved', path: '/staging/approved' },
          { label: 'Rejected', path: '/staging/rejected' }
        ]
      }
    ]
  }
];

export const TopNavigation = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedMobileNodes, setExpandedMobileNodes] = useState<string[]>([]);
  
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMobileNode = (label: string) => {
    setExpandedMobileNodes(prev => 
      prev.includes(label) ? prev.filter(n => n !== label) : [...prev, label]
    );
  };

  const handleNavigate = (path?: string) => {
    if (path) {
      navigate(path);
      setIsMobileOpen(false);
    }
  };

  const isActive = (item: MenuItem): boolean => {
    if (item.path && location.pathname.includes(item.path)) return true;
    if (item.children) {
      return item.children.some(child => isActive(child));
    }
    return false;
  };

  return (
    <>
      <header className="corbe-header">
        <div className="corbe-logo-box" onClick={() => handleNavigate('/')}>
          Corbè
        </div>

        {/* DESKTOP NAVIGAATIO */}
        <nav className="corbe-desktop-nav">
          {menuData.map(item => (
            <div key={item.label} className={`corbe-nav-item ${isActive(item) ? 'active' : ''}`}>
              <span onClick={() => handleNavigate(item.path)}>{item.label}</span>
              
              {/* Polvi 2 (Dropdown) */}
              {item.children && (
                <div className="corbe-dropdown">
                  {item.children.map(subItem => (
                    <div key={subItem.label} className="corbe-dropdown-item" onClick={(e) => { e.stopPropagation(); handleNavigate(subItem.path); }}>
                      
                      {/* Rivin teksti ja alaspäin osoittava nuoli */}
                      <div className="corbe-dropdown-item-label">
                        {subItem.label}
                        {subItem.children && <span style={{ fontSize: '0.8rem' }}>▾</span>}
                      </div>

                      {/* Polvi 3 (Aukeaa suoraan alapuolelle sisennettynä) */}
                      {subItem.children && (
                        <div className="corbe-sub-dropdown">
                          {subItem.children.map(subSubItem => (
                            <div 
                              key={subSubItem.label} 
                              className="corbe-sub-dropdown-item" 
                              onClick={(e) => { e.stopPropagation(); handleNavigate(subSubItem.path); }}
                            >
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

        {/* HAMBURGER IKONI */}
        <button className="corbe-hamburger" onClick={() => setIsMobileOpen(!isMobileOpen)}>
          {isMobileOpen ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          )}
        </button>
      </header>

      {/* MOBIILIVALIKKO */}
      <div className={`corbe-mobile-takeover ${isMobileOpen ? 'open' : ''}`}>
        {menuData.map(item => (
          <div key={item.label}>
            <div 
              className="corbe-mobile-item"
              onClick={() => item.children ? toggleMobileNode(item.label) : handleNavigate(item.path)}
              style={{ color: isActive(item) ? 'var(--c-accent)' : 'var(--c-text)' }}
            >
              {item.label} {item.children && <span style={{ fontSize: '1rem', float: 'right' }}>{expandedMobileNodes.includes(item.label) ? '−' : '+'}</span>}
            </div>

            {item.children && expandedMobileNodes.includes(item.label) && (
              <div className="corbe-mobile-sub">
                {item.children.map(subItem => (
                  <div key={subItem.label}>
                    <div 
                      className="corbe-mobile-sub-item"
                      onClick={() => subItem.children ? toggleMobileNode(subItem.label) : handleNavigate(subItem.path)}
                      style={{ color: isActive(subItem) ? 'var(--c-text)' : 'var(--c-text-muted)' }}
                    >
                      {subItem.label} {subItem.children && <span style={{ float: 'right' }}>{expandedMobileNodes.includes(subItem.label) ? '−' : '+'}</span>}
                    </div>

                    {subItem.children && expandedMobileNodes.includes(subItem.label) && (
                      <div className="corbe-mobile-sub" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                        {subItem.children.map(subSubItem => (
                          <div 
                            key={subSubItem.label} 
                            className="corbe-mobile-sub-item" 
                            style={{ fontSize: '0.95rem', color: isActive(subSubItem) ? 'var(--c-text)' : 'var(--c-text-muted)' }}
                            onClick={() => handleNavigate(subSubItem.path)}
                          >
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