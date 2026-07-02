import React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ label, id, ...props }: InputProps) {
  const inputId = id ?? props.name ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <label className="template-field" htmlFor={inputId}>
      {label && <span className="template-label">{label}</span>}
      <input id={inputId} className="template-input" {...props} />
    </label>
  );
}