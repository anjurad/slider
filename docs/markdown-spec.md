# Markdown Handling Specification

Last updated: 2025-08-31

This document describes how the single-file app (`slider.html`) parses Markdown, applies frontmatter, splits slides, sanitizes HTML, and maps results to application behavior and styling. It is a code-accurate baseline for future optimizations.

## Scope and Entrypoints

- Core functions in `slider.html`:
  - `parseFrontmatter(text)` — parse YAML-like frontmatter block.
  - `parseMarkdown(md, opts)` — convert Markdown to HTML with a few extensions.
  - `splitSlides(md)` — split a deck into slides, with per-slide frontmatter.
  - `applyDeckFrontmatter(fm)` — apply deck-level settings (colors, modes, overlay, etc.).
- Rendering pipeline:
  1) Load text (upload/restore/sample) → 2) `splitSlides` → 3) `renderSlides` → 4) `applyDeckFrontmatter` → 5) build per-slide overlays.

## Loading Sources

- Upload: `#fileInput` accepts `.md/.markdown/.txt` (MIME guard). Size limit 5 MB. Empty files rejected.
- Restore order:
  1) Session restore from `sessionStorage['slideapp.session.deck']` (always attempted).
  2) Persistent restore from `localStorage['slideapp.persist.deck']` if `CONFIG.rememberLastDeck` is true.
  3) Fallback fetch of `sample_presentation.md`; if unavailable, an embedded demo deck is used.
- Persistence when loading:
  - Saves `{ deckContent, fileName, loadedAt }` to sessionStorage.
  - Also saves to localStorage when `CONFIG.rememberLastDeck === true`.
  - Very large decks (> ~2.5 MB) are not persisted.

## Slide Splitting Rules

Normalization and guards
- Normalizes newlines to `\n` and strips BOM.
- Tracks regions to avoid splitting on `---` inside:
  - Fenced code blocks: ``` or ~~~ (length ≥ 3), matched by the same fence.
  - HTML comments: `<!-- ... -->`.
  - Simple HTML blocks (e.g., `<pre>…</pre>`), via a lightweight start/stop toggle.

Frontmatter and separators
- A line containing only `---` at the true start of a slide opens frontmatter; it closes on a dedicated `---` or `...` line at true line start.
- If `---` appears mid-slide and the following content “looks like frontmatter,” it ends the current slide and starts a new slide with frontmatter.
- Otherwise, a standalone `---` is treated as a slide separator (when not inside guarded regions).
- Lines of 4+ hyphens are treated as horizontal rules and ignored at a fresh slide start (do not force a split).

Per-slide processing
- Each slide string is parsed with `parseFrontmatter` (per-slide FM), then the remaining body is converted with `parseMarkdown`.
- Fenced ````notes` sections inside a slide body are extracted to `fm.notes` and removed from the rendered HTML.

## Frontmatter Format

Syntax
- YAML-like `key: value` lines between the opening and closing fence.
- Keys are case-insensitive; values may span multiple lines by continuing lines without a `key:` pattern.
- Hex color values may be quoted; quotes are stripped and normalized.

Deck-level frontmatter (file start)
- Background mode:
  - Keys: `background`, `bg`.
  - Values: `gradient` | `particles` | `off`.
  - Effect: sets background mode and button label.
- App name / brand:
  - Keys: `appname`, `app-name`, `brand` (legacy).
  - Effect: sets `CONFIG.appName` and (legacy) `CONFIG.brand`.
- Colors (hex, normalized):
  - Primary: `primary` or `theme-primary` → `CONFIG.primary`.
  - Accent: `accent` or `theme-accent` → `CONFIG.accent`.
  - App background: `appBg1` | `app-bg1` | `app-bg-1` → `CONFIG.appBg1`; `appBg2` | `app-bg2` | `app-bg-2` → `CONFIG.appBg2`.
  - Effect color: `effectColor` | `effect-color` | `effect` → `CONFIG.effectColor`.
  - Text color: `textColor` | `text-color` | `text` | `theme-text` → `CONFIG.textColor`.
- Opacity:
  - Keys: `opacity`, `slideOpacity`, `defaults-slide-opacity`.
  - Accepted: percent string with `%`, decimal `0..1`, or number `0..100`; clamped to 0–100.
  - Stored as decimal `CONFIG.slideOpacity`; applies slide background CSS (`--slide-bg1/2`, `--slide-blur`, `--slide-shadow`, `--slide-opacity`).
- Typography:
  - `primaryFont` | `font-primary` → `CONFIG.fontPrimary`; `secondaryFont` | `font-secondary` → `CONFIG.fontSecondary`.
- Title overlay (deck defaults with legacy/namespaced aliases):
  - Enable: `overlay` (true/on/1) or `titleOverlay` (legacy).
  - Position: `overlayPos` | `titlePosition` | `defaults-overlay-pos` ∈ {`tl`,`tr`,`bl`,`br`}.
  - Sizes: `titleSize` | `defaults-title-size` (12–64 px), `overlaySubtitleSize` | `subtitleSize` | `defaults-subtitle-size` (10–48 px).
  - Subtitle toggle: `overlaySubtitle` | `subtitleEnabled` (false/off/0 disables).
  - Subtitle color: `overlaySubtitleColor` ∈ {`primary`,`accent`}.
- UI mode:
  - Key: `ui` ∈ {on/show/true/1, off/hide/false/0}.
  - Effect: toggles chrome visibility; persisted to `localStorage['uiMode']`.

Per-slide frontmatter (applies to individual slides)
- Background overrides (hex): `slideBg1` | `slide-bg1`, `slideBg2` | `slide-bg2`.
  - Effect: inline gradient override for that slide; attributes `data-slide-bg-override`, `data-slidebg1`, `data-slidebg2` set for inspection.
- Title/subtitle: `title`, `subtitle`.
  - Title also used for thumbnail label; fallback `Slide N`.
- Overlay per-slide:
  - `overlay` true/on/1 shows, false/off/0 hides (respects deck default when unspecified). If unspecified but `overlay-pos`, `title-size`, or `subtitle-size` are present, overlay is treated as on for that slide.
  - `overlay-pos`, `title-size`, `subtitle-size` override deck defaults (legacy `overlaypos`, `titlesize`, `subtitlesize` also accepted).
- Notes: ` ```notes ... ``` ` sections extracted to `fm.notes`.

## Markdown Features

- Fenced code blocks:
  - Fences ``` or ~~~ with optional language → `<pre><code class="lang-...">…</code></pre>`; contents HTML-escaped.
  - Preserved with placeholders during parsing to avoid interference.
- Inline code: `` `code` `` → `<code>`.
- Strikethrough: `~~text~~` → `<del>text</del>`.
- Columns shortcode:
  - `::: columns` … `:::col` … `:::` → `<div class="cols"><div class="col">…</div>…</div>`.
  - Nested content parsed recursively with columns disabled to prevent recursion.
- Headings: `#`, `##`, `###` at line start → `<h1>`, `<h2>`, `<h3>`.
- Linkable headings: The same headings receive `id` attributes based on a slug of their text (lowercased, punctuation stripped, spaces to dashes), e.g. `## Feature Comparison` → `<h2 id="feature-comparison">…</h2>`.
- Blockquotes: `> ` prefix → `<blockquote>`.
- Images: `![alt](url)` → `<img ...>` with safe, inline presentation styles.
- Links: `[text](url)` → `<a target="_blank" rel="noopener">`.
- Autolink literals: bare `http(s)://…` URLs in text become links with `target="_blank"` and `rel="noopener"`.
- Tables (GFM): header row, separator row (`---` with optional `:` for alignment), and body rows; per-column alignment supported.
- Lists: `-`/`*` unordered, `1.` ordered; opens/closes `<ul>/<ol>` appropriately.
- Task lists: `- [ ] item`, `- [x] item` render as list items with a visual indicator `☐`/`☑` and class `task`.
- Emphasis: `**bold**`, `*italic*`.
- Paragraphs: split on double newlines; avoids wrapping block-level elements and code placeholders; single `\n` becomes `<br>` inside paragraphs.

### Admonitions

- Syntax: `::: note|tip|warning` … content … `:::`
- Output: wraps content as

  `<div class="admonition kind">`
  `<div class="admonition-title">Kind</div>`
  `<div class="admonition-body">…rendered markdown…</div>`
  `</div>`

Examples
- `::: note` … `:::` → `<div class="admonition note">…</div>`
- `::: tip` … `:::` → `<div class="admonition tip">…</div>`
- `::: warning` … `:::` → `<div class="admonition warning">…</div>`

Notes
- Headings include `id`s; sanitizer allows `id` and hash links (`href="#slug"`). External links retain `target`/`rel`.
- Use the in‑app “📑 TOC” to jump to any heading (h1–h3) across slides.

## Authoring Quick Examples

- Strikethrough

  `We are ~~deprecated~~ moving forward.`

- Task list

  - [ ] Collect feedback
  - [x] Ship 1.0.1

- Admonitions

  ::: note
  Heads up: Slides now support admonitions.
  :::

  ::: tip
  Pro tip: Use the TOC (📑) to jump between sections.
  :::

  ::: warning
  Warning: Don’t overuse effects; clarity wins.
  :::

- Autolink literals

  Visit https://example.com for more.

- Anchors

  ## Getting Started
  Click the “#” icon on hover to copy a direct link to this heading.
 
## Overlay Behaviour

- Reserved (default): Content is padded so it never sits under the overlay. Predictable and clutter‑free.
- Float: No padding; overlay floats above content.
- Auto: Overlay gently fades and increases padding when content overlaps; restores when overlap ends (tracked for enhancement in GH#18).

Implementation notes
- Slide content scrolls inside a dedicated container, while the frame (outline) remains fixed.
- The slide frame is positioned clear of the toolbar and progress bar via CSS variables for consistent spacing.

## Sanitization and Safety

- Disallowed tags removed: `script`, `style`, `iframe`, `object`, `embed`.
- Allowed attributes: `class`, `href`, `src`, `alt`, `title`, `target`, `rel`, `style`.
- Styles: only a curated set of properties is retained (layout, spacing, color, background, size, opacity, etc.).
- Images: `src` must be `http(s)` or `data:image/*`.
- Links: bare `www.` and protocol-relative URLs normalized to `https://…`; forced `target="_blank"` and `rel="noopener"`.

## Styling and Behavior Mapping

- Theme application:
  - Uses `window.Theme.applyConfig` when available (fallback to inline `applyConfig`).
  - Sets CSS vars: `--primary`, `--accent`, `--text`, `--btn-bg`, `--muted` (derived), `--app-bg1/2`, `--effect-color`, slide opacity vars, fonts `--font-primary/secondary`, `--outline-w`, and overlay sizes `--title-size/--subtitle-size`.
  - Toggles classes like `border-off` via helpers.
- Background mode:
  - `gradient`/`particles`/`off` reflected in classes and the background button label; honors reduced-motion.
- Overlays:
  - Built after rendering when `CONFIG.overlayOn` is true; per-slide FM can hide/override position and sizes; subtitle adopts deck color choice.
- Thumbnails:
  - Title text from per-slide `title` (fallback `Slide N`); accessible roles/labels; active thumb shows a primary→accent gradient background.
- UI mode:
  - `ui` deck FM toggles chrome visibility; progress/slides drawer can temporarily override and are reset on UI toggle/deck load.

## Persistence and Determinism

- Session key: `slideapp.session.deck` (always used when present and valid).
- Persistent key: `slideapp.persist.deck` (used only when configured to remember).
- Deterministic test mode hook (`window.__isDeterministicTestMode()`): when enabled in tests, clears stored background mode and prefers `gradient` to keep visuals stable.

## Constraints and Limits

- Upload limit: 5 MB; very large decks (> ~2.5 MB) are not persisted.
- Accepted types: `.md`, `.markdown`, `.txt` plus common text MIME types.
- Hex colors accepted with or without quotes; normalized to `#rrggbb`.

## Accessibility Notes

- Thumbnails are keyboard-activatable buttons (`role="button"`, `tabindex="0"`, `Enter`/`Space` handling, ARIA labels).
- Slide overlays are marked `aria-hidden="true"` to avoid duplicating text for assistive tech.

## Non‑Goals and Known Behavior
## What’s New (Authoring Highlights)

- Strikethrough: `~~deprecated~~` → ~deprecated~
- Task lists: `- [ ] item`, `- [x] item` with clear visual check marks
- Admonitions: `::: note|tip|warning … :::` with title and body
- Autolink literals: bare `http(s)://…` become links
- Linkable headings: h1–h3 get stable `id`s; click the “#” on hover to copy a link
- In‑app TOC: click “📑 TOC” to browse h1–h3 and jump to slides


- Markdown subset: intentionally lightweight; no full CommonMark; feature set is driven by tests and core app needs.
- Math/diagrams/footnotes/admonitions are not built-in (candidates for future additions).

## Migration Guide (Legacy → Namespaced)

Use the right column where possible; legacy keys remain supported but may emit warnings in validation.

- Theme & App
  - primary → theme-primary
  - accent → theme-accent
  - textColor | text-color | text → theme-text
  - appname | brand → app-name
  - effectColor | effect → effect-color
  - primaryFont → font-primary
  - secondaryFont → font-secondary

- Defaults (Deck-level)
  - overlay → defaults-overlay (for default visibility)
  - overlayPos | titlePosition → defaults-overlay-pos
  - titleSize → defaults-title-size
  - overlaySubtitleSize | subtitleSize → defaults-subtitle-size
  - opacity | slideOpacity → defaults-slide-opacity
  - appBg1 → defaults-slide-bg1
  - appBg2 → defaults-slide-bg2

- Per-slide
  - overlaypos → overlay-pos
  - titlesize → title-size
  - subtitlesize → subtitle-size
  - slidebg1 → slide-bg1
  - slidebg2 → slide-bg2

Validation Tool
- Run `npm run validate:deck -- <file.md>` to surface unknown keys and invalid values, with suggestions for namespaced keys.
