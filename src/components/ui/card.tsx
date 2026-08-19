import type { HTMLAttributes } from "react";

export interface CardProps extends HTMLAttributes<HTMLElement> {
  elevated?: boolean;
}

export function Card({ className = "", elevated = false, ...props }: CardProps) {
  return (
    <article
      className={`card${elevated ? " card-elevated" : ""} ${className}`.trim()}
      {...props}
    />
  );
}
