import { InputHTMLAttributes } from "react";

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  helperText?: string;
  labelRight?: React.ReactNode;
};

export default function AuthInput({
  label,
  helperText,
  labelRight,
  className,
  ...props
}: AuthInputProps) {
  return (
    <div>
      <div className={`flex items-center ${labelRight ? "justify-between" : ""} mb-1.5`}>
        <label className="block text-xs font-medium text-text-secondary tracking-wide">
          {label}
        </label>
        {labelRight}
      </div>
      <input
        className={`w-full px-4 py-3 rounded-[8px] border border-border-light bg-bg-primary text-text-primary text-sm outline-none transition-all duration-300 focus:border-accent-warm focus:shadow-[0_0_0_3px_rgba(196,113,59,.12)] placeholder:text-text-muted ${className ?? ""}`}
        {...props}
      />
      {helperText && (
        <p className="text-xs text-text-muted mt-1.5">{helperText}</p>
      )}
    </div>
  );
}
