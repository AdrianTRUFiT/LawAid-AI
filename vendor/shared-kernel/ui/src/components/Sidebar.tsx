import React from "react";

export type SidebarItem = {
  label: string;
  active?: boolean;
};

export type SidebarProps = {
  title: string;
  subtitle?: string;
  logoMark?: string;
  items: SidebarItem[];
};

export function Sidebar({ title, subtitle = "Template system", logoMark, items }: SidebarProps) {
  return (
    <aside className="app-sidebar">
      <div className="app-sidebar-brand">
        <div className="app-logo">{logoMark ?? "⚖"}</div>
        <div>
          <p className="app-brand-title">{title}</p>
          <p className="app-brand-subtitle">{subtitle}</p>
        </div>
      </div>

      <nav className="app-sidebar-nav">
        {items.map((item) => (
          <button key={item.label} type="button" className="app-sidebar-item" data-active={item.active ? "true" : "false"}>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}