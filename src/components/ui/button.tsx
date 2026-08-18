import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  href?: string;
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-brand !text-ink hover:bg-brand-hover",
  secondary:
    "border-brand bg-transparent text-white hover:bg-brand hover:text-ink",
  ghost: "bg-transparent text-white hover:bg-white/8",
};

export function Button({
  children,
  className = "",
  href,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  const classes = [
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-extrabold transition-[background-color,color,border-color,transform] duration-200 hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50",
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <Link className={classes} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} type={type} {...props}>
      {children}
    </button>
  );
}
