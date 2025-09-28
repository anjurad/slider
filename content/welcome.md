---
app-name: Slider Static Mode
notes: This deck ships with the repo; customise it to onboard your team quickly.
theme-primary: "#007ACC"
theme-accent: "#3C9DFF"
theme-text: "#d4d4d4"
background: gradient
ui: on
---
<div style="display:flex;flex-direction:column;justify-content:center;align-items:flex-start;height:100%;padding:3rem 2rem;gap:18px;">
  <h1 style="margin:0;font-size:clamp(2.5rem,6vw,4rem);">Deploy decks from your repository</h1>
  <p style="max-width:680px;line-height:1.6;">This static build of <strong>Slider</strong> serves Markdown straight from the <code>content/</code> folder. Fork the repo, customise colours, and publish on GitHub Pages or any static host—no server, no build pipeline.</p>
  <div style="display:flex;gap:16px;flex-wrap:wrap;">
    <a class="btn" href="https://github.com/anjurad/slider" style="padding:12px 22px;">Fork the repo</a>
    <a class="btn" href="https://github.com/anjurad/slider/blob/main/slides.json" style="padding:12px 22px;border-color:rgba(255,255,255,.32);">View slides.json</a>
  </div>
</div>

---
## Wire up your decks

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;align-items:start;">
  <div>
    <h3>1. Add Markdown</h3>
    <p>Drop files inside <code>content/</code>. Each <code>--- </code> separator becomes a slide, so keep them focused.</p>
  </div>
  <div>
    <h3>2. Register in slides.json</h3>
    <pre style="background:var(--card);padding:16px;border-radius:12px;">{
  "decks": [
    { "title": "Launch", "path": "content/welcome.md" }
  ]
}</pre>
  </div>
  <div>
    <h3>3. Publish</h3>
    <p>Serve <code>slider.html</code> from GitHub Pages, Netlify, or any static host. Slider handles theming, persistence, and keyboard shortcuts automatically.</p>
  </div>
</div>

---
## Helpful shortcuts

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px;">
  <div style="background:var(--card);padding:18px;border-radius:12px;">
    <h3>Style &amp; layout</h3>
    <ul>
      <li><kbd>O</kbd> — Toggle slide outline</li>
      <li><kbd>B</kbd> — Cycle background modes</li>
      <li><kbd>T</kbd> — Adjust slide opacity</li>
    </ul>
  </div>
  <div style="background:var(--card);padding:18px;border-radius:12px;">
    <h3>Navigating</h3>
    <ul>
      <li><kbd>←</kbd>/<kbd>→</kbd> — Previous/next slide</li>
      <li><kbd>N</kbd> — Toggle presenter notes</li>
      <li><kbd>S</kbd> — Open thumbnails drawer</li>
    </ul>
  </div>
  <div style="background:var(--card);padding:18px;border-radius:12px;">
    <h3>Persistence</h3>
    <ul>
      <li>Config stored in <code>localStorage['slider.config']</code></li>
      <li>Deck resume via <code>slider.persist.deck</code></li>
      <li>Disable via "Persist config" toggle in the Style modal</li>
    </ul>
  </div>
</div>
