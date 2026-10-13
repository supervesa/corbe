// src/ui/FlexTable/index.tsx
import React from 'react';
import './FlexTable.css';

// Sarakkeen konfiguraatio
export interface ColumnDef<T> {
  header: string;                  // Mitä lukee otsikossa (esim. "Price")
  flex?: number;                   // Kuinka paljon tilaa sarake ottaa (esim. 1 tai 2)
  align?: 'left' | 'center' | 'right';
  hideOnMobile?: boolean;          // Piilotetaanko mobiilissa kokonaan?
  render: (item: T) => React.ReactNode; // Funktio, joka palauttaa solun sisällön
}

interface FlexTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T) => string; // Esim. item => item.id
}

export function FlexTable<T>({ data, columns, keyExtractor }: FlexTableProps<T>) {
  return (
    <div className="corbe-ftable">
      
      {/* 1. Yläotsikot (Desktop) */}
      <div className="corbe-ftable-header">
        {columns.map((col, idx) => (
          <div 
            key={idx} 
            className="corbe-ftable-header-cell"
            style={{ 
              flex: col.flex || 1, 
              textAlign: col.align || 'left',
              display: col.hideOnMobile ? 'none' : 'block' // Voi piilottaa tarvittaessa
            }}
          >
            {col.header}
          </div>
        ))}
      </div>

      {/* 2. Datarivit */}
      {data.map((item) => (
        <div className="corbe-ftable-row" key={keyExtractor(item)}>
          
          {columns.map((col, idx) => (
            <div 
              key={idx} 
              className={`corbe-ftable-cell ${col.hideOnMobile ? 'hide-on-mobile' : ''}`}
              style={{ 
                flex: col.flex || 1, 
                textAlign: col.align || 'left' 
              }}
            >
              {/* Mobiililabel näkyy vain puhelimella (jos sarakkeella on nimi) */}
              {col.header && (
                <span className="corbe-ftable-mobile-label">
                  {col.header}
                </span>
              )}
              
              {/* Solun varsinainen sisältö (esim. osakkeen hinta tai Tag) */}
              <div style={{ width: col.align === 'right' ? '100%' : 'auto', display: 'flex', justifyContent: col.align === 'right' ? 'flex-end' : 'flex-start' }}>
                {col.render(item)}
              </div>
            </div>
          ))}

        </div>
      ))}
      
    </div>
  );
}