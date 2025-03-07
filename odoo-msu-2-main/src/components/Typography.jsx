import React from 'react';

export const Heading1 = ({ children, className = '', ...props }) => (
  <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-text-primary tracking-tight leading-tight mb-4 ${className}`} {...props}>
    {children}
  </h1>
);

export const Heading2 = ({ children, className = '', ...props }) => (
  <h2 className={`text-3xl md:text-4xl font-bold font-heading text-text-primary tracking-tight leading-tight mb-4 ${className}`} {...props}>
    {children}
  </h2>
);

export const Heading3 = ({ children, className = '', ...props }) => (
  <h3 className={`text-2xl md:text-3xl font-bold font-heading text-text-primary tracking-tight leading-tight mb-3 ${className}`} {...props}>
    {children}
  </h3>
);

export const Heading4 = ({ children, className = '', ...props }) => (
  <h4 className={`text-xl md:text-2xl font-semibold font-heading text-text-primary tracking-tight leading-tight mb-3 ${className}`} {...props}>
    {children}
  </h4>
);

export const Heading5 = ({ children, className = '', ...props }) => (
  <h5 className={`text-lg font-semibold font-heading text-text-primary tracking-tight leading-tight mb-2 ${className}`} {...props}>
    {children}
  </h5>
);

export const Heading6 = ({ children, className = '', ...props }) => (
  <h6 className={`text-base font-semibold font-heading text-text-primary tracking-tight leading-tight mb-2 ${className}`} {...props}>
    {children}
  </h6>
);

export const Paragraph = ({ children, className = '', large = false, small = false, ...props }) => {
  let sizeClass = 'text-base';
  if (large) sizeClass = 'text-lg';
  if (small) sizeClass = 'text-sm';
  
  return (
    <p className={`${sizeClass} text-text-secondary leading-relaxed mb-4 ${className}`} {...props}>
      {children}
    </p>
  );
};

export const Lead = ({ children, className = '', ...props }) => (
  <p className={`text-lg md:text-xl text-text-secondary leading-relaxed mb-6 ${className}`} {...props}>
    {children}
  </p>
);

export const Caption = ({ children, className = '', ...props }) => (
  <p className={`text-sm text-text-tertiary leading-normal ${className}`} {...props}>
    {children}
  </p>
);

export const Label = ({ children, className = '', ...props }) => (
  <span className={`text-sm font-medium text-text-tertiary ${className}`} {...props}>
    {children}
  </span>
);

export const MonoText = ({ children, className = '', ...props }) => (
  <code className={`font-mono text-sm bg-background-tertiary px-1.5 py-0.5 rounded text-text-primary ${className}`} {...props}>
    {children}
  </code>
);

export const GradientText = ({ children, className = '', gradient = "from-accent-primary to-accent-secondary", ...props }) => (
  <span 
    className={`bg-clip-text text-transparent bg-gradient-to-r ${gradient} ${className}`} 
    {...props}
  >
    {children}
  </span>
);

export const Typography = {
  h1: Heading1,
  h2: Heading2,
  h3: Heading3,
  h4: Heading4,
  h5: Heading5,
  h6: Heading6,
  p: Paragraph,
  lead: Lead,
  caption: Caption,
  label: Label,
  mono: MonoText,
  gradient: GradientText,
};

export default Typography; 