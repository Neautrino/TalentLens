import { ReactNode } from "react";

export interface CardProps {
  title: string;
  description?: string;
  children?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function Card({
  title,
  description,
  children,
  icon,
  className = "",
}: CardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-6 transition-all duration-300 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 ${className}`}
    >
      {icon && (
        <div className="mb-4 inline-flex p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-slate-400 text-sm leading-relaxed mb-4">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}
