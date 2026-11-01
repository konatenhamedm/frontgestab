import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function formatNumberWithSpaces(val: string | number | undefined | null): string {
  if (val === undefined || val === null || val === '') return '';
  const str = String(val).replace(/\s/g, '');
  if (!str) return '';
  const parts = str.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return parts.join(' ');
}

export function cleanNumberString(val: string): string {
  return val.replace(/\s/g, '').replace(/[^0-9]/g, '');
}

export interface AmountInputProps extends Omit<React.ComponentProps<"input">, "onChange" | "value"> {
  value: string | number | undefined | null;
  onChange?: (value: string) => void;
  currency?: string;
}

export const AmountInput = React.forwardRef<HTMLInputElement, AmountInputProps>(({
  value,
  onChange,
  currency = "FCFA",
  className,
  disabled,
  placeholder = "0",
  ...props
}, ref) => {
  const [displayValue, setDisplayValue] = useState(() => formatNumberWithSpaces(value));

  useEffect(() => {
    setDisplayValue(formatNumberWithSpaces(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = cleanNumberString(e.target.value);
    const formatted = formatNumberWithSpaces(rawVal);
    setDisplayValue(formatted);
    if (onChange) {
      onChange(rawVal);
    }
  };

  return (
    <div className="relative w-full">
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
          "border-slate-200 flex h-10 w-full min-w-0 rounded-lg border bg-white px-3 py-2 text-sm shadow-xs transition-all outline-none",
          "hover:border-primary/40 focus-visible:border-primary focus-visible:ring-primary/10 focus-visible:ring-[3px]",
          "text-right font-mono font-medium text-gray-800",
          currency ? "pr-14" : "pr-3",
          disabled && "pointer-events-none cursor-not-allowed opacity-50 bg-gray-50",
          className
        )}
        {...props}
      />
      {currency && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold pointer-events-none select-none">
          {currency}
        </span>
      )}
    </div>
  );
});

AmountInput.displayName = "AmountInput";
