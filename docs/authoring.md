# Authoring Guide

This guide covers the frontmatter keys, per‑slide options, and validation so you can author decks confidently.

## Deck‑level frontmatter

Put a YAML‑like block at the very start of your Markdown file:

```
---
app-name: My Talk
theme-primary: "#01B4E1"
theme-accent: "#64FFFC"
theme-text: "#e2e8f0"
background: particles   # gradient | particles | off
defaults-title-size: 28 # 12..64
defaults-subtitle-size: 16 # 10..48
defaults-slide-opacity: 0.85 # 0..1 or 0..100 or '85%'
content-pos: mm         # tl|tm|tr|ml|mm|mr|bl|bm|br
---
```

Notes
- Title precedence: the browser tab uses `app-name` (when present). If absent, it uses the Style UI app name.
- Colors accept 3 or 6 digit hex (quotes optional) and are normalized internally.
- `content-pos` sets the default content block position within the slide frame.

## Per‑slide frontmatter

Slides are separated by a line that is exactly `---`. You can put a frontmatter block immediately after a separator to control that slide:

```
---
title: Slide A
subtitle: Demo
overlay: true                 # show slide title/subtitle overlay
overlay-pos: br               # tl|tr|bl|br
overlay-subtitle: on          # on|off|true|false|1|0
overlay-subtitle-size: 18     # 10..48
overlay-subtitle-color: accent# primary|accent
slide-bg1: "#0f172a"           # optional per‑slide background gradient start
slide-bg2: "#1e293b"           # optional per‑slide background gradient end
content-pos: mr               # per‑slide content position
---
```

## Validation

In‑app
- Click “Validate” (🔎) in the header to lint the current deck. Unknown keys or out‑of‑range values show clear messages; legacy keys include suggestions.

CLI
```
npm run validate:deck -- path/to/deck.md
```

What’s checked
- Unknown deck/slide keys (including support for the new `content-pos` and `overlay-subtitle*` keys).
- Value ranges (title/subtitle sizes, opacity, overlay positions, subtitle color).

## Static Site Mode

To publish decks from the repo:
- Place `.md` files under `content/`.
- Add them to `slides.json`:

```
{ "decks": [ { "title": "Demo", "path": "content/demo.md" } ] }
```

Open `slider.html` (Pages or local server). If `slides.json` lists multiple decks, a 📚 Decks button lets you pick one. You can deep‑link to a deck with `?deck=content/demo.md`.

## Tips
- Use the Style (🎨) modal to tweak colors, overlay defaults, and opacity while previewing slides. Save will persist to localStorage if “Persist” is enabled.
- Keyboard: B (background), T (opacity), U (UI), O (outline), S (slides), N (notes).

## Button styling

Global controls that affect the application buttons (header, footer, and controls):

- Button text color
  - Deck key: `button-text-color: auto | <#rrggbb>`
  - Style UI: “Button text color” → Auto or Custom
  - Behavior:
    - `auto` chooses a readable black/white based on your theme’s primary/accent mix.
    - `#rrggbb` uses the supplied color exactly.
- Button fill
  - Deck key: `button-fill: solid | outline`
  - Style UI: “Button fill” → Solid or Outline
  - Behavior:
    - Solid uses the theme gradient fill (default).
    - Outline removes the fill but keeps the button outline/border and text color.

External config
- JSON keys mirror the Style UI / deck keys:
  - `btnTextColor`: "auto" | "#rrggbb"
  - `btnFill`: "solid" | "outline"

Validation
- The validator accepts these keys. Unknown values (e.g., `button-fill: glass`) will be flagged with a clear message.

