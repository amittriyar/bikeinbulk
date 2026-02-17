'use client';

import * as React from 'react';

type ButtonVariant = 'default' | 'outline' | 'ghost';

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: ButtonVariant;
  disabled?: boolean;
};

export function Button({
  children,
  onClick,
  className,
  variant = 'default',
  disabled,
}: ButtonProps) {
  const base =
    'px-4 py-2 rounded-md text-sm font-medium transition';

  const variants: Record<ButtonVariant, string> = {
    default:
      'bg-indigo-600 text-white hover:bg-indigo-700',
    outline:
      'border border-gray-300 text-gray-700 hover:bg-gray-100',
    ghost:
      'text-gray-700 hover:bg-gray-100',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className ?? ''}`}
    >
      {children}
    </button>
  );
}