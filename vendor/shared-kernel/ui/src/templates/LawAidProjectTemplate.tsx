import React from "react";
import { AppShell } from "../components/AppShell";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { useTemplateTheme } from "../theme/ThemeProvider";

export function LawAidProjectTemplate() {
  const theme = useTemplateTheme();

  const items = [
    { label: "Dashboard", active: true },
    { label: "Projects" },
    { label: "Tasks" },
    { label: "Documents" },
    { label: "Expenses" },
    { label: "Memory" }
  ];

  return (
    <AppShell
      title="LawAidAI"
      subtitle="Project workspace"
      sidebarTitle="LawAidAI"
      sidebarSubtitle="Clean. Focused. Powerful."
      sidebarLogoMark={theme.logoInnerMark || "âš–"}
      sidebarItems={items}
      action={<Badge tone="verified">Verified</Badge>}
    >
      <div className="app-page-heading">
        <div>
          <h1 className="tmpl-h1">Projects</h1>
          <p>Create, review, and organize active legal-workflow projects.</p>
        </div>
        <Button>Create Project</Button>
      </div>

      <div className="metrics-grid">
        <Card elevated>
          <p className="template-card-title">12</p>
          <p className="template-card-description">Active Projects</p>
        </Card>
        <Card elevated>
          <p className="template-card-title">8</p>
          <p className="template-card-description">Tasks Due</p>
        </Card>
        <Card elevated>
          <p className="template-card-title">3</p>
          <p className="template-card-description">Events Today</p>
        </Card>
        <Card elevated>
          <p className="template-card-title">$4,250</p>
          <p className="template-card-description">Expenses</p>
        </Card>
      </div>

      <div className="card-grid">
        <Card title="Button Style Preview" description="Control button width, height, font size, border, hover, pressed, and style mode.">
          <div className="button-style-preview">
            <div className="button-preview-row">
              <span className="button-preview-label">Style 1</span>
              <Button styleMode="solid">Button Style 1</Button>
              <Button styleMode="solid">Hover Style 1</Button>
              <Button styleMode="solid">Pressed Style 1</Button>
            </div>

            <div className="button-preview-row">
              <span className="button-preview-label">Style 2</span>
              <Button styleMode="outline">Button Style 2</Button>
              <Button styleMode="outline">Hover Style 2</Button>
              <Button styleMode="outline">Pressed Style 2</Button>
            </div>

            <div className="button-preview-row">
              <span className="button-preview-label">Style 3</span>
              <Button styleMode="ghost">Button Style 3</Button>
              <Button styleMode="soft">Hover Style 3</Button>
              <Button styleMode="link">Pressed Style 3</Button>
            </div>
          </div>
        </Card>
        <Card title="Typography Preview" description="H1, H2, H3, body, and toggle behavior are controlled by the theme.">
          <div className="form-stack">
            <h1 className="tmpl-h1">H1 Project Dashboard</h1>
            <h2 className="tmpl-h2">H2 Section Header</h2>
            <h3 className="tmpl-h3">H3 Card Label</h3>
            <p className="template-card-description">
              Body text follows its own size, color, spacing, and weight controls.
            </p>
            <button className="template-toggle" data-active="true" type="button" aria-label="Preview toggle">
              <span className="template-toggle-thumb" />
            </button>
          </div>
        </Card>

        <Card
          title="Create project"
          description="A clean project entry surface. The UI reflects state; it does not create truth."
          action={<Badge tone="pending">Draft</Badge>}
        >
          <div className="form-stack">
            <Input label="Project name" placeholder="Parenting Plan Review" />
            <Input label="Project type" placeholder="Family / Injury / General" />
            <Button>Save Project</Button>
          </div>
        </Card>

        <Card title="Recent projects" description="Large touch targets, clear hierarchy, no clutter.">
          <div className="project-list">
            <div className="project-row">
              <div>
                <p className="project-row-title">Parenting Plan Review</p>
                <p className="project-row-meta">Updated 2h ago</p>
              </div>
              <Badge tone="verified">Active</Badge>
            </div>

            <div className="project-row">
              <div>
                <p className="project-row-title">Custody Agreement</p>
                <p className="project-row-meta">Updated 5h ago</p>
              </div>
              <Badge tone="pending">Pending</Badge>
            </div>

            <div className="project-row">
              <div>
                <p className="project-row-title">Injury Case Intake</p>
                <p className="project-row-meta">Updated 1d ago</p>
              </div>
              <Badge tone="review">Review</Badge>
            </div>

            <div className="project-row">
              <div>
                <p className="project-row-title">Unsupported Claim</p>
                <p className="project-row-meta">Held by review boundary</p>
              </div>
              <Badge tone="refused">Held</Badge>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}