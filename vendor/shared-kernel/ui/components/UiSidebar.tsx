import React from "react";

export type UiSidebarItem = {
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
};

export type UiSidebarProps = {
  title?: string;
  subtitle?: string;
  items: UiSidebarItem[];
};

export function UiSidebar({
  title = "AIVA",
  subtitle = "Governed workspace",
  items
}: UiSidebarProps) {
  return (
    <aside className="ui-sidebar" aria-label="Sidebar navigation">
      <div className="ui-sidebar-header">
        <div className="ui-brand-mark">{title.slice(0, 1)}</div>
        <div>
          <h1 className="ui-brand-title">{title}</h1>
          <p className="ui-brand-subtitle">{subtitle}</p>
        </div>
      </div>

      <nav className="ui-sidebar-nav">
        {items.map((item) => (
          <button
            key={item.label}
            className="ui-sidebar-item"
            data-active={item.active ? "true" : "false"}
            onClick={item.onClick}
            type="button"
          >
            {item.icon && <span>{item.icon}</span>}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
