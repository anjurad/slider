# External Config

Slider can load, update, and persist its configuration from outside the app.

Sources
- URL parameter: `slider.html?config=<url>` fetches JSON and applies it during init.
- File import: use the Style modal (🎨) → Import JSON to load a local file.
- Programmatic: post a message to the window with a config payload.
- Export: download the current config as JSON from the Style modal.

Persistence
- Toggle “Persist config to this browser” in the Style modal to save to `localStorage`.
- Keys:
  - `localStorage['slideapp.config']`: the saved config (when persistence is on).
  - `localStorage['slideapp.config.persist']`: `'1'|'0'` for the persist preference.

Schema (accepted keys)
```
{
  "appName": "SlideApp",
  "brand": "SlideApp", // legacy alias for appName
  "primary": "#01B4E1", "accent": "#64FFFC", "textColor": "#e2e8f0",
  "btnTextColor": "auto", // or "#rrggbb" for custom
  "btnFill": "solid",     // or "outline"
  "appBg1": "#0f172a", "appBg2": "#1e293b",
  "slideBg1": "#111827", "slideBg2": "#111827",
  "slideOpacity": 0.85, // 0..1
  "slideBorderOn": true, "slideBorderWidth": 3, // px 0..8
  "overlayOn": false, "overlayPos": "tl",
  "overlayTitleSize": 22, "overlaySubtitleOn": true,
  "overlaySubtitleSize": 16, "overlaySubtitleColor": "primary", // or "accent"
  "fontPrimary": "Inter, system-ui, ...",
  "fontSecondary": "Arial, Helvetica, ...",
  "rememberLastDeck": false,
  "hideSlidesWithUi": true,
  "hideProgressWithUi": true,
  "contentPos": "tl" // tl, tm, tr, ml, mm, mr, bl, bm, br
}
```
Unknown keys are ignored. Colors are normalized to `#rrggbb`. Numeric values are clamped.

Title precedence
- If the loaded deck provides `app-name` in frontmatter, the browser tab title uses that value.
- Otherwise, the tab title uses `config.appName` (or `brand`).

Examples
- URL param:
  - `slider.html?config=https://example.com/slideapp-config.json`
  - Remote origin must allow CORS.
- Programmatic API:
```
window.postMessage({
  type: 'slider.config',
  action: 'merge', // or 'replace'
  config: { primary: '#01B4E1', accent: '#64FFFC', contentPos: 'mm' }
}, '*');
```

Notes
- Presets remain available; external config simply overrides the active theme values.
- If persistence is off, changes apply for the current session only.
 - Button styling: `btnTextColor: "auto"` computes a readable text color against the theme; `btnFill: "outline"` removes the fill while preserving the outline.
