import { ReactNode } from "react";

export interface CardProps {
  title: string;
  description?: string;
  children?: ReactNode;
  icon?: ReactNode;
  className?: string;
  badge?: ReactNode;
}

export function Card({
  title,
  description,
  children,
  icon,
  className = "",
  badge,
}: CardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 p-6 transition-all duration-300 hover:border-slate-300 hover:shadow-md shadow-xs ${className}`}
    >
      <div className="flex items-start justify-between mb-3">
        {icon && (
          <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200/60 text-indigo-600">
            {icon}
          </div>
        )}
        {badge && <div>{badge}</div>}
      </div>

      <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
      {description && (
        <p className="text-slate-500 text-sm leading-relaxed mb-4">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}
