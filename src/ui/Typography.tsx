import React from 'react';
import './DataUI.css';

interface HeadingProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4;
  variant?: 'primary' | 'muted' | 'accent';
  weight?: 'light' | 'regular';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
}

export const Heading = ({
  children,
  level = 2,
  variant = 'primary',
  weight = 'light',
  spacing = 'md',
}: HeadingProps) => {
  const TagName = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4';

  const sizes = {
    1: '2rem',
    2: '1.5rem',
    3: '1.15rem',
    4: '0.95rem',
  };

  const margins = {
    none: '0',
    sm: '0 0 0.5rem 0',
    md: '0 0 1.25rem 0',
    lg: '0 0 2rem 0',
  };

  const colors = {
    primary: 'var(--c-text)',
    muted: 'var(--c-text-muted)',
    accent: 'var(--c-accent)',
  };

  return (
    <TagName
      className="font-display"
      style={{
        fontSize: sizes[level],
        fontWeight: weight === 'light' ? 'var(--fw-light)' : 'var(--fw-regular)',
        color: colors[variant],
        margin: margins[spacing],
        lineHeight: 1.3,
        letterSpacing: 'var(--ls-wide)',
      }}
    >
      {children}
    </TagName>
  );
};

interface TextProps {
  children: React.ReactNode;
  variant?: 'primary' | 'muted' | 'accent' | 'green';
  size?: 'sm' | 'md' | 'lg';
  weight?: 'light' | 'regular';
  as?: 'p' | 'span' | 'div';
  tabular?: boolean;
  columns?: boolean; // Pikavalinta: jakaa pitkän kappaleen suoraan 2 palstaan desktopissa
}

export const Text = ({
  children,
  variant = 'primary',
  size = 'md',
  weight = 'regular',
  as: Component = 'span',
  tabular = false,
  columns = false,
}: TextProps) => {
  const getColor = () => {
    switch (variant) {
      case 'muted': return 'var(--c-text-muted)';
      case 'accent': return 'var(--c-accent)';
      case 'green': return 'var(--c-green)';
      default: return 'var(--c-text)';
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm': return '0.8rem';
      case 'lg': return '1.1rem';
      default: return '0.95rem';
    }
  };

  const isParagraph = Component === 'p' || columns;

  return (
    <Component
      className={tabular ? 'font-numbers' : 'font-ui'}
      style={{
        color: getColor(),
        fontSize: getFontSize(),
        fontWeight: weight === 'light' ? 'var(--fw-light)' : 'var(--fw-regular)',
        lineHeight: isParagraph ? 1.75 : 1.4,
        margin: isParagraph ? '0 0 1.25rem 0' : 0,
        ...(columns
          ? {
              columns: '2 340px',
              columnGap: '3.5rem',
            }
          : {}),
      }}
    >
      {children}
    </Component>
  );
};

interface ProseProps {
  children: React.ReactNode;
  columns?: 1 | 2;
  rule?: boolean; // Haluttaessa hienovarainen pystyviiva palstojen väliin
}

/**
 * Lehtimäinen leipätekstisäiliö.
 * Desktopissa 2 palstaa selkeällä 3.5rem välillä, mobiilissa taittuu automaattisesti 1 palstaan.
 */
export const Prose = ({ children, columns = 2, rule = false }: ProseProps) => {
  return (
    <div
      className="font-ui"
      style={{
        columns: columns === 2 ? '2 340px' : '1',
        columnGap: '3.5rem',
        columnRule: rule ? '1px solid rgba(255, 255, 255, 0.06)' : 'none',
        lineHeight: 1.75,
        marginBottom: '2.5rem',
      }}
    >
      {children}
    </div>
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