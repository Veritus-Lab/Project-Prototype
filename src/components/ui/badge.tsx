import type { HTMLAttributes } from "react";

export function Badge({ className = "", ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-brand/25 bg-brand/10 px-3 py-1 text-xs font-extrabold uppercase text-brand ${className}`}
      {...props}
    />
  );
}
