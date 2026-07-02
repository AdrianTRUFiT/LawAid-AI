import React, { useState } from "react";
import { Button } from "./Button";
import { Sidebar, SidebarItem } from "./Sidebar";

export type AppShellProps = {
  title: string;
  subtitle?: string;
  sidebarTitle: string;
  sidebarSubtitle?: string;
  sidebarLogoMark?: string;
  sidebarItems: SidebarItem[];
  action?: React.ReactNode;
  children: React.ReactNode;
};

export function AppShell({
  title,
  subtitle,
  sidebarTitle,
  sidebarSubtitle,
  sidebarLogoMark,
  sidebarItems,
  action,
  children
}: AppShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-shell" data-menu-open={menuOpen ? "true" : "false"}>
      <Sidebar title={sidebarTitle} subtitle={sidebarSubtitle} logoMark={sidebarLogoMark} items={sidebarItems} />

      <main className="app-main">
        <header className="app-bar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Button variant="secondary" className="mobile-menu-button" onClick={() => setMenuOpen((value) => !value)}>
              ☰
            </Button>
            <div>
              <p className="app-bar-title">{title}</p>
              {subtitle && <p className="app-bar-subtitle">{subtitle}</p>}
            </div>
          </div>
          {action}
        </header>

        <div className="app-content">{children}</div>
      </main>
    </div>
  );
}