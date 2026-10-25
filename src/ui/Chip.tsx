// src/ui/Chip.tsx
import React from 'react';
import './FormUI.css';

interface ChipProps {
  label: string;
  onClick: () => void;
}

export const Chip = ({ label, onClick }: ChipProps) => {
  return (
    <button type="button" className="corbe-chip" onClick={onClick}>
      {label}
    </button>
  );
};