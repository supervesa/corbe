import React from 'react';

export const Loader = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
      <div 
        className="font-display" 
        style={{ 
          color: 'var(--c-copper)', 
          letterSpacing: '0.1em', 
          fontSize: '0.9rem',
          animation: 'pulse 1.5s infinite ease-in-out'
        }}
      >
        FETCHING DISCOVERIES...
      </div>
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 0.4; }
            50% { opacity: 1; text-shadow: 0 0 10px rgba(125,75,58,0.5); }
            100% { opacity: 0.4; }
          }
        `}
      </style>
    </div>
  );
};