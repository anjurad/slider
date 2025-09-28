---
app-name: Slider Launchpad
theme-primary: "#007ACC"
theme-accent: "#3C9DFF"
theme-text: "#d4d4d4"
background: gradient
ui: on
---
---
title: Slider Launchpad
subtitle: Six fast slides that show what Slider can do
notes: Arrow keys navigate • Press B for backgrounds • Try O to toggle slide outlines
---
<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:28px;padding:3rem 1rem;text-align:center;">
  <h1 style="margin:0;font-size:clamp(3.5rem,8vw,5.5rem);font-weight:800;background:linear-gradient(120deg,var(--primary),var(--accent));-webkit-background-clip:text;color:transparent;">
    Build presentations that make an entrance
  </h1>
  <p style="max-width:680px;font-size:1.35rem;line-height:1.5;color:var(--text);opacity:.88;">
    Slider mixes Markdown, HTML, and live theming so you can move from idea to polished deck in minutes—no pipeline or build step required.
  </p>
  <div style="display:flex;flex-wrap:wrap;gap:16px;justify-content:center;">
    <a class="btn" href="https://github.com/anjurad/slider" style="padding:14px 28px;font-size:1rem;">View on GitHub</a>
    <a class="btn" href="#workflow" style="padding:14px 28px;font-size:1rem;border-color:rgba(255,255,255,.32);">Jump to workflow</a>
  </div>
</div>

---
## Style controls that respond instantly

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;align-items:start;">
  <div>
    <p>Open the 🎨 Style modal and everything reacts live: presets, button fill, contrast detection, and slide opacity.</p>
    <ul>
      <li>Toggle between outline + solid buttons without losing readability.</li>
      <li>Presets ship with curated palettes and accessible contrasts.</li>
      <li>Use <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>S</kbd> to save and persist the config.</li>
    </ul>
  </div>
  <div style="background:var(--card);padding:24px;border-radius:18px;box-shadow:var(--shadow);display:flex;flex-direction:column;gap:18px;">
    <div style="display:flex;gap:12px;">
      <button class="btn" style="padding:10px 18px;border-color:var(--accent);">Outline</button>
      <button class="btn" style="padding:10px 18px;opacity:.5;">Solid</button>
    </div>
    <div style="display:grid;gap:12px;font-size:0.95rem;">
      <div><strong>Preset</strong>: Arctic Daylight<div style="height:6px;border-radius:999px;background:linear-gradient(90deg,#5E81AC,#88C0D0);"></div></div>
      <div><strong>Auto contrast</strong>: Button text switched to <code>#2E3440</code></div>
      <div><strong>Keyboard</strong>: <kbd>O</kbd> toggles outlines · <kbd>B</kbd> cycles backgrounds</div>
    </div>
  </div>
</div>

---
## Layouts love Markdown + HTML

<figure style="margin:0;background:var(--card);padding:24px;border-radius:16px;box-shadow:var(--shadow);display:grid;gap:18px;">
  <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200" alt="Team collaborating" style="width:100%;border-radius:12px;object-fit:cover;">
  <figcaption style="font-size:0.95rem;opacity:.8;">Use Markdown for structure and sprinkle HTML for layout tweaks, captions, or responsive embeds.</figcaption>
</figure>

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px;margin-top:20px;">
  <div>
    <h3>Column blocks</h3>
    <p>Use ::: columns shortcodes or simple flexbox to compare features side by side.</p>
  </div>
  <div>
    <h3>Media ready</h3>
    <p>Drop in videos, diagrams, or code sandboxes—Slider doesn’t purge your HTML.</p>
  </div>
  <div>
    <h3>Custom overlays</h3>
    <p>Overlay title/subtitle positions snap to a 3×3 grid with per-slide overrides.</p>
  </div>
</div>

---
## Developer workflow, simplified {#workflow}

```js
window.postMessage({
  type: 'slider.config',
  action: 'merge',
  config: {
    primary: '#007ACC',
    btnFill: 'outline',
    slideOpacity: 0.85
  }
}, '*');
```

<aside style="margin-top:18px;background:var(--card);padding:20px;border-radius:14px;box-shadow:0 12px 24px rgba(0,0,0,.18);">
  <strong>Tooling perks</strong>
  <ul>
    <li>Hotkeys for outline, opacity, notes, thumbnails, and UI.</li>
    <li>Persist configs in `localStorage['slider.config']`.</li>
    <li>CLI validation via <code>npm run validate:deck</code>.</li>
  </ul>
</aside>

---
## Accessibility baked in

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px;align-items:center;">
  <div>
    <meter min="0" max="100" value="96" style="width:100%;height:20px;">96</meter>
    <p style="margin-top:12px;">The default presets clear WCAG AA contrast checks (96% score in internal testing).</p>
  </div>
  <ul>
    <li>Respect <strong>prefers-reduced-motion</strong> and fall back to gradients.</li>
    <li>Outline and button borders default to <strong>1&nbsp;px</strong> for crisp focus states.</li>
    <li>Auto contrast adjusts button text when you choose outline fills.</li>
  </ul>
</div>

---
## Ready to build your deck?

<div style="display:flex;flex-direction:column;gap:20px;max-width:680px;">
  <p>Clone the repo, drop Markdown into <code>content/</code>, update <code>slides.json</code>, and publish straight from GitHub Pages.</p>
  <div style="display:flex;flex-wrap:wrap;gap:16px;">
    <a class="btn" href="https://github.com/anjurad/slider#readme" style="padding:12px 24px;">Read the docs</a>
    <a class="btn" href="https://github.com/anjurad/slider/tree/main/content" style="padding:12px 24px;">See example decks</a>
    <a class="btn" href="https://github.com/anjurad/slider/issues/new" style="padding:12px 24px;">Share feedback</a>
  </div>
  <small style="opacity:.7;">Tip: press <kbd>?</kbd> inside Slider to open the keyboard shortcut legend.</small>
</div>
