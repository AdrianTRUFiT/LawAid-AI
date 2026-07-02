import React from "react";
import { useTemplateTheme } from "../theme/ThemeProvider";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  styleMode?: "solid" | "outline" | "ghost" | "soft" | "link";
};

export function Button({
  variant = "primary",
  styleMode,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const theme = useTemplateTheme();

  return (
    <button
      className={`template-button ${variant === "secondary" ? "secondary" : ""} ${className}`.trim()}
      data-style-mode={styleMode ?? theme.buttonStyleMode}
      {...props}
    >
      {children}
    </button>
  );
}