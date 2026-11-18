
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

function Input({
  label,
  error,
  id,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-medium text-text-main"
        >
          {label}
        </label>
      )}

      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error && id ? `${id}-error` : undefined}
        className={`
          w-full rounded-control
          border bg-surface px-3 py-2.5
          text-sm text-text-main
          placeholder:text-text-light
          outline-none transition
          focus:border-primary focus:ring-2 focus:ring-primary/10
          disabled:cursor-not-allowed disabled:bg-surface-muted
          ${error ? "border-danger" : "border-border"}
          ${className}
        `}
        {...props}
      />

      {error && (
        <p
          id={id ? `${id}-error` : undefined}
          className="mt-1 text-xs text-danger"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;
