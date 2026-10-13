import React from 'react';
import './DataUI.css';

interface TextProps {
  children: React.ReactNode;
  variant?: 'primary' | 'muted' | 'accent' | 'green';
  size?: 'sm' | 'md' | 'lg';
  as?: 'p' | 'span' | 'div';
  tabular?: boolean;
}

export const Text = ({ children, variant = 'primary', size = 'md', as: Component = 'span', tabular = false }: TextProps) => {
  
  const getColor = () => {
    switch(variant) {
      case 'muted': return 'var(--c-text-muted)';
      case 'accent': return 'var(--c-accent)';
      case 'green': return 'var(--c-green)';
      default: return 'var(--c-text)';
    }
  };

  const getFontSize = () => {
    switch(size) {
      case 'sm': return '0.8rem';
      case 'lg': return '1.1rem';
      default: return '0.95rem';
    }
  };

  return (
    <Component 
      className={tabular ? 'font-numbers' : 'font-ui'}
      style={{ color: getColor(), fontSize: getFontSize(), margin: Component === 'p' ? '0 0 1rem 0' : 0 }}
    >
      {children}
    </Component>
  );
};

interface TagProps {
  label: string;
  variant?: 'default' | 'copper' | 'green' | 'danger';
}

export const Tag = ({ label, variant = 'default' }: TagProps) => {
  return (
    <span className={`corbe-tag corbe-tag--${variant}`}>
      {label}
    </span>
  );
};