export type ThemeFieldType = "color" | "number" | "select" | "text";
export type TextTransformMode = "none" | "uppercase" | "capitalize";
export type LogoShape = "circle" | "square" | "roundedSquare" | "triangle" | "diamond";
export type ColorMode = "dark" | "light";
export type ButtonStyleMode = "solid" | "outline" | "ghost" | "soft" | "link";

export type UiTheme = {
  id: string;
  name: string;
  colorMode: ColorMode;

  trueBackground: string;
  customizerPanelBackground: string;
  customizerPanelTextColor: string;
  customizerPanelMutedTextColor: string;
  customizerPanelBorderColor: string;

  canvasBackground: string;
  appBackground: string;
  pageBackground: string;
  sidebarBackground: string;

  navBackground: string;
  navBorderColor: string;
  navTextColor: string;
  navMutedTextColor: string;
  navActiveBackground: string;
  navActiveTextColor: string;
  navHoverBackground: string;
  navHoverTextColor: string;
  navLogoAreaBackground: string;
  navWidth: number;
  navItemHeight: number;
  navItemRadius: number;
  appBarBackground: string;

  cardBackground: string;
  cardElevatedBackground: string;
  cardHeaderBackground: string;
  listRowBackground: string;
  metricBoxBackground: string;

  borderColor: string;
  borderOpacity: number;

  buttonBackground: string;
  buttonTextColor: string;
  buttonHoverColor: string;
  secondaryButtonBackground: string;
  secondaryButtonTextColor: string;
  secondaryButtonHoverColor: string;
  secondaryButtonPressedColor: string;
  secondaryButtonWidth: number;
  secondaryButtonHeight: number;
  secondaryButtonFontSize: number;
  secondaryButtonBorderWidth: number;
  secondaryButtonBorderColor: string;

  activeMenuColor: string;
  activeMenuTextColor: string;
  inactiveMenuTextColor: string;

  badgeVerifiedBg: string;
  badgeVerifiedText: string;
  badgePendingBg: string;
  badgePendingText: string;
  badgeReviewBg: string;
  badgeReviewText: string;
  badgeRefusedBg: string;
  badgeRefusedText: string;

  inputBackground: string;
  inputBorder: string;
  inputTextColor: string;
  inputPlaceholderColor: string;

  primaryTextColor: string;
  mutedTextColor: string;
  headingTextColor: string;
  sidebarTextColor: string;
  sidebarMutedTextColor: string;

  fontFamily: string;
  headingFontFamily: string;
  bodyFontSize: number;
  headingSize: number;
  bodyFontWeight: number;
  headingFontWeight: number;
  buttonFontWeight: number;
  badgeFontWeight: number;
  menuFontWeight: number;

  headingLetterSpacing: number;
  bodyLetterSpacing: number;
  buttonLetterSpacing: number;
  menuLetterSpacing: number;

  headingTextTransform: TextTransformMode;
  buttonTextTransform: TextTransformMode;
  menuTextTransform: TextTransformMode;
  badgeTextTransform: TextTransformMode;

  h1Size: number;
  h1Weight: number;
  h1Color: string;
  h1TextTransform: TextTransformMode;
  h1LetterSpacing: number;

  h2Size: number;
  h2Weight: number;
  h2Color: string;
  h2TextTransform: TextTransformMode;
  h2LetterSpacing: number;

  h3Size: number;
  h3Weight: number;
  h3Color: string;
  h3TextTransform: TextTransformMode;
  h3LetterSpacing: number;

  logoShape: LogoShape;
  logoSize: number;
  logoBackgroundColor: string;
  logoIconColor: string;
  logoInnerMark: string;
  logoInnerSize: number;
  logoInnerWeight: number;

  brandTitleColor: string;
  brandTitleSize: number;
  brandTitleWeight: number;
  brandTitleTextTransform: TextTransformMode;

  taglineColor: string;
  taglineSize: number;
  taglineWeight: number;
  taglineTextTransform: TextTransformMode;
  taglineLetterSpacing: number;

  cardRadius: number;
  buttonRadius: number;

  spacingDensity: number;
  shadowStrength: number;

  mobileLayoutDensity: number;
  desktopLayoutDensity: number;

  toggleTrackColor: string;
  toggleTrackActiveColor: string;
  toggleThumbColor: string;
  toggleHoverColor: string;
  toggleRadius: number;
  toggleThumbRadius: number;

  zIndexCustomizerPanel: number;
  zIndexSidebar: number;
  zIndexAppBar: number;
  zIndexCards: number;
};

export type ThemeControl = {
  key: keyof UiTheme;
  label: string;
  type: ThemeFieldType;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
};

export const themeControls: ThemeControl[] = [
  { key: "colorMode", label: "Mode", type: "select", options: ["dark", "light"] },

  { key: "trueBackground", label: "True outer background", type: "color" },
  { key: "customizerPanelBackground", label: "Customizer panel background", type: "color" },
  { key: "customizerPanelTextColor", label: "Customizer panel text", type: "color" },
  { key: "customizerPanelMutedTextColor", label: "Customizer panel muted text", type: "color" },
  { key: "customizerPanelBorderColor", label: "Customizer panel border", type: "color" },

  { key: "canvasBackground", label: "Main canvas background", type: "color" },
  { key: "appBackground", label: "App shell background", type: "color" },
  { key: "pageBackground", label: "Page background", type: "color" },
  { key: "sidebarBackground", label: "Legacy sidebar background", type: "color" },

  { key: "navBackground", label: "Nav background", type: "color" },
  { key: "navBorderColor", label: "Nav border color", type: "color" },
  { key: "navTextColor", label: "Nav text color", type: "color" },
  { key: "navMutedTextColor", label: "Nav muted text color", type: "color" },
  { key: "navActiveBackground", label: "Nav active background", type: "color" },
  { key: "navActiveTextColor", label: "Nav active text", type: "color" },
  { key: "navHoverBackground", label: "Nav hover background", type: "color" },
  { key: "navHoverTextColor", label: "Nav hover text", type: "color" },
  { key: "navLogoAreaBackground", label: "Nav logo area background", type: "color" },
  { key: "navWidth", label: "Nav width", type: "number", min: 180, max: 360, step: 1 },
  { key: "navItemHeight", label: "Nav item height", type: "number", min: 32, max: 72, step: 1 },
  { key: "navItemRadius", label: "Nav item radius", type: "number", min: 0, max: 24, step: 1 },
  { key: "appBarBackground", label: "App bar background", type: "color" },

  { key: "cardBackground", label: "Card background", type: "color" },
  { key: "cardElevatedBackground", label: "Elevated card background", type: "color" },
  { key: "cardHeaderBackground", label: "Card header background", type: "color" },
  { key: "listRowBackground", label: "List row background", type: "color" },
  { key: "metricBoxBackground", label: "Metric box background", type: "color" },

  { key: "borderColor", label: "Global border color", type: "color" },
  { key: "borderOpacity", label: "Global border opacity", type: "number", min: 0, max: 1, step: 0.01 },

  { key: "buttonStyleMode", label: "Button style mode", type: "select", options: ["solid", "outline", "ghost", "soft", "link"] },
  { key: "buttonBackground", label: "Primary button background", type: "color" },
  { key: "buttonTextColor", label: "Primary button text", type: "color" },
  { key: "buttonHoverColor", label: "Primary button hover", type: "color" },
  { key: "buttonPressedColor", label: "Primary button pressed", type: "color" },
  { key: "buttonHoverTextColor", label: "Primary hover text", type: "color" },
  { key: "buttonPressedTextColor", label: "Primary pressed text", type: "color" },
  { key: "buttonWidth", label: "Button width px", type: "number", min: 0, max: 520, step: 1 },
  { key: "buttonHeight", label: "Button height px", type: "number", min: 28, max: 120, step: 1 },
  { key: "buttonMinWidth", label: "Button min width px", type: "number", min: 0, max: 520, step: 1 },
  { key: "buttonMaxWidth", label: "Button max width px", type: "number", min: 0, max: 900, step: 1 },
  { key: "buttonPaddingX", label: "Button padding X", type: "number", min: 0, max: 80, step: 1 },
  { key: "buttonPaddingY", label: "Button padding Y", type: "number", min: 0, max: 40, step: 1 },
  { key: "buttonFontSize", label: "Button font size", type: "number", min: 10, max: 32, step: 1 },
  { key: "buttonBorderWidth", label: "Button border width", type: "number", min: 0, max: 8, step: 1 },
  { key: "buttonBorderColor", label: "Button border color", type: "color" },
  { key: "buttonShadowStrength", label: "Button shadow strength", type: "number", min: 0, max: 0.55, step: 0.01 },
  { key: "secondaryButtonBackground", label: "Secondary button background", type: "color" },
  { key: "secondaryButtonTextColor", label: "Secondary button text", type: "color" },
  { key: "secondaryButtonHoverColor", label: "Secondary button hover", type: "color" },
  { key: "secondaryButtonPressedColor", label: "Secondary button pressed", type: "color" },
  { key: "secondaryButtonWidth", label: "Secondary width px", type: "number", min: 0, max: 520, step: 1 },
  { key: "secondaryButtonHeight", label: "Secondary height px", type: "number", min: 28, max: 120, step: 1 },
  { key: "secondaryButtonFontSize", label: "Secondary font size", type: "number", min: 10, max: 32, step: 1 },
  { key: "secondaryButtonBorderWidth", label: "Secondary border width", type: "number", min: 0, max: 8, step: 1 },
  { key: "secondaryButtonBorderColor", label: "Secondary border color", type: "color" },

  { key: "activeMenuColor", label: "Active menu background", type: "color" },
  { key: "activeMenuTextColor", label: "Active menu text", type: "color" },
  { key: "inactiveMenuTextColor", label: "Inactive menu text", type: "color" },

  { key: "badgeVerifiedBg", label: "Verified badge bg", type: "color" },
  { key: "badgeVerifiedText", label: "Verified badge text", type: "color" },
  { key: "badgePendingBg", label: "Pending badge bg", type: "color" },
  { key: "badgePendingText", label: "Pending badge text", type: "color" },
  { key: "badgeReviewBg", label: "Review badge bg", type: "color" },
  { key: "badgeReviewText", label: "Review badge text", type: "color" },
  { key: "badgeRefusedBg", label: "Refused badge bg", type: "color" },
  { key: "badgeRefusedText", label: "Refused badge text", type: "color" },

  { key: "inputBackground", label: "Input background", type: "color" },
  { key: "inputBorder", label: "Input border", type: "color" },
  { key: "inputTextColor", label: "Input text", type: "color" },
  { key: "inputPlaceholderColor", label: "Input placeholder", type: "color" },

  { key: "primaryTextColor", label: "Primary text color", type: "color" },
  { key: "mutedTextColor", label: "Muted text color", type: "color" },
  { key: "headingTextColor", label: "Heading text color", type: "color" },
  { key: "sidebarTextColor", label: "Sidebar text color", type: "color" },
  { key: "sidebarMutedTextColor", label: "Sidebar muted text color", type: "color" },

  {
    key: "fontFamily",
    label: "Body font family",
    type: "select",
    options: [
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      "Arial, Helvetica, sans-serif",
      "Roboto, Arial, sans-serif",
      "SF Pro Display, Inter, system-ui, sans-serif",
      "Georgia, serif",
      "JetBrains Mono, Consolas, monospace"
    ]
  },
  {
    key: "headingFontFamily",
    label: "Heading font family",
    type: "select",
    options: [
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      "Arial, Helvetica, sans-serif",
      "Roboto, Arial, sans-serif",
      "SF Pro Display, Inter, system-ui, sans-serif",
      "Georgia, serif",
      "JetBrains Mono, Consolas, monospace"
    ]
  },

  { key: "bodyFontSize", label: "Body font size", type: "number", min: 12, max: 22, step: 1 },
  { key: "bodyFontWeight", label: "Body font weight", type: "number", min: 300, max: 900, step: 50 },
  { key: "bodyLetterSpacing", label: "Body letter spacing", type: "number", min: -0.5, max: 2, step: 0.05 },

  { key: "headingSize", label: "Legacy heading size", type: "number", min: 18, max: 44, step: 1 },
  { key: "headingFontWeight", label: "Legacy heading weight", type: "number", min: 300, max: 900, step: 50 },
  { key: "headingLetterSpacing", label: "Legacy heading spacing", type: "number", min: -1.5, max: 3, step: 0.05 },
  { key: "headingTextTransform", label: "Legacy heading case", type: "select", options: ["none", "uppercase", "capitalize"] },

  { key: "h1Size", label: "H1 size", type: "number", min: 20, max: 52, step: 1 },
  { key: "h1Weight", label: "H1 weight", type: "number", min: 300, max: 900, step: 50 },
  { key: "h1Color", label: "H1 color", type: "color" },
  { key: "h1TextTransform", label: "H1 case", type: "select", options: ["none", "uppercase", "capitalize"] },
  { key: "h1LetterSpacing", label: "H1 letter spacing", type: "number", min: -2, max: 4, step: 0.05 },

  { key: "h2Size", label: "H2 size", type: "number", min: 16, max: 40, step: 1 },
  { key: "h2Weight", label: "H2 weight", type: "number", min: 300, max: 900, step: 50 },
  { key: "h2Color", label: "H2 color", type: "color" },
  { key: "h2TextTransform", label: "H2 case", type: "select", options: ["none", "uppercase", "capitalize"] },
  { key: "h2LetterSpacing", label: "H2 letter spacing", type: "number", min: -2, max: 4, step: 0.05 },

  { key: "h3Size", label: "H3 size", type: "number", min: 13, max: 30, step: 1 },
  { key: "h3Weight", label: "H3 weight", type: "number", min: 300, max: 900, step: 50 },
  { key: "h3Color", label: "H3 color", type: "color" },
  { key: "h3TextTransform", label: "H3 case", type: "select", options: ["none", "uppercase", "capitalize"] },
  { key: "h3LetterSpacing", label: "H3 letter spacing", type: "number", min: -2, max: 4, step: 0.05 },

  { key: "buttonFontWeight", label: "Button font weight", type: "number", min: 300, max: 900, step: 50 },
  { key: "buttonLetterSpacing", label: "Button letter spacing", type: "number", min: -0.5, max: 3, step: 0.05 },
  { key: "buttonTextTransform", label: "Button text case", type: "select", options: ["none", "uppercase", "capitalize"] },

  { key: "menuFontWeight", label: "Menu font weight", type: "number", min: 300, max: 900, step: 50 },
  { key: "menuLetterSpacing", label: "Menu letter spacing", type: "number", min: -0.5, max: 3, step: 0.05 },
  { key: "menuTextTransform", label: "Menu text case", type: "select", options: ["none", "uppercase", "capitalize"] },

  { key: "badgeFontWeight", label: "Badge font weight", type: "number", min: 300, max: 900, step: 50 },
  { key: "badgeTextTransform", label: "Badge text case", type: "select", options: ["none", "uppercase", "capitalize"] },

  { key: "logoShape", label: "Logo shape", type: "select", options: ["circle", "square", "roundedSquare", "triangle", "diamond"] },
  { key: "logoSize", label: "Logo size", type: "number", min: 28, max: 96, step: 1 },
  { key: "logoBackgroundColor", label: "Logo background color", type: "color" },
  { key: "logoIconColor", label: "Logo icon color", type: "color" },
  { key: "logoInnerMark", label: "Logo inside mark", type: "text" },
  { key: "logoInnerSize", label: "Logo inside size", type: "number", min: 10, max: 48, step: 1 },
  { key: "logoInnerWeight", label: "Logo inside weight", type: "number", min: 300, max: 900, step: 50 },

  { key: "brandTitleColor", label: "Brand title color", type: "color" },
  { key: "brandTitleSize", label: "Brand title size", type: "number", min: 12, max: 36, step: 1 },
  { key: "brandTitleWeight", label: "Brand title weight", type: "number", min: 300, max: 900, step: 50 },
  { key: "brandTitleTextTransform", label: "Brand title case", type: "select", options: ["none", "uppercase", "capitalize"] },

  { key: "taglineColor", label: "Tagline color", type: "color" },
  { key: "taglineSize", label: "Tagline size", type: "number", min: 9, max: 22, step: 1 },
  { key: "taglineWeight", label: "Tagline weight", type: "number", min: 300, max: 900, step: 50 },
  { key: "taglineTextTransform", label: "Tagline case", type: "select", options: ["none", "uppercase", "capitalize"] },
  { key: "taglineLetterSpacing", label: "Tagline letter spacing", type: "number", min: -0.5, max: 4, step: 0.05 },

  { key: "toggleTrackColor", label: "Toggle track color", type: "color" },
  { key: "toggleTrackActiveColor", label: "Toggle active color", type: "color" },
  { key: "toggleThumbColor", label: "Toggle thumb color", type: "color" },
  { key: "toggleHoverColor", label: "Toggle hover color", type: "color" },
  { key: "toggleRadius", label: "Toggle shape: square to oval", type: "number", min: 0, max: 999, step: 1 },
  { key: "toggleThumbRadius", label: "Toggle thumb shape", type: "number", min: 0, max: 999, step: 1 },

  { key: "cardRadius", label: "Card radius", type: "number", min: 8, max: 34, step: 1 },
  { key: "buttonRadius", label: "Button radius", type: "number", min: 6, max: 24, step: 1 },
  { key: "spacingDensity", label: "Spacing density", type: "number", min: 0.75, max: 1.35, step: 0.01 },
  { key: "shadowStrength", label: "Shadow strength", type: "number", min: 0, max: 0.55, step: 0.01 },
  { key: "mobileLayoutDensity", label: "Mobile layout density", type: "number", min: 0.78, max: 1.25, step: 0.01 },
  { key: "desktopLayoutDensity", label: "Desktop layout density", type: "number", min: 0.78, max: 1.25, step: 0.01 },

  { key: "zIndexCustomizerPanel", label: "Layer: customizer panel", type: "number", min: 0, max: 200, step: 1 },
  { key: "zIndexSidebar", label: "Layer: sidebar", type: "number", min: 0, max: 200, step: 1 },
  { key: "zIndexAppBar", label: "Layer: app bar", type: "number", min: 0, max: 200, step: 1 },
  { key: "zIndexCards", label: "Layer: cards", type: "number", min: 0, max: 200, step: 1 }
];

export type LayerTarget =
  | "all"
  | "trueBackground"
  | "customizerPanel"
  | "canvas"
  | "appShell"
  | "page"
  | "navigationChrome"
  | "sidebar"
  | "appBar"
  | "cards"
  | "elevatedCards"
  | "cardHeaders"
  | "listRows"
  | "metrics"
  | "buttons"
  | "secondaryButtons"
  | "inputs"
  | "text"
  | "headings"
  | "borders"
  | "activeMenu"
  | "badges"
  | "logo";

export const layerTargets: Array<{ id: LayerTarget; label: string }> = [
  { id: "all", label: "All Preview Layers" },
  { id: "trueBackground", label: "True Background" },
  { id: "customizerPanel", label: "Customizer Panel" },
  { id: "canvas", label: "Preview Canvas" },
  { id: "appShell", label: "App Shell" },
  { id: "page", label: "Page" },
  { id: "navigationChrome", label: "Navigation Chrome" },
  { id: "sidebar", label: "Legacy Sidebar" },
  { id: "appBar", label: "App Bar" },
  { id: "cards", label: "Cards" },
  { id: "elevatedCards", label: "Elevated Cards" },
  { id: "cardHeaders", label: "Card Headers" },
  { id: "listRows", label: "List Rows" },
  { id: "metrics", label: "Metric Boxes" },
  { id: "buttons", label: "Primary Buttons" },
  { id: "secondaryButtons", label: "Secondary Buttons" },
  { id: "inputs", label: "Inputs" },
  { id: "text", label: "Text" },
  { id: "headings", label: "Headings" },
  { id: "borders", label: "Borders" },
  { id: "activeMenu", label: "Active Menu" },
  { id: "badges", label: "Badges" },
  { id: "logo", label: "Logo" }
];

export function applyLayerColor(theme: UiTheme, target: LayerTarget, color: string): UiTheme {
  const next = { ...theme };

  if (target === "all") {
    next.trueBackground = color;
    next.canvasBackground = color;
    next.appBackground = color;
    next.pageBackground = color;
    next.sidebarBackground = color;
    next.appBarBackground = color;
    next.cardBackground = color;
    next.cardElevatedBackground = color;
    next.cardHeaderBackground = color;
    next.listRowBackground = color;
    next.metricBoxBackground = color;
    return next;
  }

  if (target === "trueBackground") next.trueBackground = color;
  if (target === "customizerPanel") next.customizerPanelBackground = color;
  if (target === "canvas") next.canvasBackground = color;
  if (target === "appShell") next.appBackground = color;
  if (target === "page") next.pageBackground = color;
  if (target === "navigationChrome") {
    next.navBackground = color;
    next.navLogoAreaBackground = color;
    next.navActiveBackground = color;
  }
  if (target === "sidebar") next.sidebarBackground = color;
  if (target === "appBar") next.appBarBackground = color;
  if (target === "cards") next.cardBackground = color;
  if (target === "elevatedCards") next.cardElevatedBackground = color;
  if (target === "cardHeaders") next.cardHeaderBackground = color;
  if (target === "listRows") next.listRowBackground = color;
  if (target === "metrics") next.metricBoxBackground = color;
  if (target === "buttons") {
    next.buttonBackground = color;
    next.buttonHoverColor = color;
  }
  if (target === "secondaryButtons") {
    next.secondaryButtonBackground = color;
    next.secondaryButtonHoverColor = color;
  }
  if (target === "inputs") {
    next.inputBackground = color;
    next.inputBorder = color;
  }
  if (target === "text") {
    next.primaryTextColor = color;
    next.mutedTextColor = color;
  }
  if (target === "headings") {
    next.headingTextColor = color;
    next.h1Color = color;
    next.h2Color = color;
    next.h3Color = color;
  }
  if (target === "borders") next.borderColor = color;
  if (target === "activeMenu") next.activeMenuColor = color;
  if (target === "badges") {
    next.badgeVerifiedBg = color;
    next.badgePendingBg = color;
    next.badgeReviewBg = color;
    next.badgeRefusedBg = color;
  }
  if (target === "logo") next.logoBackgroundColor = color;

  return next;
}

export function themeToCssVars(theme: UiTheme): Record<string, string> {
  return {
    "--tmpl-true-bg": theme.trueBackground,
    "--tmpl-customizer-bg": theme.customizerPanelBackground,
    "--tmpl-customizer-text": theme.customizerPanelTextColor,
    "--tmpl-customizer-muted": theme.customizerPanelMutedTextColor,
    "--tmpl-customizer-border": theme.customizerPanelBorderColor,

    "--tmpl-canvas-bg": theme.canvasBackground,
    "--tmpl-app-bg": theme.appBackground,
    "--tmpl-page-bg": theme.pageBackground,
    "--tmpl-sidebar-bg": theme.sidebarBackground,

    "--tmpl-nav-bg": theme.navBackground,
    "--tmpl-nav-border": theme.navBorderColor,
    "--tmpl-nav-text": theme.navTextColor,
    "--tmpl-nav-muted": theme.navMutedTextColor,
    "--tmpl-nav-active-bg": theme.navActiveBackground,
    "--tmpl-nav-active-text": theme.navActiveTextColor,
    "--tmpl-nav-hover-bg": theme.navHoverBackground,
    "--tmpl-nav-hover-text": theme.navHoverTextColor,
    "--tmpl-nav-logo-area-bg": theme.navLogoAreaBackground,
    "--tmpl-nav-width": `${theme.navWidth}px`,
    "--tmpl-nav-item-height": `${theme.navItemHeight}px`,
    "--tmpl-nav-item-radius": `${theme.navItemRadius}px`,
    "--tmpl-appbar-bg": theme.appBarBackground,

    "--tmpl-card-bg": theme.cardBackground,
    "--tmpl-card-elevated-bg": theme.cardElevatedBackground,
    "--tmpl-card-header-bg": theme.cardHeaderBackground,
    "--tmpl-list-row-bg": theme.listRowBackground,
    "--tmpl-metric-box-bg": theme.metricBoxBackground,

    "--tmpl-border-rgb": hexToRgb(theme.borderColor),
    "--tmpl-border-opacity": String(theme.borderOpacity),
    "--tmpl-border": `rgba(${hexToRgb(theme.borderColor)}, ${theme.borderOpacity})`,

    "--tmpl-button-bg": theme.buttonBackground,
    "--tmpl-button-text": theme.buttonTextColor,
    "--tmpl-button-hover": theme.buttonHoverColor,
    "--tmpl-button-pressed": theme.buttonPressedColor,
    "--tmpl-button-style-mode": theme.buttonStyleMode,
    "--tmpl-button-width": theme.buttonWidth === 0 ? "auto" : `${theme.buttonWidth}px`,
    "--tmpl-button-height": `${theme.buttonHeight}px`,
    "--tmpl-button-min-width": theme.buttonMinWidth === 0 ? "0px" : `${theme.buttonMinWidth}px`,
    "--tmpl-button-max-width": theme.buttonMaxWidth === 0 ? "none" : `${theme.buttonMaxWidth}px`,
    "--tmpl-button-padding-x": `${theme.buttonPaddingX}px`,
    "--tmpl-button-padding-y": `${theme.buttonPaddingY}px`,
    "--tmpl-button-font-size": `${theme.buttonFontSize}px`,
    "--tmpl-button-border-width": `${theme.buttonBorderWidth}px`,
    "--tmpl-button-border-color": theme.buttonBorderColor,
    "--tmpl-button-hover-text": theme.buttonHoverTextColor,
    "--tmpl-button-pressed-text": theme.buttonPressedTextColor,
    "--tmpl-button-shadow-strength": String(theme.buttonShadowStrength),
    "--tmpl-secondary-button-bg": theme.secondaryButtonBackground,
    "--tmpl-secondary-button-text": theme.secondaryButtonTextColor,
    "--tmpl-secondary-button-hover": theme.secondaryButtonHoverColor,
    "--tmpl-secondary-button-pressed": theme.secondaryButtonPressedColor,
    "--tmpl-secondary-button-width": theme.secondaryButtonWidth === 0 ? "auto" : `${theme.secondaryButtonWidth}px`,
    "--tmpl-secondary-button-height": `${theme.secondaryButtonHeight}px`,
    "--tmpl-secondary-button-font-size": `${theme.secondaryButtonFontSize}px`,
    "--tmpl-secondary-button-border-width": `${theme.secondaryButtonBorderWidth}px`,
    "--tmpl-secondary-button-border-color": theme.secondaryButtonBorderColor,

    "--tmpl-active-menu": theme.activeMenuColor,
    "--tmpl-active-menu-text": theme.activeMenuTextColor,
    "--tmpl-inactive-menu-text": theme.inactiveMenuTextColor,

    "--tmpl-badge-verified-bg": theme.badgeVerifiedBg,
    "--tmpl-badge-verified-text": theme.badgeVerifiedText,
    "--tmpl-badge-pending-bg": theme.badgePendingBg,
    "--tmpl-badge-pending-text": theme.badgePendingText,
    "--tmpl-badge-review-bg": theme.badgeReviewBg,
    "--tmpl-badge-review-text": theme.badgeReviewText,
    "--tmpl-badge-refused-bg": theme.badgeRefusedBg,
    "--tmpl-badge-refused-text": theme.badgeRefusedText,

    "--tmpl-input-bg": theme.inputBackground,
    "--tmpl-input-border": theme.inputBorder,
    "--tmpl-input-text": theme.inputTextColor,
    "--tmpl-input-placeholder": theme.inputPlaceholderColor,

    "--tmpl-text": theme.primaryTextColor,
    "--tmpl-muted": theme.mutedTextColor,
    "--tmpl-heading-text": theme.headingTextColor,
    "--tmpl-sidebar-text": theme.sidebarTextColor,
    "--tmpl-sidebar-muted": theme.sidebarMutedTextColor,

    "--tmpl-font": theme.fontFamily,
    "--tmpl-heading-font": theme.headingFontFamily,
    "--tmpl-heading-size": `${theme.headingSize}px`,
    "--tmpl-body-size": `${theme.bodyFontSize}px`,

    "--tmpl-body-weight": String(theme.bodyFontWeight),
    "--tmpl-heading-weight": String(theme.headingFontWeight),
    "--tmpl-button-weight": String(theme.buttonFontWeight),
    "--tmpl-badge-weight": String(theme.badgeFontWeight),
    "--tmpl-menu-weight": String(theme.menuFontWeight),

    "--tmpl-heading-letter-spacing": `${theme.headingLetterSpacing}px`,
    "--tmpl-body-letter-spacing": `${theme.bodyLetterSpacing}px`,
    "--tmpl-button-letter-spacing": `${theme.buttonLetterSpacing}px`,
    "--tmpl-menu-letter-spacing": `${theme.menuLetterSpacing}px`,

    "--tmpl-heading-transform": theme.headingTextTransform,
    "--tmpl-button-transform": theme.buttonTextTransform,
    "--tmpl-menu-transform": theme.menuTextTransform,
    "--tmpl-badge-transform": theme.badgeTextTransform,

    "--tmpl-h1-size": `${theme.h1Size}px`,
    "--tmpl-h1-weight": String(theme.h1Weight),
    "--tmpl-h1-color": theme.h1Color,
    "--tmpl-h1-transform": theme.h1TextTransform,
    "--tmpl-h1-letter-spacing": `${theme.h1LetterSpacing}px`,

    "--tmpl-h2-size": `${theme.h2Size}px`,
    "--tmpl-h2-weight": String(theme.h2Weight),
    "--tmpl-h2-color": theme.h2Color,
    "--tmpl-h2-transform": theme.h2TextTransform,
    "--tmpl-h2-letter-spacing": `${theme.h2LetterSpacing}px`,

    "--tmpl-h3-size": `${theme.h3Size}px`,
    "--tmpl-h3-weight": String(theme.h3Weight),
    "--tmpl-h3-color": theme.h3Color,
    "--tmpl-h3-transform": theme.h3TextTransform,
    "--tmpl-h3-letter-spacing": `${theme.h3LetterSpacing}px`,

    "--tmpl-logo-size": `${theme.logoSize}px`,
    "--tmpl-logo-bg": theme.logoBackgroundColor,
    "--tmpl-logo-icon": theme.logoIconColor,
    "--tmpl-logo-inner-size": `${theme.logoInnerSize}px`,
    "--tmpl-logo-inner-weight": String(theme.logoInnerWeight),
    "--tmpl-logo-radius": logoShapeToRadius(theme.logoShape),
    "--tmpl-logo-clip": logoShapeToClip(theme.logoShape),

    "--tmpl-brand-title-color": theme.brandTitleColor,
    "--tmpl-brand-title-size": `${theme.brandTitleSize}px`,
    "--tmpl-brand-title-weight": String(theme.brandTitleWeight),
    "--tmpl-brand-title-transform": theme.brandTitleTextTransform,

    "--tmpl-tagline-color": theme.taglineColor,
    "--tmpl-tagline-size": `${theme.taglineSize}px`,
    "--tmpl-tagline-weight": String(theme.taglineWeight),
    "--tmpl-tagline-transform": theme.taglineTextTransform,
    "--tmpl-tagline-letter-spacing": `${theme.taglineLetterSpacing}px`,

    "--tmpl-card-radius": `${theme.cardRadius}px`,
    "--tmpl-button-radius": `${theme.buttonRadius}px`,

    "--tmpl-density": String(theme.spacingDensity),
    "--tmpl-shadow-strength": String(theme.shadowStrength),
    "--tmpl-mobile-density": String(theme.mobileLayoutDensity),
    "--tmpl-desktop-density": String(theme.desktopLayoutDensity),

    "--tmpl-toggle-track": theme.toggleTrackColor,
    "--tmpl-toggle-track-active": theme.toggleTrackActiveColor,
    "--tmpl-toggle-thumb": theme.toggleThumbColor,
    "--tmpl-toggle-hover": theme.toggleHoverColor,
    "--tmpl-toggle-radius": `${theme.toggleRadius}px`,
    "--tmpl-toggle-thumb-radius": `${theme.toggleThumbRadius}px`,

    "--tmpl-z-customizer": String(theme.zIndexCustomizerPanel),
    "--tmpl-z-sidebar": String(theme.zIndexSidebar),
    "--tmpl-z-appbar": String(theme.zIndexAppBar),
    "--tmpl-z-cards": String(theme.zIndexCards)
  };
}

function logoShapeToRadius(shape: LogoShape): string {
  if (shape === "circle") return "999px";
  if (shape === "square") return "0px";
  if (shape === "roundedSquare") return "14px";
  if (shape === "diamond") return "10px";
  if (shape === "triangle") return "0px";
  return "999px";
}

function logoShapeToClip(shape: LogoShape): string {
  if (shape === "triangle") return "polygon(50% 0%, 0% 100%, 100% 100%)";
  if (shape === "diamond") return "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)";
  return "none";
}

function hexToRgb(hex: string): string {
  const clean = hex.replace("#", "");
  const value = clean.length === 3 ? clean.split("").map((char) => char + char).join("") : clean;
  const num = Number.parseInt(value, 16);
  if (Number.isNaN(num)) return "255, 255, 255";
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `${r}, ${g}, ${b}`;
}

export function safeParseThemeJson(input: string, fallback: UiTheme): UiTheme {
  try {
    const parsed = JSON.parse(input) as Partial<UiTheme>;
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}