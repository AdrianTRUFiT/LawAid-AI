import React, { useMemo, useState } from "react";
import { ThemeProvider } from "../theme/ThemeProvider";
import {
  applyLayerColor,
  layerTargets,
  LayerTarget,
  safeParseThemeJson,
  themeControls,
  UiTheme
} from "../theme/themeSchema";
import { lawAidPremiumDark, lawAidPremiumLight, themePresets } from "../theme/themePresets";
import { LawAidProjectTemplate } from "../templates/LawAidProjectTemplate";

const customThemeId = "customTheme";

const labelMap: Record<string, string> = {
  colorMode: "Mode",
  trueBackground: "True outer background",
  customizerPanelBackground: "Customizer panel background",
  customizerPanelTextColor: "Customizer panel text",
  customizerPanelMutedTextColor: "Customizer panel muted text",
  customizerPanelBorderColor: "Customizer panel border",
  canvasBackground: "Main canvas background",
  appBackground: "App shell background",
  pageBackground: "Page background",
  sidebarBackground: "Preview sidebar background",
  appBarBackground: "App bar background",
  cardBackground: "Card background",
  cardElevatedBackground: "Elevated card background",
  cardHeaderBackground: "Card header background",
  listRowBackground: "List row background",
  metricBoxBackground: "Metric box background",
  borderColor: "Border color",
  borderOpacity: "Border opacity",
  navBackground: "Preview nav background",
  navBorderColor: "Preview nav border",
  navTextColor: "Preview nav text",
  navMutedTextColor: "Preview nav muted text",
  navActiveBackground: "Preview nav active background",
  navActiveTextColor: "Preview nav active text",
  navHoverBackground: "Preview nav hover background",
  navHoverTextColor: "Preview nav hover text",
  navLogoAreaBackground: "Preview nav logo area",
  navWidth: "Preview nav width",
  navItemHeight: "Preview nav item height",
  navItemRadius: "Preview nav item radius",
  buttonStyleMode: "Button style",
  buttonBackground: "Button background",
  buttonTextColor: "Button text",
  buttonHoverColor: "Button hover background",
  buttonPressedColor: "Button pressed background",
  buttonHoverTextColor: "Button hover text",
  buttonPressedTextColor: "Button pressed text",
  buttonWidth: "Button width",
  buttonHeight: "Button height",
  buttonMinWidth: "Button minimum width",
  buttonMaxWidth: "Button maximum width",
  buttonPaddingX: "Button horizontal padding",
  buttonPaddingY: "Button vertical padding",
  buttonFontSize: "Button font size",
  buttonFontWeight: "Button font weight",
  buttonLetterSpacing: "Button letter spacing",
  buttonTextTransform: "Button text case",
  buttonBorderWidth: "Button border width",
  buttonBorderColor: "Button border color",
  buttonShadowStrength: "Button shadow strength",
  secondaryButtonBackground: "Secondary button background",
  secondaryButtonTextColor: "Secondary button text",
  secondaryButtonHoverColor: "Secondary button hover",
  secondaryButtonPressedColor: "Secondary button pressed",
  secondaryButtonWidth: "Secondary button width",
  secondaryButtonHeight: "Secondary button height",
  secondaryButtonFontSize: "Secondary button font size",
  secondaryButtonBorderWidth: "Secondary button border width",
  secondaryButtonBorderColor: "Secondary button border color",
  activeMenuColor: "Active menu background",
  activeMenuTextColor: "Active menu text",
  inactiveMenuTextColor: "Inactive menu text",
  badgeVerifiedBg: "Verified badge background",
  badgeVerifiedText: "Verified badge text",
  badgePendingBg: "Pending badge background",
  badgePendingText: "Pending badge text",
  badgeReviewBg: "Review badge background",
  badgeReviewText: "Review badge text",
  badgeRefusedBg: "Refused badge background",
  badgeRefusedText: "Refused badge text",
  badgeFontWeight: "Badge font weight",
  badgeTextTransform: "Badge text case",
  inputBackground: "Input background",
  inputBorder: "Input border",
  inputTextColor: "Input text",
  inputPlaceholderColor: "Input placeholder",
  primaryTextColor: "Primary text",
  mutedTextColor: "Muted text",
  headingTextColor: "Heading text",
  sidebarTextColor: "Sidebar text",
  sidebarMutedTextColor: "Sidebar muted text",
  fontFamily: "Body font family",
  headingFontFamily: "Heading font family",
  bodyFontSize: "Body font size",
  bodyFontWeight: "Body font weight",
  bodyLetterSpacing: "Body letter spacing",
  headingSize: "Legacy heading size",
  headingFontWeight: "Legacy heading weight",
  headingLetterSpacing: "Legacy heading spacing",
  headingTextTransform: "Legacy heading case",
  h1Size: "H1 size",
  h1Weight: "H1 weight",
  h1Color: "H1 color",
  h1TextTransform: "H1 case",
  h1LetterSpacing: "H1 letter spacing",
  h2Size: "H2 size",
  h2Weight: "H2 weight",
  h2Color: "H2 color",
  h2TextTransform: "H2 case",
  h2LetterSpacing: "H2 letter spacing",
  h3Size: "H3 size",
  h3Weight: "H3 weight",
  h3Color: "H3 color",
  h3TextTransform: "H3 case",
  h3LetterSpacing: "H3 letter spacing",
  logoShape: "Logo shape",
  logoSize: "Logo size",
  logoBackgroundColor: "Logo background",
  logoIconColor: "Logo icon color",
  logoInnerMark: "Logo mark",
  logoInnerSize: "Logo mark size",
  logoInnerWeight: "Logo mark weight",
  brandTitleColor: "Brand title color",
  brandTitleSize: "Brand title size",
  brandTitleWeight: "Brand title weight",
  brandTitleTextTransform: "Brand title case",
  taglineColor: "Tagline color",
  taglineSize: "Tagline size",
  taglineWeight: "Tagline weight",
  taglineTextTransform: "Tagline case",
  taglineLetterSpacing: "Tagline spacing",
  toggleTrackColor: "Toggle track",
  toggleTrackActiveColor: "Toggle active track",
  toggleThumbColor: "Toggle thumb",
  toggleHoverColor: "Toggle hover",
  toggleRadius: "Toggle radius",
  toggleThumbRadius: "Toggle thumb radius",
  cardRadius: "Card radius",
  buttonRadius: "Button radius",
  spacingDensity: "Spacing density",
  shadowStrength: "Shadow strength",
  mobileLayoutDensity: "Mobile density",
  desktopLayoutDensity: "Desktop density",
  zIndexCustomizerPanel: "Layer order: customizer",
  zIndexSidebar: "Layer order: sidebar",
  zIndexAppBar: "Layer order: app bar",
  zIndexCards: "Layer order: cards"
};

const sections = [
  {
    title: "Core Controls",
    note: "Mode, true background, canvas, and main surfaces.",
    keys: ["colorMode", "trueBackground", "canvasBackground", "appBackground", "pageBackground"]
  },
  {
    title: "Backgrounds and Layers",
    note: "Cards, rows, boxes, borders, and preview layers.",
    keys: [
      "cardBackground", "cardElevatedBackground", "cardHeaderBackground",
      "listRowBackground", "metricBoxBackground", "borderColor", "borderOpacity"
    ]
  },
  {
    title: "Template Customizer Panel",
    note: "Controls the left editor panel only.",
    keys: [
      "customizerPanelBackground", "customizerPanelTextColor",
      "customizerPanelMutedTextColor", "customizerPanelBorderColor"
    ]
  },
  {
    title: "Preview Navigation",
    note: "Controls the preview app navigation only.",
    keys: [
      "sidebarBackground", "navBackground", "navBorderColor", "navTextColor",
      "navMutedTextColor", "navActiveBackground", "navActiveTextColor",
      "navHoverBackground", "navHoverTextColor", "navLogoAreaBackground",
      "navWidth", "navItemHeight", "navItemRadius"
    ]
  },
  {
    title: "Brand and Logo",
    note: "Logo, title, and tagline.",
    keys: [
      "logoShape", "logoSize", "logoBackgroundColor", "logoIconColor",
      "logoInnerMark", "logoInnerSize", "logoInnerWeight",
      "brandTitleColor", "brandTitleSize", "brandTitleWeight",
      "brandTitleTextTransform", "taglineColor", "taglineSize",
      "taglineWeight", "taglineTextTransform", "taglineLetterSpacing"
    ]
  },
  {
    title: "Buttons and Active States",
    note: "Button size, style, hover, pressed, active, and toggle controls.",
    keys: [
      "buttonStyleMode", "buttonBackground", "buttonTextColor", "buttonHoverColor",
      "buttonPressedColor", "buttonHoverTextColor", "buttonPressedTextColor",
      "buttonWidth", "buttonHeight", "buttonMinWidth", "buttonMaxWidth",
      "buttonPaddingX", "buttonPaddingY", "buttonFontSize", "buttonFontWeight",
      "buttonLetterSpacing", "buttonTextTransform", "buttonBorderWidth",
      "buttonBorderColor", "buttonShadowStrength", "buttonRadius",
      "secondaryButtonBackground", "secondaryButtonTextColor", "secondaryButtonHoverColor",
      "secondaryButtonPressedColor", "secondaryButtonWidth", "secondaryButtonHeight",
      "secondaryButtonFontSize", "secondaryButtonBorderWidth", "secondaryButtonBorderColor",
      "activeMenuColor", "activeMenuTextColor", "inactiveMenuTextColor",
      "toggleTrackColor", "toggleTrackActiveColor", "toggleThumbColor",
      "toggleHoverColor", "toggleRadius", "toggleThumbRadius"
    ]
  },
  {
    title: "Badges",
    note: "Badge colors and typography.",
    keys: [
      "badgeVerifiedBg", "badgeVerifiedText", "badgePendingBg", "badgePendingText",
      "badgeReviewBg", "badgeReviewText", "badgeRefusedBg", "badgeRefusedText",
      "badgeFontWeight", "badgeTextTransform"
    ]
  },
  {
    title: "Typography",
    note: "Fonts, body, H1, H2, H3, case, weight, and spacing.",
    keys: [
      "fontFamily", "headingFontFamily", "bodyFontSize", "bodyFontWeight",
      "bodyLetterSpacing", "primaryTextColor", "mutedTextColor", "headingTextColor",
      "headingSize", "headingFontWeight", "headingLetterSpacing", "headingTextTransform",
      "h1Size", "h1Weight", "h1Color", "h1TextTransform", "h1LetterSpacing",
      "h2Size", "h2Weight", "h2Color", "h2TextTransform", "h2LetterSpacing",
      "h3Size", "h3Weight", "h3Color", "h3TextTransform", "h3LetterSpacing"
    ]
  },
  {
    title: "Forms and Inputs",
    note: "Input surface, border, text, and placeholder.",
    keys: ["inputBackground", "inputBorder", "inputTextColor", "inputPlaceholderColor"]
  },
  {
    title: "Layout and Density",
    note: "Radius, spacing, shadows, density, and layer order.",
    keys: [
      "cardRadius", "spacingDensity", "shadowStrength",
      "mobileLayoutDensity", "desktopLayoutDensity",
      "zIndexCustomizerPanel", "zIndexSidebar", "zIndexAppBar", "zIndexCards"
    ]
  }
];

function normalizeHex(value: string): string {
  const raw = value.trim().toUpperCase();
  if (raw === "") return "#";
  const withHash = raw.startsWith("#") ? raw : `#${raw}`;
  return withHash.replace(/[^#A-F0-9]/g, "").slice(0, 7);
}

function safeText(value: string): string {
  return value.replace(/[^\x20-\x7E]/g, "").replace(/\s+/g, " ").trim();
}

function labelFor(key: string): string {
  return labelMap[key] ?? key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
}

export function ThemeCustomizer() {
  const [theme, setTheme] = useState<UiTheme>(themePresets[0]);
  const [selectedPresetId, setSelectedPresetId] = useState(themePresets[0].id);
  const [jsonDraft, setJsonDraft] = useState("");
  const [layerTarget, setLayerTarget] = useState<LayerTarget>("all");
  const [layerColor, setLayerColor] = useState("#FFFFFF");

  const exportedJson = useMemo(() => JSON.stringify(theme, null, 2), [theme]);

  const controlsByKey = useMemo(() => {
    const map = new Map<string, typeof themeControls[number]>();
    for (const control of themeControls) {
      map.set(String(control.key), control);
    }
    return map;
  }, []);

  function updateTheme(key: keyof UiTheme, value: string) {
    setSelectedPresetId(customThemeId);

    setTheme((current) => {
      const currentValue = current[key];
      const nextValue = typeof currentValue === "number" ? Number(value) : value;

      return {
        ...current,
        id: customThemeId,
        name: "Custom Theme",
        [key]: nextValue
      };
    });
  }

  function applyPreset(id: string) {
    if (id === customThemeId) {
      setSelectedPresetId(customThemeId);
      setTheme((current) => ({ ...current, id: customThemeId, name: "Custom Theme" }));
      return;
    }

    const preset = themePresets.find((item) => item.id === id);
    if (preset) {
      setSelectedPresetId(preset.id);
      setTheme({ ...preset });
      setJsonDraft("");
    }
  }

  function toggleMode() {
    const next = theme.colorMode === "dark" ? lawAidPremiumLight : lawAidPremiumDark;
    setSelectedPresetId(next.id);
    setTheme({ ...next });
  }

  function applyLayer() {
    setSelectedPresetId(customThemeId);
    setTheme((current) => ({
      ...applyLayerColor(current, layerTarget, normalizeHex(layerColor)),
      id: customThemeId,
      name: "Custom Theme"
    }));
  }

  function importJson() {
    setTheme((current) => ({
      ...safeParseThemeJson(jsonDraft, current),
      id: customThemeId,
      name: "Custom Theme"
    }));
    setSelectedPresetId(customThemeId);
  }

  function copyExport() {
    void navigator.clipboard?.writeText(exportedJson);
  }

  function renderControl(key: string) {
    const control = controlsByKey.get(key);
    if (!control) return null;

    return (
      <div className="customizer-row" key={key}>
        <label>{labelFor(key)}</label>

        {control.type === "select" ? (
          <select
            className="template-input"
            value={String(theme[control.key])}
            onChange={(event) => updateTheme(control.key, event.target.value)}
          >
            {(control.options ?? []).map((option) => (
              <option key={option} value={option}>
                {safeText(option)}
              </option>
            ))}
          </select>
        ) : control.type === "color" ? (
          <div className="color-control">
            <input
              type="color"
              value={String(theme[control.key])}
              onChange={(event) => updateTheme(control.key, event.target.value.toUpperCase())}
            />
            <input
              className="color-hex-input"
              type="text"
              value={String(theme[control.key])}
              placeholder="#FFFFFF"
              onChange={(event) => updateTheme(control.key, normalizeHex(event.target.value))}
            />
          </div>
        ) : (
          <input
            type={control.type === "text" ? "text" : "number"}
            min={control.min}
            max={control.max}
            step={control.step}
            value={String(theme[control.key])}
            onChange={(event) => updateTheme(control.key, event.target.value)}
          />
        )}
      </div>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <div className="template-builder">
        <aside className="template-builder-panel">
          <div className="customizer-panel-header">
            <h1 className="customizer-title">Template Customizer</h1>
            <p className="customizer-subtitle">
              Set the true background first, then tune preview layers. This panel stays static.
            </p>

            <div className="customizer-actions">
              <button className="template-button" type="button" onClick={toggleMode}>
                Switch to {theme.colorMode === "dark" ? "Light" : "Dark"} Mode
              </button>

              <select
                className="template-input"
                value={selectedPresetId}
                onChange={(event) => applyPreset(event.target.value)}
              >
                {themePresets.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {safeText(preset.name)}
                  </option>
                ))}
                <option value={customThemeId}>Custom Theme</option>
              </select>

              <button className="template-button" type="button" onClick={copyExport}>
                Copy Theme JSON
              </button>
            </div>
          </div>

          <div className="layer-studio">
            <p className="layer-studio-title">Layer Studio</p>
            <p className="layer-studio-note">
              Default target is All Preview Layers. The Template Customizer panel is protected.
            </p>

            <select
              className="template-input"
              value={layerTarget}
              onChange={(event) => setLayerTarget(event.target.value as LayerTarget)}
            >
              {layerTargets.map((target) => (
                <option key={target.id} value={target.id}>
                  {safeText(target.label)}
                </option>
              ))}
            </select>

            <div className="color-control">
              <input
                type="color"
                value={layerColor}
                onChange={(event) => setLayerColor(event.target.value.toUpperCase())}
              />
              <input
                className="color-hex-input"
                type="text"
                value={layerColor}
                placeholder="#FFFFFF"
                onChange={(event) => setLayerColor(normalizeHex(event.target.value))}
              />
            </div>

            <button className="template-button secondary" type="button" onClick={applyLayer}>
              Apply Color to Selected Layer
            </button>
          </div>

          <div className="customizer-accordion">
            {sections.map((section, index) => (
              <details className="customizer-section" key={section.title} open={index === 0}>
                <summary>
                  <span>{section.title}</span>
                  <small>{section.note}</small>
                </summary>

                <div className="customizer-grid">
                  {section.keys.map(renderControl)}
                </div>
              </details>
            ))}
          </div>

          <div className="customizer-actions">
            <p className="template-card-description">Exportable theme JSON</p>
            <textarea className="customizer-textarea" readOnly value={exportedJson} />

            <p className="template-card-description">Import theme JSON</p>
            <textarea
              className="customizer-textarea"
              value={jsonDraft}
              onChange={(event) => setJsonDraft(event.target.value)}
              placeholder="Paste theme JSON here..."
            />

            <button className="template-button secondary" type="button" onClick={importJson}>
              Import JSON
            </button>
          </div>
        </aside>

        <section className="template-builder-preview">
          <LawAidProjectTemplate />
        </section>
      </div>
    </ThemeProvider>
  );
}