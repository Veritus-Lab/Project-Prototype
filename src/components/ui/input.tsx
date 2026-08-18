import { forwardRef, type InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = "", id, label, ...props },
  ref,
) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-muted" htmlFor={id}>
      {label ? <span>{label}</span> : null}
      <input
        ref={ref}
        className={`min-h-11 w-full rounded-lg border border-border bg-surface px-4 text-white placeholder:text-subtle focus:border-brand focus:outline-none ${className}`}
        id={id}
        {...props}
      />
    </label>
  );
});
