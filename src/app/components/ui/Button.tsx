import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  className = '',
  disabled = false,
  ...props
}) => {
  const baseStyles =
    'px-4 py-2 rounded-2xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary-hover focus:ring-primary',
    secondary:
      'bg-bg-surface text-text-main hover:bg-bg-elevated focus:ring-outline',
  };

  const disabledStyles = 'opacity-50 cursor-not-allowed hover:brightness-100';

  const combinedClassName = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${disabled ? disabledStyles : ''}
    ${className}
  `.trim();

  return (
    <button className={combinedClassName} disabled={disabled} {...props}>
      {children}
    </button>
  );
};
