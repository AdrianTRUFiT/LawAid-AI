export type UiThemePresetName =
  | "lawAidDark"
  | "paidDark"
  | "paiSafeDark"
  | "commandCenterDark"
  | "lightClean";

export type UiThemePreset = {
  name: UiThemePresetName;
  label: string;
  variables: Record<string, string>;
};

export const uiThemePresets: Record<UiThemePresetName, UiThemePreset> = {
  lawAidDark: {
    name: "lawAidDark",
    label: "LawAidAI Dark",
    variables: {
      "--ui-bg": "#080c11",
      "--ui-surface": "#111821",
      "--ui-surface-elevated": "#16202c",
      "--ui-border": "rgba(218, 231, 255, 0.10)",
      "--ui-button": "#e9f1ff",
      "--ui-button-hover": "#d7e6ff",
      "--ui-button-text": "#07101c",
      "--ui-accent": "#8fb7ff",
      "--ui-radius-lg": "24px",
      "--ui-density": "1"
    }
  },
  paidDark: {
    name: "paidDark",
    label: "PAID Dark",
    variables: {
      "--ui-bg": "#080a12",
      "--ui-surface": "#111424",
      "--ui-surface-elevated": "#181c30",
      "--ui-button": "#c9bbff",
      "--ui-button-hover": "#ddd4ff",
      "--ui-button-text": "#0a0818",
      "--ui-accent": "#b7a3ff",
      "--ui-radius-lg": "26px",
      "--ui-density": "1"
    }
  },
  paiSafeDark: {
    name: "paiSafeDark",
    label: "PAI-SAFE Dark",
    variables: {
      "--ui-bg": "#06100d",
      "--ui-surface": "#0d1b17",
      "--ui-surface-elevated": "#13251f",
      "--ui-button": "#75efb4",
      "--ui-button-hover": "#a0f6ca",
      "--ui-button-text": "#05110d",
      "--ui-accent": "#66e4a6",
      "--ui-success": "#64e6a8",
      "--ui-warning": "#e7c267",
      "--ui-danger": "#ff6f7d",
      "--ui-density": "1"
    }
  },
  commandCenterDark: {
    name: "commandCenterDark",
    label: "Command Center Dark",
    variables: {
      "--ui-bg": "#09090d",
      "--ui-surface": "#13131b",
      "--ui-surface-elevated": "#1a1a24",
      "--ui-button": "#f0c36a",
      "--ui-button-hover": "#ffd98c",
      "--ui-button-text": "#141007",
      "--ui-accent": "#f0c36a",
      "--ui-density": "0.96"
    }
  },
  lightClean: {
    name: "lightClean",
    label: "Light Clean",
    variables: {
      "--ui-bg": "#f4f6f8",
      "--ui-surface": "#ffffff",
      "--ui-surface-elevated": "#ffffff",
      "--ui-border": "rgba(20, 32, 50, 0.10)",
      "--ui-text": "#111827",
      "--ui-text-muted": "#657386",
      "--ui-button": "#111827",
      "--ui-button-hover": "#263244",
      "--ui-button-text": "#ffffff",
      "--ui-accent": "#2868d8",
      "--ui-sidebar-bg": "#ffffff",
      "--ui-density": "1"
    }
  }
};
