# AIVA Shared Kernel UI

Reusable premium UI foundation for future dashboards and apps.

## Boundary

UI is not truth. UI reflects governed state.

This package does not touch TOUR, FundTrackerAI, PAI-SAFE logic, custody, or S:\SOUL promotion.

## Import CSS

Import the CSS files once in the consuming app entrypoint:

```ts
import "D:/DEV/AIVA/shared-kernel/ui/styles/tokens.css";
import "D:/DEV/AIVA/shared-kernel/ui/styles/themes.css";
import "D:/DEV/AIVA/shared-kernel/ui/styles/layout.css";
import "D:/DEV/AIVA/shared-kernel/ui/styles/components.css";
import "D:/DEV/AIVA/shared-kernel/ui/styles/mobile.css";

import {
  UiThemeProvider,
  UiShell,
  UiCard,
  UiButton,
  UiInput,
  UiBadge
} from "D:/DEV/AIVA/shared-kernel/ui";
import {
  UiThemeProvider,
  UiShell,
  UiCard,
  UiButton,
  UiInput,
  UiBadge
} from "D:/DEV/AIVA/shared-kernel/ui";
<UiThemeProvider
  theme="lawAidDark"
  overrides={{
    "--ui-button": "#ffffff",
    "--ui-accent": "#8fb7ff",
    "--ui-radius-lg": "28px",
    "--ui-density": "0.96"
  }}
>
  <App />
</UiThemeProvider>

