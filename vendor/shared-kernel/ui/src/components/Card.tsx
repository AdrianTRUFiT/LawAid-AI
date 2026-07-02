import React from "react";

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  elevated?: boolean;
};

export function Card({ title, description, action, elevated = false, children, className = "", ...props }: CardProps) {
  return (
    <section className={`template-card ${elevated ? "elevated" : ""} ${className}`.trim()} {...props}>
      {(title || description || action) && (
        <div className="template-card-header">
          <div>
            {title && <h2 className="template-card-title">{title}</h2>}
            {description && <p className="template-card-description">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}