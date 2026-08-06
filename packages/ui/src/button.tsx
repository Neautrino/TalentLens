"use client";

import { ReactNode } from "react";

export interface ButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = ({
  children,
  className = "",
  onClick,
  variant = "primary",
  size = "md",
}: ButtonProps) => {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 cursor-pointer";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base",
  };

  const variantStyles = {
    primary:
      "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/25 focus:ring-indigo-500",
    secondary:
      "bg-slate-800 hover:bg-slate-900 text-white focus:ring-slate-700 shadow-md",
    outline:
      "border border-slate-700 hover:border-slate-500 bg-transparent hover:bg-slate-800/50 text-slate-200 focus:ring-slate-400",
    ghost:
      "bg-transparent hover:bg-slate-800/40 text-slate-300 hover:text-white focus:ring-slate-500",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
