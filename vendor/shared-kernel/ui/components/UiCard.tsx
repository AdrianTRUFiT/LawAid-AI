import React from "react";

export type UiCardProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "elevated" | "flat";
};

export function UiCard({
  title,
  description,
  action,
  variant = "elevated",
  className = "",
  children,
  ...props
}: UiCardProps) {
  return (
    <section className={`ui-card ${className}`.trim()} data-variant={variant} {...props}>
      {(title || description || action) && (
        <div className="ui-card-header">
          <div>
            {title && <h2 className="ui-card-title">{title}</h2>}
            {description && <p className="ui-card-description">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
