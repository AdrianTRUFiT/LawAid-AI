import React, { useState } from "react";
import { UiButton } from "./UiButton";
import { UiSidebar, UiSidebarItem } from "./UiSidebar";

export type UiShellProps = {
  title: string;
  subtitle?: string;
  logoText?: string;
  sidebarTitle?: string;
  sidebarSubtitle?: string;
  sidebarItems: UiSidebarItem[];
  topbarAction?: React.ReactNode;
  children: React.ReactNode;
};

export function UiShell({
  title,
  subtitle,
  logoText = "A",
  sidebarTitle = "AIVA",
  sidebarSubtitle = "Governed workspace",
  sidebarItems,
  topbarAction,
  children
}: UiShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="ui-shell" data-sidebar-open={sidebarOpen ? "true" : "false"}>
      <UiSidebar title={sidebarTitle} subtitle={sidebarSubtitle} items={sidebarItems} />

      <button
        className="ui-sidebar-overlay"
        aria-label="Close menu"
        type="button"
        onClick={() => setSidebarOpen(false)}
      />

      <main className="ui-main">
        <header className="ui-topbar">
          <div className="ui-brand">
            <UiButton
              className="ui-mobile-menu-button"
              variant="ghost"
              aria-label="Open menu"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </UiButton>

            <div className="ui-brand-mark">{logoText}</div>
            <div>
              <h1 className="ui-brand-title">{title}</h1>
              {subtitle && <p className="ui-brand-subtitle">{subtitle}</p>}
            </div>
          </div>

          {topbarAction}
        </header>

        <div className="ui-page">{children}</div>
      </main>
    </div>
  );
}
