import React from 'react';
import { cn } from '@/lib/utils';

export type InputMode = 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';

export interface FormFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, 'size'> {
  label: string;
  error?: string;
  helperText?: string;
  inputMode?: InputMode;
  as?: 'input' | 'textarea' | 'select';
  options?: Array<{ value: string; label: string }>;
  rows?: number;
}

/**
 * FormField component with mobile optimization
 * 
 * Features:
 * - Minimum 44px touch targets
 * - inputMode prop for keyboard type optimization
 * - Full-width on mobile
 * - Labels positioned above inputs
 * - Touch-friendly spacing
 */
export const FormField = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  FormFieldProps
>(({
  label,
  error,
  helperText,
  inputMode,
  as = 'input',
  options,
  rows = 3,
  className,
  id,
  ...props
}, ref) => {
  const fieldId = id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`;
  
  const baseInputClasses = cn(
    'w-full rounded-md border border-gray-300 bg-white px-4 py-3',
    'text-base leading-6',
    'focus:border-[#ff4a0a] focus:outline-none focus:ring-2 focus:ring-[#ff4a0a] focus:ring-opacity-50',
    'disabled:bg-gray-100 disabled:cursor-not-allowed',
    'transition-colors duration-200',
    // Minimum 44px touch target (py-3 = 12px * 2 + text height ≈ 44px)
    'min-h-[44px]',
    error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
    className
  );

  const renderInput = () => {
    if (as === 'textarea') {
      return (
        <textarea
          ref={ref as React.Ref<HTMLTextAreaElement>}
          id={fieldId}
          rows={rows}
          className={baseInputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${fieldId}-error` : helperText ? `${fieldId}-helper` : undefined}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      );
    }

    if (as === 'select') {
      return (
        <select
          ref={ref as React.Ref<HTMLSelectElement>}
          id={fieldId}
          className={baseInputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${fieldId}-error` : helperText ? `${fieldId}-helper` : undefined}
          {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
        >
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        ref={ref as React.Ref<HTMLInputElement>}
        id={fieldId}
        inputMode={inputMode}
        className={baseInputClasses}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${fieldId}-error` : helperText ? `${fieldId}-helper` : undefined}
        {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
      />
    );
  };

  return (
    <div className="w-full">
      <label
        htmlFor={fieldId}
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        {label}
        {props.required && <span className="ml-1 text-red-500">*</span>}
      </label>
      
      {renderInput()}
      
      {error && (
        <p
          id={`${fieldId}-error`}
          className="mt-2 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p
          id={`${fieldId}-helper`}
          className="mt-2 text-sm text-gray-500"
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';
