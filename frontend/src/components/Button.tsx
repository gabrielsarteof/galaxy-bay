import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'gradient' | 'outline' | 'ghost';
  loading?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = 'gradient',
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'py-3.5 font-semibold rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg';

  const variantStyles = {
    gradient: 'bg-gradient-to-r from-[#FFB86A] via-[#E839C6] via-[#9B33F8] to-[#3D54FF] hover:opacity-90 text-white',
    outline: 'border-2 border-gray-300 hover:border-gray-400 text-gray-900 bg-white hover:bg-gray-50',
    ghost: 'text-gray-900 hover:bg-gray-100'
  };

  const widthStyles = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${widthStyles} ${className}`}
      style={variant === 'gradient' ? { backgroundImage: 'linear-gradient(100deg, #FFB86A 0%, #E839C6 33%, #9B33F8 66%, #3D54FF 100%)' } : undefined}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin h-5 w-5 mx-auto"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      ) : (
        children
      )}
    </button>
  );
}
