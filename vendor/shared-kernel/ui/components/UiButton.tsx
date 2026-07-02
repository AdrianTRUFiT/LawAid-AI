import React from "react";

export type UiButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
};

export function UiButton({
  variant = "primary",
  className = "",
  children,
  ...props
}: UiButtonProps) {
  return (
    <button className={`ui-button ${className}`.trim()} data-variant={variant} {...props}>
      {children}
    </button>
  );
}
