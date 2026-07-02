import React from "react";
import { uiThemePresets, UiThemePresetName } from "../presets/theme-presets";

export type UiThemeProviderProps = {
  theme?: UiThemePresetName;
  overrides?: Record<string, string>;
  children: React.ReactNode;
};

export function UiThemeProvider({
  theme = "lawAidDark",
  overrides = {},
  children
}: UiThemeProviderProps) {
  const preset = uiThemePresets[theme];
  const style = {
    ...preset.variables,
    ...overrides
  } as React.CSSProperties;

  return (
    <div className="ui-root" data-ui-theme={theme} style={style}>
      {children}
    </div>
  );
}
