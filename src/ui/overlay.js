(function(global){
  'use strict';

  function rebuildOverlays(tempPos){
    try{
      const w = global;
      const CONFIG = w.CONFIG || {};
      const slidesHTML = w.slidesHTML || [];
      const slides = Array.from(document.querySelectorAll('.slide'));
      // Remove existing overlays first
  slides.forEach(s => { try{ s.querySelector('.slide-overlay')?.remove(); }catch(e){ /* ignore cleanup error */ } });
      if(CONFIG.overlayOn === true && Array.isArray(slidesHTML) && slidesHTML.length){
        slides.forEach((slideEl, idx)=>{
          const fm = (slidesHTML[idx] && slidesHTML[idx].fm) || {};
          // Determine if overlay is enabled for this slide. If no explicit flag but
          // per-slide overlay settings exist, treat as ON (back-compat with aliases).
          const flagRaw = (typeof fm.overlay !== 'undefined')
            ? String(fm.overlay).trim()
            : (typeof fm['overlay-pos'] !== 'undefined' || typeof fm['title-size'] !== 'undefined' || typeof fm['subtitle-size'] !== 'undefined')
              ? 'on'
              : undefined;
          const slideOverlayFlag = (typeof flagRaw !== 'undefined') ? /^(1|on|true)$/i.test(flagRaw) : true;
          if(!slideOverlayFlag) return;

          const pos = (fm['overlay-pos'] || fm.overlaypos || tempPos || CONFIG.overlayPos || 'tl').toString().toLowerCase();
          const tSizeRaw = (typeof fm['title-size'] !== 'undefined') ? fm['title-size'] : fm.titlesize;
          const sSizeRaw = (typeof fm['subtitle-size'] !== 'undefined') ? fm['subtitle-size'] : fm.subtitlesize;
          const tSize = isFinite(Number(tSizeRaw)) ? Math.max(12, Math.min(64, Math.round(Number(tSizeRaw)))) : CONFIG.overlayTitleSize;
          const sSize = isFinite(Number(sSizeRaw)) ? Math.max(10, Math.min(48, Math.round(Number(sSizeRaw)))) : CONFIG.overlaySubtitleSize;
          const titleTxt = (fm.title||'').toString().trim() || `Slide ${idx+1}`;
          const subtitleTxt = (fm.subtitle||'').toString().trim();

          const wrap = document.createElement('div');
          wrap.className = `slide-overlay pos-${pos}`;
          if(tSize) wrap.style.setProperty('--title-size', `${tSize}px`);
          if(sSize) wrap.style.setProperty('--subtitle-size', `${sSize}px`);
          const tEl = document.createElement('div'); tEl.className='slide-title'; tEl.textContent = titleTxt; wrap.appendChild(tEl);
          if(CONFIG.overlaySubtitleOn===true && subtitleTxt){
            const sEl = document.createElement('div');
            sEl.className = 'slide-subtitle';
            sEl.textContent = subtitleTxt;
            if((CONFIG.overlaySubtitleColor||'primary')==='accent') sEl.classList.add('accent-subtitle');
            wrap.appendChild(sEl);
          }
          wrap.setAttribute('aria-hidden','true');
          slideEl.appendChild(wrap);
        });
      }
  }catch(e){ /* swallow overlay rebuild errors to avoid breaking UI */ }
  }

  global.OverlayCtrl = { rebuildOverlays };
})(typeof window!=='undefined' ? window : this);
