import { FC, HTMLAttributes } from "react";

interface GlowCardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const GlowCard: FC<GlowCardProps> = ({ children, className = "", ...props }) => (
  <div
    className={`group relative overflow-hidden rounded-2xl border border-gray-800/50 bg-gray-900/50 backdrop-blur-sm transition-all duration-500 hover:border-gray-700/50 hover:bg-gray-900/80 ${className}`}
    {...props}
  >
    {/* Gradient overlay on hover */}
    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-fuchsia-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

    {/* Corner glow effect */}
    <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-violet-500/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
    <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-fuchsia-500/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

    {/* Content */}
    <div className="relative z-10">{children}</div>
  </div>
);
