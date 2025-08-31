#!/usr/bin/env node
/*
 Validate a Markdown deck for Slider.
 - Warns on unknown keys and invalid values for deck-level and per-slide frontmatter
 - Suggests modern namespaced keys for legacy keys
 Usage:
   node dev-tools/validate-deck.js path/to/deck.md
 */

const fs = require('fs');
const path = require('path');

function readFile(p){ return fs.readFileSync(p, 'utf8'); }

function normalizeNewlines(s){ return s.replace(/\r\n?/g, '\n'); }
function unquote(s){ return String(s||'').trim().replace(/^['"]|['"]$/g, ''); }

// Allowed keys and migration suggestions
const migrationMap = new Map([
  // Deck-level colors & theme
  ['primary', 'theme-primary'],
  ['accent', 'theme-accent'],
  ['textColor', 'theme-text'],
  ['text-color', 'theme-text'],
  ['text', 'theme-text'],
  ['effectColor', 'effect-color'],
  ['effect', 'effect-color'],
  ['appname', 'app-name'],
  ['brand', 'app-name'],
  ['appBg1', 'defaults-slide-bg1'],
  ['app-bg1', 'defaults-slide-bg1'],
  ['app-bg-1', 'defaults-slide-bg1'],
  ['appBg2', 'defaults-slide-bg2'],
  ['app-bg2', 'defaults-slide-bg2'],
  ['app-bg-2', 'defaults-slide-bg2'],
  ['slideOpacity', 'defaults-slide-opacity'],
  ['opacity', 'defaults-slide-opacity'],
  ['primaryFont', 'font-primary'],
  ['secondaryFont', 'font-secondary'],
  // Deck overlay defaults
  ['overlayPos', 'defaults-overlay-pos'],
  ['titlePosition', 'defaults-overlay-pos'],
  ['titleSize', 'defaults-title-size'],
  ['overlaySubtitleSize', 'defaults-subtitle-size'],
  ['subtitleSize', 'defaults-subtitle-size'],
  ['overlaySubtitle', 'defaults-overlay'],
  ['subtitleEnabled', 'defaults-overlay'],
  // Per-slide
  ['overlaypos', 'overlay-pos'],
  ['titlesize', 'title-size'],
  ['subtitlesize', 'subtitle-size'],
  ['slidebg1', 'slide-bg1'],
  ['slidebg2', 'slide-bg2'],
  // New aliases
  ['overlaysubtitle', 'overlay-subtitle'],
  ['overlaysubtitlecolor', 'overlay-subtitle-color'],
]);

const allowedDeck = new Set([
  // Theme/App
  'app-name', 'appname', 'brand',
  'theme-primary', 'theme-accent', 'theme-text',
  'primary', 'accent', 'textColor', 'text-color', 'text',
  'background', 'effect-color', 'effectColor', 'effect', 'ui',
  'font-primary', 'font-secondary', 'primaryFont', 'secondaryFont',
  // Defaults
  'defaults-overlay', 'defaults-overlay-pos',
  'defaults-title-size', 'defaults-subtitle-size',
  'defaults-slide-opacity', 'defaults-slide-bg1', 'defaults-slide-bg2',
  // Legacy app-bg as deck defaults
  'appBg1', 'appBg2', 'app-bg1', 'app-bg2', 'app-bg-1', 'app-bg-2',
  // Legacy opacity
  'opacity', 'slideOpacity',
  // Newer deck-level keys
  'content-pos', 'overlay-subtitle-size', 'overlay-subtitle-color', 'overlaysubtitle', 'subtitleEnabled', 'overlaysubtitlecolor',
]);

const allowedSlide = new Set([
  'title', 'subtitle', 'notes',
  'overlay', 'overlay-pos', 'overlaypos',
  'title-size', 'titlesize',
  'subtitle-size', 'subtitlesize',
  'slide-bg1', 'slide-bg2', 'slidebg1', 'slidebg2',
  // New per-slide keys
  'content-pos', 'overlay-subtitle', 'overlay-subtitle-size', 'overlay-subtitle-color', 'overlaysubtitle', 'overlaysubtitlecolor',
]);

function isHex(s){ const x = unquote(s); return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(x); }
function isBgMode(s){ return ['gradient','particles','off'].includes(String(s).trim().toLowerCase()); }
function isBoolLike(s){ return /^(on|off|show|hide|true|false|1|0)$/i.test(String(s).trim()); }
function isOverlayPos(s){ return ['tl','tr','bl','br'].includes(String(s).trim().toLowerCase()); }
function isContentPos(s){ return /^[tmb][lmr]$/i.test(String(s).trim()); }
function isSubtitleColor(s){ return /^(accent|primary)$/i.test(String(s).trim()); }
function clamp(n, lo, hi){ n=Number(n); if(!isFinite(n)) return null; return Math.max(lo, Math.min(hi, n)); }
function parseOpacity(raw){
  const s = String(raw||'').trim(); if(!s) return null;
  if(/%$/.test(s)) return clamp(parseFloat(s), 0, 100);
  const num = parseFloat(s);
  if(!isFinite(num)) return null;
  if(num<=1) return clamp(num*100, 0, 100);
  return clamp(num, 0, 100);
}

function parseFrontmatterAtStart(text){
  const src = normalizeNewlines(text);
  const t = src.trimStart();
  if(!t.startsWith('---')) return { fm:{}, body: src };
  const lines = t.split('\n');
  let endIndex = -1;
  for(let i=1;i<lines.length;i++){
    const raw = lines[i]; const tr=raw.trim();
    if((raw.startsWith('---')||raw.startsWith('...')) && (tr==='---'||tr==='...')){ endIndex=i; break; }
  }
  if(endIndex<=0) return { fm:{}, body: src };
  const fm = {}; let key=null, val=[];
  for(let i=1;i<endIndex;i++){
    const raw=lines[i];
    const m = raw.match(/^\s*([^:\s][^:]*)\s*:\s*(.*)$/);
    if(m){ if(key){ fm[key] = val.join(' ').trim(); } key = m[1].trim(); val=[(m[2]||'').trim()]; }
    else if(key){ val.push(raw.trim()); }
  }
  if(key){ fm[key] = val.join(' ').trim(); }
  const body = lines.slice(endIndex+1).join('\n');
  return { fm, body };
}

// Scan slides and per-slide FM (approximation of app logic; keeps key compat)
function scanSlidesFMs(text){
  let md = normalizeNewlines(text);
  if(md.startsWith('\uFEFF')) md = md.slice(1);
  const lines = md.split('\n');
  const slides=[]; let buf=[]; let atStart=true; let inFM=false; let inFence=false; let fenceToken=''; let inComment=false; let inHtmlBlock=false;
  const isSep = (t)=> t==='---';
  function fenceToggle(t){ const m=t.match(/^(```+|~~~+)/); if(!m) return false; const tok=m[1]; if(!inFence){ inFence=true; fenceToken=tok; } else if(tok===fenceToken){ inFence=false; fenceToken=''; } return true; }
  function commentToggle(line){ if(/<!--/.test(line)) { inComment=true; return true; } if(/-->/.test(line)) { inComment=false; return true; } return false; }
  function htmlBlockToggle(t){ if(/^<pre\b/i.test(t)) { inHtmlBlock=true; return true; } if(/^<\/pre>\s*$/.test(t)) { inHtmlBlock=false; return true; } return false; }
  function looksLikeFrontmatter(i){ let sawKey=false; for(let j=i+1;j<Math.min(lines.length, i+15);j++){ const tj=lines[j].trim(); if(tj==='---'||tj==='...') return sawKey; if(/^\s*$/.test(tj)) continue; if(/^[^\s][^:]*:\s*.*$/.test(tj)) sawKey=true; else return false; } return false; }
  function pushSlide(){ const content=buf.join('\n').trim(); if(content) slides.push(content); buf=[]; atStart=true; inFM=false; }
  for(let i=0;i<lines.length;i++){
    const line=lines[i]; const t=line.trim();
    if(fenceToggle(t)) { buf.push(line); if(t!=='') atStart=false; continue; }
    if(commentToggle(line)) { buf.push(line); if(t!=='') atStart=false; continue; }
    if(htmlBlockToggle(t)) { buf.push(line); if(t!=='') atStart=false; continue; }
    if(inFM){ buf.push(line); if(isSep(t) || t==='...') { inFM=false; } continue; }
    if(isSep(t) && !inFence && !inComment && !inHtmlBlock){
      if(atStart){ inFM=true; buf.push(line); continue; }
      if(looksLikeFrontmatter(i)){ pushSlide(); buf=[]; atStart=true; inFM=true; buf.push(line); continue; }
      pushSlide(); continue;
    }
    buf.push(line); if(t!=='') atStart=false;
  }
  pushSlide();
  // Extract per-slide FM keys
  const perSlide = [];
  for(const s of slides){
    const { fm } = parseFrontmatterAtStart(s);
    perSlide.push(fm);
  }
  return perSlide;
}

function validateDeck(deckPath){
  const src = readFile(deckPath);
  const { fm: deckFM } = parseFrontmatterAtStart(src);
  const slideFMs = scanSlidesFMs(src).slice(1); // exclude deck-level if present

  const warnings = [];
  const add = (msg) => warnings.push(msg);

  // Validate deck keys
  for(const [rawKey, rawVal] of Object.entries(deckFM)){
    const key = String(rawKey).trim();
    if(!allowedDeck.has(key)){
      const sug = migrationMap.get(key);
      add(`Deck: unknown key '${key}'${sug? ` (did you mean '${sug}'?)`: ''}`);
    }
    if(migrationMap.has(key)){
      add(`Deck: legacy key '${key}' — prefer '${migrationMap.get(key)}'`);
    }
    const v = rawVal;
    switch(key){
      case 'theme-primary': case 'theme-accent': case 'theme-text':
      case 'primary': case 'accent': case 'textColor': case 'text-color': case 'text':
      case 'effect-color': case 'effectColor': case 'effect':
      case 'defaults-slide-bg1': case 'defaults-slide-bg2':
      case 'appBg1': case 'appBg2': case 'app-bg1': case 'app-bg2': case 'app-bg-1': case 'app-bg-2':
        if(!isHex(v)) add(`Deck: '${key}' expects hex color, got '${v}'`);
        break;
      case 'background':
        if(!isBgMode(v)) add(`Deck: 'background' must be gradient|particles|off, got '${v}'`);
        break;
      case 'ui':
        if(!isBoolLike(v)) add(`Deck: 'ui' must be on|off|show|hide|true|false|1|0, got '${v}'`);
        break;
      case 'defaults-overlay':
        if(!isBoolLike(v)) add(`Deck: 'defaults-overlay' must be true|false|on|off|1|0, got '${v}'`);
        break;
      case 'defaults-overlay-pos':
        if(!isOverlayPos(v)) add(`Deck: 'defaults-overlay-pos' must be tl|tr|bl|br, got '${v}'`);
        break;
      case 'defaults-title-size':
        if(clamp(v,12,64)===null) add(`Deck: 'defaults-title-size' must be a number 12..64, got '${v}'`);
        break;
      case 'defaults-subtitle-size':
        if(clamp(v,10,48)===null) add(`Deck: 'defaults-subtitle-size' must be a number 10..48, got '${v}'`);
        break;
      case 'defaults-slide-opacity': case 'opacity': case 'slideOpacity':
        if(parseOpacity(v)===null) add(`Deck: '${key}' must be 0..100, 0..1, or a percent string, got '${v}'`);
        break;
      case 'font-primary': case 'font-secondary': case 'primaryFont': case 'secondaryFont':
        if(!String(v||'').trim()) add(`Deck: '${key}' should be a non-empty font list`);
        break;
      case 'content-pos':
        if(!isContentPos(v)) add(`Deck: 'content-pos' must be tl|tm|tr|ml|mm|mr|bl|bm|br, got '${v}'`);
        break;
      case 'overlay-subtitle-size':
        if(clamp(v,10,48)===null) add(`Deck: 'overlay-subtitle-size' must be a number 10..48, got '${v}'`);
        break;
      case 'overlay-subtitle-color': case 'overlaysubtitlecolor':
        if(!isSubtitleColor(v)) add(`Deck: '${key}' must be primary|accent, got '${v}'`);
        break;
      case 'overlaysubtitle': case 'subtitleEnabled':
        if(!isBoolLike(v)) add(`Deck: '${key}' must be true|false|on|off|1|0, got '${v}'`);
        break;
    }
  }

  // Validate per-slide keys
  slideFMs.forEach((fm, idx)=>{
    const n = idx+1;
    for(const [rawKey, rawVal] of Object.entries(fm)){
      const key = String(rawKey).trim();
      if(!allowedSlide.has(key)){
        const sug = migrationMap.get(key);
        add(`Slide ${n}: unknown key '${key}'${sug? ` (did you mean '${sug}'?)`: ''}`);
      }
      if(migrationMap.has(key)){
        add(`Slide ${n}: legacy key '${key}' — prefer '${migrationMap.get(key)}'`);
      }
      const v = rawVal;
      switch(key){
        case 'slide-bg1': case 'slide-bg2': case 'slidebg1': case 'slidebg2':
          if(!isHex(v)) add(`Slide ${n}: '${key}' expects hex color, got '${v}'`);
          break;
        case 'overlay':
          if(!isBoolLike(v)) add(`Slide ${n}: 'overlay' must be true|false|on|off|1|0, got '${v}'`);
          break;
        case 'overlay-pos': case 'overlaypos':
          if(!isOverlayPos(v)) add(`Slide ${n}: '${key}' must be tl|tr|bl|br, got '${v}'`);
          break;
        case 'title-size': case 'titlesize':
          if(clamp(v,12,64)===null) add(`Slide ${n}: '${key}' must be a number 12..64, got '${v}'`);
          break;
        case 'subtitle-size': case 'subtitlesize':
          if(clamp(v,10,48)===null) add(`Slide ${n}: '${key}' must be a number 10..48, got '${v}'`);
          break;
        case 'content-pos':
          if(!isContentPos(v)) add(`Slide ${n}: 'content-pos' must be tl|tm|tr|ml|mm|mr|bl|bm|br, got '${v}'`);
          break;
        case 'overlay-subtitle':
          if(!isBoolLike(v)) add(`Slide ${n}: 'overlay-subtitle' must be true|false|on|off|1|0, got '${v}'`);
          break;
        case 'overlay-subtitle-size':
          if(clamp(v,10,48)===null) add(`Slide ${n}: 'overlay-subtitle-size' must be a number 10..48, got '${v}'`);
          break;
        case 'overlay-subtitle-color': case 'overlaysubtitlecolor':
          if(!isSubtitleColor(v)) add(`Slide ${n}: '${key}' must be primary|accent, got '${v}'`);
          break;
      }
    }
  });

  return warnings;
}

function main(){
  const file = process.argv[2];
  if(!file){
    console.error('Usage: node dev-tools/validate-deck.js path/to/deck.md');
    process.exit(2);
  }
  const p = path.resolve(process.cwd(), file);
  if(!fs.existsSync(p)){
    console.error(`File not found: ${p}`);
    process.exit(2);
  }
  const warnings = validateDeck(p);
  if(!warnings.length){
    console.log(`✔ Deck is valid: ${file}`);
    process.exit(0);
  }
  console.log(`⚠ Found ${warnings.length} warning(s):`);
  for(const w of warnings){ console.log(' - ' + w); }
  // Non-zero to integrate with CI if desired
  process.exit(1);
}

if(require.main === module){ main(); }
