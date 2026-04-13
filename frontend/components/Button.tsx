import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const base = [
    'inline-flex items-center justify-center font-semibold font-sans',
    'transition-all duration-150 ease-out',
    'disabled:opacity-40 disabled:cursor-not-allowed',
    'select-none',
  ].join(' ');

  const variants = {
    primary: [
      'bg-earth-500 text-white',
      'hover:bg-earth-600',
      'active:scale-[0.97]',
      'shadow-[0_1px_2px_rgba(28,17,8,0.15),0_4px_8px_rgba(196,112,74,0.25)]',
      'hover:shadow-[0_2px_4px_rgba(28,17,8,0.15),0_6px_16px_rgba(196,112,74,0.3)]',
    ].join(' '),
    secondary: [
      'bg-white text-sand-800 border border-sand-200',
      'hover:bg-sand-50 hover:border-sand-300',
      'active:scale-[0.97]',
      'shadow-soft',
    ].join(' '),
    ghost: [
      'text-sand-700',
      'hover:bg-sand-100 hover:text-sand-900',
      'active:scale-[0.97]',
    ].join(' '),
    danger: [
      'bg-red-500 text-white',
      'hover:bg-red-600',
      'active:scale-[0.97]',
      'shadow-soft',
    ].join(' '),
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-sm rounded-lg gap-1.5',
    md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
    lg: 'px-7 py-3.5 text-base rounded-xl gap-2.5',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
