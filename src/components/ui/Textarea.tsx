import type { TextareaHTMLAttributes } from 'react';
import inputStyles from './Input.module.css';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
};

export function Textarea({ label, hint, className = '', ...props }: TextareaProps) {
  return (
    <div className={inputStyles.wrapper}>
      {label && <label className={inputStyles.label}>{label}</label>}
      <textarea
        className={`${inputStyles.input} ${inputStyles.textarea} ${className}`}
        {...props}
      />
      {hint && <span className={inputStyles.hint}>{hint}</span>}
    </div>
  );
}
