// src/ui/Modal.tsx
import React, { useEffect } from 'react';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal = ({ isOpen, title, onClose, children }: ModalProps) => {
  
  // Estää taustasivun vierittämisen, kun modaali on auki
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Siivous: palauttaa rullauksen, jos komponentti poistuu yllättäen
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="corbe-modal-overlay">
      <div className="corbe-modal-content">
        
        {/* Yläpalkki ja sulkemisnappi */}
        <div className="corbe-modal-header">
          <h2 className="font-display" style={{ margin: 0, fontSize: '1.2rem', letterSpacing: 'var(--ls-wide)' }}>
            {title}
          </h2>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--c-text-muted)',
              cursor: 'pointer',
              fontSize: '1.8rem',
              lineHeight: 0.8,
              padding: '0 0.5rem'
            }}
          >
            &times;
          </button>
        </div>

        {/* Varsinainen sisältö */}
        <div className="corbe-modal-body">
          {children}
        </div>
        
      </div>
    </div>
  );
};