"use client";

import { ButtonHTMLAttributes } from "react";

interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline";
}

export default function GlowButton({
  children,
  variant = "primary",
  className = "",
  ...props
}: GlowButtonProps) {
  const base =
    variant === "primary"
      ? "bg-primary text-white glow-button"
      : "border border-primary/20 hover:bg-primary/10";

  return (
    <button
      className={`px-6 py-3 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 ${base} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
