import { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  helper?: string;
  error?: string;
};

export function Input({ label, helper, error, id, className = "", ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-neutral-900 mb-1.5">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3 py-2 border rounded-md text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent disabled:opacity-50 ${
          error ? "border-red-200 bg-red-50" : "border-neutral-200"
        } ${className}`}
        {...props}
      />
      {(helper || error) && (
        <p className={`text-xs mt-1.5 ${error ? "text-red-600" : "text-neutral-500"}`}>
          {error ?? helper}
        </p>
      )}
    </div>
  );
}
