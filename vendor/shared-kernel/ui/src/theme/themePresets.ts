import { UiTheme } from "./themeSchema";

export const lawAidPremiumDark: UiTheme = {
  id: "lawAidPremiumDark",
  name: "LawAidAI Premium Dark",
  colorMode: "dark",

  trueBackground: "#1B1E23",
  customizerPanelBackground: "#20242A",
  customizerPanelTextColor: "#F5F7FA",
  customizerPanelMutedTextColor: "#AEB7C3",
  customizerPanelBorderColor: "#3A414C",

  canvasBackground: "#22262C",
  appBackground: "#1B1E23",
  pageBackground: "#22262C",
  sidebarBackground: "#191D22",

  navBackground: "#161B21",
  navBorderColor: "#343D49",
  navTextColor: "#F5F7FA",
  navMutedTextColor: "#AEB7C3",
  navActiveBackground: "#E33434",
  navActiveTextColor: "#FFFFFF",
  navHoverBackground: "#252C35",
  navHoverTextColor: "#FFFFFF",
  navLogoAreaBackground: "#161B21",
  navWidth: 250,
  navItemHeight: 44,
  navItemRadius: 10,
  appBarBackground: "#20242A",

  cardBackground: "#2A2F36",
  cardElevatedBackground: "#303640",
  cardHeaderBackground: "#2F3540",
  listRowBackground: "#303640",
  metricBoxBackground: "#303640",

  borderColor: "#4B5563",
  borderOpacity: 0.38,

  buttonBackground: "#E33434",
  buttonTextColor: "#FFFFFF",
  buttonHoverColor: "#FF4444",
  buttonPressedColor: "#B92424",
  buttonStyleMode: "solid",
  buttonWidth: 0,
  buttonHeight: 44,
  buttonMinWidth: 128,
  buttonMaxWidth: 0,
  buttonPaddingX: 16,
  buttonPaddingY: 0,
  buttonFontSize: 14,
  buttonBorderWidth: 0,
  buttonBorderColor: "#E33434",
  buttonHoverTextColor: "#FFFFFF",
  buttonPressedTextColor: "#FFFFFF",
  buttonShadowStrength: 0.16,
  secondaryButtonBackground: "#252B33",
  secondaryButtonTextColor: "#F5F7FA",
  secondaryButtonHoverColor: "#323A45",
  secondaryButtonPressedColor: "#1D232B",
  secondaryButtonWidth: 0,
  secondaryButtonHeight: 44,
  secondaryButtonFontSize: 14,
  secondaryButtonBorderWidth: 1,
  secondaryButtonBorderColor: "#4B5563",

  activeMenuColor: "#E33434",
  activeMenuTextColor: "#FFFFFF",
  inactiveMenuTextColor: "#C4CCD8",

  badgeVerifiedBg: "#0F6B46",
  badgeVerifiedText: "#D8FFEC",
  badgePendingBg: "#7A5200",
  badgePendingText: "#FFE6A6",
  badgeReviewBg: "#164D91",
  badgeReviewText: "#D9EBFF",
  badgeRefusedBg: "#6E1D25",
  badgeRefusedText: "#FFD9DF",

  inputBackground: "#232830",
  inputBorder: "#596270",
  inputTextColor: "#F5F7FA",
  inputPlaceholderColor: "#8F9AAA",

  primaryTextColor: "#F5F7FA",
  mutedTextColor: "#AEB7C3",
  headingTextColor: "#FFFFFF",
  sidebarTextColor: "#F5F7FA",
  sidebarMutedTextColor: "#AEB7C3",

  fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  headingFontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",

  headingSize: 24,
  bodyFontSize: 14,
  bodyFontWeight: 400,
  headingFontWeight: 800,
  buttonFontWeight: 800,
  badgeFontWeight: 800,
  menuFontWeight: 650,

  headingLetterSpacing: -0.6,
  bodyLetterSpacing: 0,
  buttonLetterSpacing: 0,
  menuLetterSpacing: 0,

  headingTextTransform: "none",
  buttonTextTransform: "none",
  menuTextTransform: "none",
  badgeTextTransform: "none",

  h1Size: 28,
  h1Weight: 800,
  h1Color: "#FFFFFF",
  h1TextTransform: "none",
  h1LetterSpacing: -0.8,

  h2Size: 20,
  h2Weight: 750,
  h2Color: "#F5F7FA",
  h2TextTransform: "none",
  h2LetterSpacing: -0.4,

  h3Size: 15,
  h3Weight: 700,
  h3Color: "#F5F7FA",
  h3TextTransform: "none",
  h3LetterSpacing: -0.15,

  logoShape: "circle",
  logoSize: 44,
  logoBackgroundColor: "#E33434",
  logoIconColor: "#FFFFFF",
  logoInnerMark: "LA",
  logoInnerSize: 17,
  logoInnerWeight: 800,

  brandTitleColor: "#FFFFFF",
  brandTitleSize: 17,
  brandTitleWeight: 800,
  brandTitleTextTransform: "none",

  taglineColor: "#AEB7C3",
  taglineSize: 11,
  taglineWeight: 500,
  taglineTextTransform: "uppercase",
  taglineLetterSpacing: 0.8,

  cardRadius: 18,
  buttonRadius: 12,
  spacingDensity: 1,
  shadowStrength: 0.22,
  mobileLayoutDensity: 0.95,
  desktopLayoutDensity: 1,

  toggleTrackColor: "#3A414C",
  toggleTrackActiveColor: "#E33434",
  toggleThumbColor: "#FFFFFF",
  toggleHoverColor: "#FF4444",
  toggleRadius: 999,
  toggleThumbRadius: 999,

  zIndexCustomizerPanel: 30,
  zIndexSidebar: 40,
  zIndexAppBar: 30,
  zIndexCards: 1
};

export const lawAidPremiumLight: UiTheme = {
  ...lawAidPremiumDark,
  id: "lawAidPremiumLight",
  name: "LawAidAI Premium Light",
  colorMode: "light",

  trueBackground: "#E6E9ED",
  customizerPanelBackground: "#F7F8FA",
  customizerPanelTextColor: "#151A21",
  customizerPanelMutedTextColor: "#68717F",
  customizerPanelBorderColor: "#CDD5DF",

  canvasBackground: "#EEF1F4",
  appBackground: "#F4F6F8",
  pageBackground: "#F8FAFC",
  sidebarBackground: "#FFFFFF",

  navBackground: "#FFFFFF",
  navBorderColor: "#D5DCE5",
  navTextColor: "#1F2937",
  navMutedTextColor: "#667085",
  navActiveBackground: "#D72F2F",
  navActiveTextColor: "#FFFFFF",
  navHoverBackground: "#F1F4F8",
  navHoverTextColor: "#111827",
  navLogoAreaBackground: "#FFFFFF",
  navWidth: 250,
  navItemHeight: 44,
  navItemRadius: 10,
  appBarBackground: "#FFFFFF",

  cardBackground: "#FFFFFF",
  cardElevatedBackground: "#FFFFFF",
  cardHeaderBackground: "#F4F6F8",
  listRowBackground: "#F6F8FA",
  metricBoxBackground: "#FFFFFF",

  borderColor: "#CDD5DF",
  borderOpacity: 0.95,

  buttonBackground: "#D72F2F",
  buttonTextColor: "#FFFFFF",
  buttonHoverColor: "#EC3B3B",
  buttonPressedColor: "#B72727",
  secondaryButtonBackground: "#EEF1F4",
  secondaryButtonTextColor: "#151A21",
  secondaryButtonHoverColor: "#E3E7EC",

  activeMenuColor: "#D72F2F",
  activeMenuTextColor: "#FFFFFF",
  inactiveMenuTextColor: "#485261",

  inputBackground: "#FFFFFF",
  inputBorder: "#CDD5DF",
  inputTextColor: "#151A21",
  inputPlaceholderColor: "#808A97",

  primaryTextColor: "#151A21",
  mutedTextColor: "#68717F",
  headingTextColor: "#111827",
  sidebarTextColor: "#151A21",
  sidebarMutedTextColor: "#68717F",

  h1Color: "#111827",
  h2Color: "#151A21",
  h3Color: "#151A21",

  brandTitleColor: "#111827",
  taglineColor: "#68717F",

  shadowStrength: 0.1,

  toggleTrackColor: "#D6DDE6",
  toggleTrackActiveColor: "#D72F2F",
  toggleThumbColor: "#FFFFFF",
  toggleHoverColor: "#EC3B3B"
};

export const paidDarkTemplate: UiTheme = {
  ...lawAidPremiumDark,
  id: "paidDarkTemplate",
  name: "PAID Dark Template",
  buttonBackground: "#8F7CFF",
  buttonHoverColor: "#A89AFF",
  activeMenuColor: "#8F7CFF",
  logoBackgroundColor: "#8F7CFF",
  logoInnerMark: "I"
};

export const paiSafeDarkTemplate: UiTheme = {
  ...lawAidPremiumDark,
  id: "paiSafeDarkTemplate",
  name: "PAI-SAFE Dark Template",
  buttonBackground: "#12A36A",
  buttonHoverColor: "#18C782",
  activeMenuColor: "#12A36A",
  logoBackgroundColor: "#12A36A",
  logoInnerMark: "…œ‚¬Å“"
};

export const commandCenterTemplate: UiTheme = {
  ...lawAidPremiumDark,
  id: "commandCenterTemplate",
  name: "Command Center Template",
  buttonBackground: "#D49B2F",
  buttonHoverColor: "#F0B642",
  activeMenuColor: "#D49B2F",
  logoBackgroundColor: "#D49B2F",
  logoInnerMark: "…‹Å“"
};

export const themePresets = [
  lawAidPremiumDark,
  lawAidPremiumLight,
  paidDarkTemplate,
  paiSafeDarkTemplate,
  commandCenterTemplate
];

export type ThemePresetId = typeof themePresets[number]["id"];

export function getThemePreset(id: string): UiTheme {
  return themePresets.find((theme) => theme.id === id) ?? lawAidPremiumDark;
}