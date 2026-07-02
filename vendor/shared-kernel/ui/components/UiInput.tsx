import React from "react";

export type UiInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function UiInput({ label, id, className = "", ...props }: UiInputProps) {
  const inputId = id ?? props.name ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <label className="ui-field" htmlFor={inputId}>
      {label && <span className="ui-label">{label}</span>}
      <input id={inputId} className={`ui-input ${className}`.trim()} {...props} />
    </label>
  );
}
