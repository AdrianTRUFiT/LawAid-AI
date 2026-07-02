import React from "react";
import { UiBadge } from "../components/UiBadge";
import { UiButton } from "../components/UiButton";
import { UiCard } from "../components/UiCard";
import { UiInput } from "../components/UiInput";
import { UiShell } from "../components/UiShell";
import { UiThemeProvider } from "../components/UiThemeProvider";

export function LawAidStyleDashboardDemo() {
  const sidebarItems = [
    { label: "Projects", active: true },
    { label: "Documents" },
    { label: "Timeline" },
    { label: "Evidence" },
    { label: "Messages" },
    { label: "Settings" }
  ];

  return (
    <UiThemeProvider theme="lawAidDark">
      <UiShell
        title="LawAidAI"
        subtitle="Project dashboard"
        logoText="L"
        sidebarTitle="LawAidAI"
        sidebarSubtitle="Client-side management"
        sidebarItems={sidebarItems}
        topbarAction={<UiBadge tone="success">Verified</UiBadge>}
      >
        <div className="ui-page-header">
          <div>
            <h2 className="ui-card-title" style={{ fontSize: "1.35rem" }}>
              Projects
            </h2>
            <p className="ui-card-description">
              Organize matters, documents, timelines, and next steps without clutter.
            </p>
          </div>
          <UiButton>Create Project</UiButton>
        </div>

        <div className="ui-grid">
          <div className="ui-col-12">
            <UiCard
              title="Create a new project"
              description="Start with a simple name. Governed records and proof layers stay behind the interface."
              action={<UiBadge tone="warning">Draft</UiBadge>}
            >
              <div className="ui-stack">
                <UiInput label="Project name" placeholder="Example: Parenting timeline" />
                <UiInput label="Primary focus" placeholder="Documents, timeline, evidence, or messages" />
                <UiButton>Continue</UiButton>
              </div>
            </UiCard>
          </div>

          <div className="ui-col-8">
            <UiCard title="Active project list" description="Clean cards. No clutter. Large touch targets.">
              <div className="ui-list">
                <div className="ui-list-item">
                  <div>
                    <p className="ui-list-title">Case Management Timeline</p>
                    <p className="ui-list-meta">Updated today · 12 records</p>
                  </div>
                  <UiBadge tone="success">Ready</UiBadge>
                </div>

                <div className="ui-list-item">
                  <div>
                    <p className="ui-list-title">Document Intake</p>
                    <p className="ui-list-meta">Needs review · 4 pending</p>
                  </div>
                  <UiBadge tone="warning">Pending</UiBadge>
                </div>

                <div className="ui-list-item">
                  <div>
                    <p className="ui-list-title">Evidence Notes</p>
                    <p className="ui-list-meta">Held for verification</p>
                  </div>
                  <UiBadge tone="danger">Held</UiBadge>
                </div>
              </div>
            </UiCard>
          </div>

          <div className="ui-col-4">
            <UiCard title="System posture" description="UI reflects state. UI does not create truth." variant="flat">
              <div className="ui-stack">
                <UiBadge tone="success">Custody clean</UiBadge>
                <UiBadge>Mobile-first</UiBadge>
                <UiBadge>Shared kernel</UiBadge>
              </div>
            </UiCard>
          </div>
        </div>
      </UiShell>
    </UiThemeProvider>
  );
}
