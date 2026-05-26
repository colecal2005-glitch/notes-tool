import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "default" | "large";
};

const base =
  "font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<string, string> = {
  primary: "bg-neutral-900 hover:bg-neutral-800 text-white",
  secondary:
    "bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-200",
  ghost: "text-neutral-600 hover:text-neutral-900",
};

const sizes: Record<string, string> = {
  default: "px-4 py-2 text-sm",
  large: "px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "default",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
