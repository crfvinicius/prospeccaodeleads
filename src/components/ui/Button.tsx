import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-indigo-600 text-white hover:bg-indigo-700 disabled:hover:bg-indigo-600",
  secondary:
    "border border-black/10 text-neutral-700 hover:bg-black/5 disabled:hover:bg-transparent dark:border-white/10 dark:text-neutral-200 dark:hover:bg-white/5",
  danger:
    "border border-red-200 text-red-600 hover:bg-red-50 disabled:hover:bg-transparent dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30",
  ghost: "text-indigo-600 hover:underline dark:text-indigo-400",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "px-2.5 py-1 text-xs rounded-md",
  md: "px-4 py-2 text-sm rounded-lg",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...props}
    />
  );
}
