import React, { ButtonHTMLAttributes } from 'react';
import './Button.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'copper'; // <-- Lisätty copper
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  style,
  ...props
}: ButtonProps) => {
  // Yhdistetään luokat propsien perusteella
  const combinedClassName = [
    'corbe-btn',
    `corbe-btn--${variant}`,
    `corbe-btn--${size}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={combinedClassName}
      style={{ 
        width: fullWidth ? '100%' : undefined, 
        ...style 
      }}
      {...props}
    >
      {children}
    </button>
  );
};