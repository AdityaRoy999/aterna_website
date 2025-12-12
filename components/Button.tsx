import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  label: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  label, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "font-ui font-semibold text-sm tracking-wide px-6 py-3 rounded-lg transition-all duration-300 transform active:scale-95 hover:-translate-y-0.5";
  
  const variants = {
    primary: "bg-luxury text-void hover:bg-muted hover:text-white shadow-[0_0_20px_rgba(232,207,160,0.2)] hover:shadow-[0_10px_30px_rgba(232,207,160,0.3)]",
    secondary: "bg-white/10 text-white hover:bg-white/20 backdrop-blur-md border border-white/5 hover:border-white/20",
    outline: "border border-luxury text-luxury hover:bg-luxury hover:text-void shadow-none hover:shadow-[0_0_20px_rgba(232,207,160,0.4)]",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      data-hover="true"
      {...props}
    >
      {label}
    </button>
  );
};