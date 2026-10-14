import React, { InputHTMLAttributes } from 'react';
import './FormUI.css';

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Checkbox = ({ label, ...props }: CheckboxProps) => {
  return (
    <label className="corbe-checkbox-wrapper">
      <input type="checkbox" className="corbe-checkbox" {...props} />
      <span className="corbe-checkbox-label">{label}</span>
    </label>
  );
};