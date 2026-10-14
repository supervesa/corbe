import React, { InputHTMLAttributes } from 'react';
import './FormUI.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = ({ label, ...props }: InputProps) => {
  return (
    <div className="corbe-input-wrapper">
      {label && <label className="corbe-label">{label}</label>}
      <input className="corbe-input" {...props} />
    </div>
  );
};