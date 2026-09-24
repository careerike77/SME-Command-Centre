import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseClass = "px-4 py-2 rounded-md font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2";
  const variants = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800",
    secondary: "bg-slate-700 text-slate-100 hover:bg-slate-600 active:bg-slate-800",
    outline: "border border-slate-700 text-slate-200 hover:bg-slate-800",
    danger: "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800"
  };

  return React.createElement(
    'button',
    {
      className: `${baseClass} ${variants[variant]} ${className}`,
      ...props
    },
    children
  );
};
