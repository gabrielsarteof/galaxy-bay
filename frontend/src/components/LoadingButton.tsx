'use client';
import { FC, ReactNode, ButtonHTMLAttributes } from 'react';

export interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: ReactNode;
}

export const LoadingButton: FC<LoadingButtonProps> = ({
  loading = false,
  disabled,
  children,
  ...buttonProps
}) => (
  <button
    {...buttonProps}
    disabled={loading || disabled}
    className={[
      'w-full py-2 bg-btn-primary text-btn-primary rounded transition-theme disabled:opacity-50 hover:bg-btn-primary-hover',
      loading ? 'cursor-wait' : '',
      buttonProps.className,
    ].join(' ')}
  >
    {loading ? 'Carregando...' : children}
  </button>
);
