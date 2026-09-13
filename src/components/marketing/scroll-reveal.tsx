"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: string;
}

export function ScrollReveal({ children, className = "", delay }: ScrollRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (reducedMotion?.matches || !("IntersectionObserver" in window)) {
      element.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        element.classList.add("is-visible");
        observer.unobserve(element);
      },
      { rootMargin: "0px 0px -8%", threshold: 0.12 },
    );

    const frame = window.requestAnimationFrame(() => {
      element.classList.add("is-ready");
      observer.observe(element);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  const style = delay ? ({ "--reveal-delay": delay } as CSSProperties) : undefined;

  return (
    <div ref={elementRef} className={`scroll-reveal ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}
