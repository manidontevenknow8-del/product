import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import styles from './Input.module.css';

type BaseFieldProps = {
  label?: string;
  hint?: string;
};

type TextInputProps = BaseFieldProps &
  InputHTMLAttributes<HTMLInputElement> & { as?: 'input' };

type SelectProps = BaseFieldProps &
  SelectHTMLAttributes<HTMLSelectElement> & { as: 'select' };

type TextareaProps = BaseFieldProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & { as: 'textarea' };

type InputProps = TextInputProps | SelectProps | TextareaProps;

export function Input(props: InputProps) {
  const { label, hint, className = '' } = props;

  const renderField = () => {
    if ('as' in props && props.as === 'select') {
      const { as: _, label: __, hint: ___, ...selectProps } = props;
      return (
        <select
          className={`${styles.input} ${styles.select} ${className}`}
          {...selectProps}
        />
      );
    }

    if ('as' in props && props.as === 'textarea') {
      const { as: _, label: __, hint: ___, ...textareaProps } = props;
      return (
        <textarea
          className={`${styles.input} ${styles.textarea} ${className}`}
          {...textareaProps}
        />
      );
    }

    const { as: _, label: __, hint: ___, ...inputProps } = props as TextInputProps;
    return (
      <input
        className={`${styles.input} ${className}`}
        {...inputProps}
      />
    );
  };

  return (
    <div className={styles.wrapper}>
      {label && <label className={styles.label}>{label}</label>}
      {renderField()}
      {hint && <span className={styles.hint}>{hint}</span>}
    </div>
  );
}
