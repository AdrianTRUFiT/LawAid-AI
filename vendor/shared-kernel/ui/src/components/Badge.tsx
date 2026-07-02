import React from "react";

export type BadgeTone = "verified" | "pending" | "review" | "refused";

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

export function Badge({ tone = "verified", children, className = "", ...props }: BadgeProps) {
  return (
    <span className={`template-badge ${tone} ${className}`.trim()} {...props}>
      {children}
    </span>
  );
}