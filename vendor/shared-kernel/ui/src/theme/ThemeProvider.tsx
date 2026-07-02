import React, { createContext, useContext } from "react";
import { UiTheme, themeToCssVars } from "./themeSchema";
import { lawAidPremiumDark } from "./themePresets";

const TemplateThemeContext = createContext<UiTheme>(lawAidPremiumDark);

export type ThemeProviderProps = {
  theme: UiTheme;
  children: React.ReactNode;
};

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  return (
    <TemplateThemeContext.Provider value={theme}>
      <div className="template-root" style={themeToCssVars(theme) as React.CSSProperties}>
        {children}
      </div>
    </TemplateThemeContext.Provider>
  );
}

export function useTemplateTheme(): UiTheme {
  return useContext(TemplateThemeContext);
}