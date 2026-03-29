import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className = "", id, ...props },
  ref
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-ink2"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={[
          "h-10 w-full rounded-xl border bg-white px-3 text-sm text-ink placeholder:text-ink3",
          "transition-colors duration-150",
          error
            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
            : "border-[#e7e5e4] focus:border-accent focus:ring-2 focus:ring-orange-100",
          "outline-none",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-ink3">{hint}</p>}
    </div>
  );
});
