import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-semibold text-sand-700">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={[
            'w-full px-4 py-3 rounded-xl text-sand-900 font-sans text-sm',
            'bg-white border border-sand-200',
            'placeholder:text-sand-400',
            'transition-all duration-150',
            'focus:outline-none focus:border-earth-400 focus:ring-2 focus:ring-earth-500/20',
            error ? 'border-red-400 focus:border-red-400 focus:ring-red-500/20' : '',
            className,
          ].join(' ')}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-sand-500">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-red-600 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

// Textarea variant
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Textarea({ label, hint, error, className = '', id, ...props }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-sand-700">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={[
          'w-full px-4 py-3 rounded-xl text-sand-900 font-sans text-sm',
          'bg-white border border-sand-200 resize-none',
          'placeholder:text-sand-400',
          'transition-all duration-150',
          'focus:outline-none focus:border-earth-400 focus:ring-2 focus:ring-earth-500/20',
          error ? 'border-red-400' : '',
          className,
        ].join(' ')}
        {...props}
      />
      {hint && !error && <p className="text-xs text-sand-500">{hint}</p>}
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}
