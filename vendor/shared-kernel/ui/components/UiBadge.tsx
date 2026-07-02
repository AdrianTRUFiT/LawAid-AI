import React from "react";

export type UiBadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "success" | "warning" | "danger";
};

export function UiBadge({
  tone = "neutral",
  className = "",
  children,
  ...props
}: UiBadgeProps) {
  return (
    <span className={`ui-badge ${className}`.trim()} data-tone={tone} {...props}>
      {children}
    </span>
  );
}
