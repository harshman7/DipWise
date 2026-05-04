import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
}

export default function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:pointer-events-none disabled:opacity-50",
        {
          "bg-brand-600 text-white hover:bg-brand-700 shadow-sm":
            variant === "primary",
          "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50":
            variant === "secondary",
          "text-gray-600 hover:bg-gray-100 hover:text-gray-900":
            variant === "ghost",
        },
        {
          "h-8 px-3 text-sm": size === "sm",
          "h-10 px-4 text-sm": size === "md",
        },
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
