
---
title: Welcome to SlideApp
subtitle: Quick feature tour
notes: Quick tour of features. Try arrow keys, notes, background, drawer, and UI modes.
  Use the keyboard shortcuts: b (background), s (slides), n (notes), f (fullscreen), u (UI), p (progress), t (opacity), o (outline).
background: particles
appname: Bytes
primary: "#01B4E1"
accent: "#64FFFC"
# You can specify opacity as a percent (e.g., 37%), as a number 0-100, or as a decimal 0-1
opacity: 100%
# UI can be: on/off/show/hide/true/false/1/0 (off hides header/footer)
ui: on
# Typography and overlay defaults (deck-level)
primaryfont: Arial
secondaryfont: "SF Pro Text"
# Overlay can be on/off/true/false/1/0
overlay: on
# Position: tl | tr | bl | br
overlaypos: tl
# Title size (px): 12..64; Subtitle size (px): 10..48
titlesize: 48
overlaysubtitle: on
overlaysubtitlesize: 22
# Subtitle color: primary | accent
overlaysubtitlecolor: accent
---

# Hello, SlideApp

- Bullet points
- Links like [Example](https://example.com)
- Use keyboard shortcuts while presenting

- New shortcuts: O (outline), P (progress), T (opacity 0% ⇄ baseline)

---
title: Style & Outline
subtitle: Accent Outline
notes: This slide demonstrates the accent-colored outline and how to toggle it. Press O to toggle the outline on/off. Change the Accent color in Style and Save to see the outline color update and persist.
---

## Outline Demo

- Outline uses the Accent color and is on by default
- Press O to toggle the outline
- Change Accent in Style and press Save to persist color
- Reset restores outline default (on); session toggles revert on reload

---
title: Tips & Shortcuts
subtitle: Keys, UI, and persistence
notes: Quick reference to all hotkeys and useful actions. Save to persist style changes (colors, opacity, outline). Reset restores defaults; session-only toggles revert on reload.
---

## Tips & Shortcuts

- Background: B cycles background modes
- Slides drawer: S toggles thumbnails
- Notes panel: N toggles notes
- Fullscreen: F enters/leaves fullscreen
- UI mode: U toggles header/footer (UI on/off)
- Progress: P toggles progress (bar, arrows, count). P override resets on UI toggle and deck load
- Opacity: T toggles 0% ⇄ last saved baseline. Update baseline via Style > Save; Reset restores 100%
- Outline: O toggles accent-colored slide outline. Default is on; Save persists; Reset restores on
- Clear preset: One-click 0% opacity
- Frontmatter: Use appname, primary, accent, opacity, ui, background to set defaults on deck load

---
title: Opacity & Clear
subtitle: Baseline, toggle, and reset
notes: Opacity can be set with the slider, saved as your baseline, toggled with T between 0% and the saved baseline, and cleared with one click via the Clear preset.
---

## Opacity & Clear
---
title: SlideApp Demo — Style & Backgrounds
subtitle: Fast, focused, and brandable
notes: This deck demonstrates the new Style pickers for App and Slide backgrounds, plus front-matter usage. Open 🎨 Style to experiment and Save to persist.
appname: "SlideApp Demo"
primary: "#0F62FE"
accent: "#00D084"
appbg1: "#071029"
appbg2: "#072b2e"
slidebg1: "#0b1220"
slidebg2: "#111827"
effectcolor: "#00D084"
opacity: 95%
overlay: on
overlaypos: tl
---

# Welcome — SlideApp Demo

Welcome — this short deck highlights the new Style pickers and front-matter integration.

- Open "🎨 Style" to change App & Slide backgrounds with the color pickers.
- Save to persist settings to localStorage; deck front-matter still takes precedence.

---

title: Why SlideApp?
subtitle: Simple, fast, markdown-first

- Small single-file app — runs offline
- Front-matter controls deck defaults and per-slide overrides
- Style UI for instant live preview + persistence

Notes: Use the Style modal to set brand, opacity, and both app and slide backgrounds.

---

title: Try the Style picker
subtitle: App & Slide backgrounds

notes: Open 🎨 Style → pick App BG 1/2 to change the chrome gradient. Pick Slide BG 1/2 to set the default slide gradient. Save to persist.

## Live demo

Change colors and hit Save. Then reload to verify persistence.

---

title: Per-slide override — White
subtitle: Pure white slide background

slidebg1: "#ffffff"
slidebg2: "#ffffff"

notes: This slide uses a per-slide override to force a clean white canvas for screenshots or print-friendly slides.

## White Background
Use for diagrams, print exports, or high-contrast visuals.

---

title: Per-slide override — Accent Gradient
subtitle: Focus the room

slidebg1: "#0f5ad3"
slidebg2: "#ff7ab6"

notes: Per-slide overrides are set in the slide's front-matter and take precedence over deck defaults.

## Accent Gradient
Use for section intros or hero slides to draw attention.

---

title: Tips for presenters
subtitle: Quick best practices

- Use deck-level front-matter for consistent branding
- Use per-slide overrides sparingly for emphasis
- Save Style settings to persist between sessions

---

title: Thanks
subtitle: Try it now

- Open 🎨 Style and experiment with App/Slide pickers
- Load your own .md and ship slides quickly

Notes: Visit the repository for examples and advanced front-matter keys.

