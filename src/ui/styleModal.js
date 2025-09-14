(function(global){
  'use strict';

  function withSafe(fn){ try{ return fn(); }catch(e){ /* noop */ return undefined; } }
  const w = global;
  function normalizeHexLocal(s){
    try{
      if(w.ThemeCore && typeof w.ThemeCore.normalizeHex === 'function') return w.ThemeCore.normalizeHex(s);
    }catch(e){ /* ignore */ }
    const str = String(s||'').trim();
    if(!str) return '';
    const m = str.match(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
    if(!m) return '';
    const hex = m[1];
    if(hex.length===3){ return '#' + hex.split('').map(ch=>ch+ch).join('').toLowerCase(); }
    return '#' + hex.toLowerCase();
  }

  function init(){
    const cfgOverlay = document.getElementById('cfgOverlay');
    const cfgModal   = document.getElementById('cfgModal');
    const openBtn    = document.getElementById('styleBtn');
    if(!cfgOverlay || !cfgModal || !openBtn) return;

    function open(){
      cfgOverlay.style.display='block';
      cfgModal.style.display='flex';
      withSafe(()=>{ document.getElementById('cfgName').value=((w.CONFIG?.appName)||w.CONFIG?.brand||''); });
      // colors & backgrounds
      withSafe(()=>{ const pNorm = normalizeHexLocal(w.CONFIG?.primary||'') || '#01B4E1'; document.getElementById('cfgPrimary').value = pNorm; });
      withSafe(()=>{ const aNorm = normalizeHexLocal(w.CONFIG?.accent||'') || '#64FFFC'; document.getElementById('cfgAccent').value = aNorm; });
      withSafe(()=>{
        const appBg1 = normalizeHexLocal(w.CONFIG?.appBg1) || normalizeHexLocal(getComputedStyle(document.documentElement).getPropertyValue('--app-bg1').trim()) || '#0f172a';
        const appBg2 = normalizeHexLocal(w.CONFIG?.appBg2) || normalizeHexLocal(getComputedStyle(document.documentElement).getPropertyValue('--app-bg2').trim()) || '#1e293b';
        const slideBg1 = normalizeHexLocal(w.CONFIG?.slideBg1) || '#111827';
        const slideBg2 = normalizeHexLocal(w.CONFIG?.slideBg2) || '#111827';
        document.getElementById('cfgAppBg1').value = appBg1;
        document.getElementById('cfgAppBg2').value = appBg2;
        document.getElementById('cfgSlideBg1').value = slideBg1;
        document.getElementById('cfgSlideBg2').value = slideBg2;
      });
      // text & button controls
      withSafe(()=>{
        const txt = normalizeHexLocal(w.CONFIG?.textColor) || normalizeHexLocal(getComputedStyle(document.documentElement).getPropertyValue('--text').trim()) || '#e2e8f0';
        document.getElementById('cfgTextColor').value = txt;
        const modeSel = document.getElementById('cfgBtnTextMode');
        const btnClr = document.getElementById('cfgBtnTextColor');
        const vRaw = (w.CONFIG?.btnTextColor||'auto');
        const v = typeof vRaw==='string' ? vRaw.trim().toLowerCase() : '';
        const isAuto = (v === 'auto' || !v);
        modeSel.value = isAuto ? 'auto' : 'custom';
        if(!isAuto){ const n = normalizeHexLocal(String(w.CONFIG?.btnTextColor)); btnClr.value = n || '#ffffff'; }
        btnClr.disabled = isAuto;
        const applyModeChange = ()=>{
          const isA = (modeSel.value==='auto');
          btnClr.disabled = isA;
          if(isA){ w.CONFIG.btnTextColor = 'auto'; }
          else {
            let start = normalizeHexLocal(String(btnClr.value||''));
            withSafe(()=>{
              if(!start){
                const cs = getComputedStyle(document.documentElement);
                const cur = (cs.getPropertyValue('--btn-text')||'').trim();
                start = normalizeHexLocal(cur) || '#ffffff';
              }
            });
            btnClr.value = start || '#ffffff';
            w.CONFIG.btnTextColor = start || '#ffffff';
          }
          withSafe(()=>{ w.Theme && w.Theme.applyConfig && w.Theme.applyConfig(w.CONFIG); });
        };
        modeSel.onchange = applyModeChange;
        modeSel.oninput = applyModeChange;
        btnClr.addEventListener('click', ()=>{
          if(btnClr.disabled){
            modeSel.value = 'custom'; btnClr.disabled = false;
            const n = normalizeHexLocal(String(btnClr.value||'')) || '#ffffff';
            w.CONFIG.btnTextColor = n;
            withSafe(()=>{ w.Theme && w.Theme.applyConfig && w.Theme.applyConfig(w.CONFIG); });
          }
        });
        const bf=document.getElementById('cfgBtnFill'); bf.value = (w.CONFIG?.btnFill==='outline'?'outline':'solid');
        const bwElInit = document.getElementById('cfgBtnBorderWidth');
        const bwReadInit = document.getElementById('cfgBtnBorderWidthVal');
        if(bwElInit){
          const chosen = (typeof w.CONFIG?.btnBorderWidth==='number' && isFinite(w.CONFIG?.btnBorderWidth))
            ? Math.max(1, Math.min(6, Math.round(w.CONFIG.btnBorderWidth)))
            : (bf.value==='outline' ? 2 : 1);
          bwElInit.value = String(chosen);
          if(bwReadInit) bwReadInit.textContent = `(${chosen}px)`;
          bwElInit.oninput = (e)=>{ const n=Math.max(1, Math.min(6, Math.round(Number(e.target.value)||chosen))); if(bwReadInit) bwReadInit.textContent = `(${n}px)`; w.CONFIG.btnBorderWidth = n; withSafe(()=>{ w.Theme && w.Theme.applyConfig && w.Theme.applyConfig(w.CONFIG); }); withSafe(()=>{ typeof w.applyConfig==='function' && w.applyConfig(); }); };
        }
      });
      // live bindings
      withSafe(()=>{
        const bindLive=(id,key,norm)=>{ const el=document.getElementById(id); if(!el) return; el.oninput=(ev)=>{ const v=(ev.target.value||'').toString(); withSafe(()=>{ if(norm){ const n=normalizeHexLocal(v); if(n) w.CONFIG[key]=n; else delete w.CONFIG[key]; } else { w.CONFIG[key]=v; } });
          // Apply via runtime helper and page helper for full UI refresh
          withSafe(()=>{ if(w.Theme && typeof w.Theme.applyConfig === 'function'){ try{ w.Theme.applyConfig(w.CONFIG); }catch(e){ /* ignore */ } } });
          withSafe(()=>{ if (typeof w.applyConfig==='function'){ try{ w.applyConfig(); }catch(e){ /* ignore */ } } });
        }; };
        bindLive('cfgPrimary','primary', false);
        bindLive('cfgAccent','accent', false);
        bindLive('cfgTextColor','textColor', true);
        const modeSel = document.getElementById('cfgBtnTextMode');
        const btnClr = document.getElementById('cfgBtnTextColor');
  btnClr.oninput = ()=>{ if(modeSel.value==='custom'){ const n=normalizeHexLocal(btnClr.value||''); if(n) w.CONFIG.btnTextColor = n; withSafe(()=>{ w.Theme && w.Theme.applyConfig && w.Theme.applyConfig(w.CONFIG); }); withSafe(()=>{ typeof w.applyConfig==='function' && w.applyConfig(); }); } };
  modeSel.onchange = ()=>{ if(modeSel.value==='auto'){ w.CONFIG.btnTextColor = 'auto'; } else { const n=normalizeHexLocal(btnClr.value||''); if(n) w.CONFIG.btnTextColor = n; } withSafe(()=>{ w.Theme && w.Theme.applyConfig && w.Theme.applyConfig(w.CONFIG); }); withSafe(()=>{ typeof w.applyConfig==='function' && w.applyConfig(); }); };
        const fillSel = document.getElementById('cfgBtnFill');
  fillSel.onchange = ()=>{ const v=String(fillSel.value||'solid').toLowerCase(); w.CONFIG.btnFill = (v==='outline'?'outline':'solid');
    try{ const bwEl = document.getElementById('cfgBtnBorderWidth'); const bwRead = document.getElementById('cfgBtnBorderWidthVal'); if(bwEl){ let n = Math.max(1, Math.min(6, Math.round(Number(bwEl.value)|| (v==='outline'?2:1)))); if(!(typeof w.CONFIG.btnBorderWidth==='number')){ n = (v==='outline'?2:1); bwEl.value = String(n); } if(bwRead) bwRead.textContent = `(${n}px)`; w.CONFIG.btnBorderWidth = n; } }
    catch(e){ /* ignore */ }
    withSafe(()=>{ w.Theme && w.Theme.applyConfig && w.Theme.applyConfig(w.CONFIG); }); withSafe(()=>{ typeof w.applyConfig==='function' && w.applyConfig(); }); withSafe(()=>{ setTimeout(()=>{ document.getElementById('cfgSave')?.scrollIntoView({block:'center'}); }, 0); }); };
        bindLive('cfgAppBg1','appBg1', true);
        bindLive('cfgAppBg2','appBg2', true);
        bindLive('cfgSlideBg1','slideBg1', true);
        bindLive('cfgSlideBg2','slideBg2', true);
      });
      // presets
      withSafe(()=>{
        const row=document.getElementById('presetRow'); row.innerHTML='';
        const makeGroup = (title)=>{ const container=document.createElement('div'); container.style.display='flex'; container.style.flexDirection='column'; container.style.gap='6px'; const label=document.createElement('label'); label.style.fontSize='12px'; label.textContent=title; const group=document.createElement('div'); group.style.display='flex'; group.style.gap='6px'; group.setAttribute('role','toolbar'); container.appendChild(label); container.appendChild(group); return {container, group}; };
        const darkGroup = makeGroup('Dark presets');
        const lightGroup = makeGroup('Light presets');
        const setActivePreset = (idx)=>{ [...row.querySelectorAll('button.preset-btn')].forEach(b=>{ const on = b.dataset.presetIndex===String(idx); b.classList.toggle('active', on); b.setAttribute('aria-pressed', on? 'true':'false'); }); };
        const presets = (w.PRESETS || globalThis.PRESETS || []);
        presets.forEach((p,idx)=>{
          const b=document.createElement('button'); b.className='btn preset-btn'; b.textContent=p.name; b.title = `Apply ${p.name}`; b.dataset.presetIndex = String(idx); b.setAttribute('aria-pressed','false');
          withSafe(()=>{ b.style.removeProperty('color'); });
          withSafe(()=>{ b.style.borderColor = 'rgba(255,255,255,0.06)'; });
          b.onclick = ()=>{
            withSafe(()=>{ document.getElementById('cfgPrimary').value = p.primary; });
            withSafe(()=>{ document.getElementById('cfgAccent').value = p.accent; });
            withSafe(()=>{ if(p.textColor) document.getElementById('cfgTextColor').value = p.textColor; });
            withSafe(()=>{ if(p.appBg1) document.getElementById('cfgAppBg1').value = p.appBg1; });
            withSafe(()=>{ if(p.appBg2) document.getElementById('cfgAppBg2').value = p.appBg2; });
            withSafe(()=>{ if(p.slideBg1) document.getElementById('cfgSlideBg1').value = p.slideBg1; });
            withSafe(()=>{ if(p.slideBg2) document.getElementById('cfgSlideBg2').value = p.slideBg2; });
            withSafe(()=>{
              const nPrimary = normalizeHexLocal(p.primary) || p.primary;
              const nAccent = normalizeHexLocal(p.accent) || p.accent;
              w.CONFIG.primary = nPrimary;
              w.CONFIG.accent = nAccent;
              if(p.textColor){ const nt = normalizeHexLocal(p.textColor) || p.textColor; w.CONFIG.textColor = nt; } else { delete w.CONFIG.textColor; }
              if(p.appBg1) w.CONFIG.appBg1 = normalizeHexLocal(p.appBg1) || p.appBg1; else delete w.CONFIG.appBg1;
              if(p.appBg2) w.CONFIG.appBg2 = normalizeHexLocal(p.appBg2) || p.appBg2; else delete w.CONFIG.appBg2;
              if(p.slideBg1) w.CONFIG.slideBg1 = normalizeHexLocal(p.slideBg1) || p.slideBg1; else delete w.CONFIG.slideBg1;
              if(p.slideBg2) w.CONFIG.slideBg2 = normalizeHexLocal(p.slideBg2) || p.slideBg2; else delete w.CONFIG.slideBg2;
              // Apply via both paths for consistency with page-level side effects
              withSafe(()=>{ if(w.Theme && typeof w.Theme.applyConfig === 'function'){ try{ w.Theme.applyConfig(w.CONFIG); }catch(e){ /* ignore */ } } });
              withSafe(()=>{ if (typeof w.applyConfig==='function'){ try{ w.applyConfig(); }catch(e){ /* ignore */ } } });
              w.setSlideOpacity && w.setSlideOpacity(typeof w.CONFIG.slideOpacity==='number' ? Math.round(w.CONFIG.slideOpacity*100) : 100, false);
            });
            setActivePreset(idx);
            withSafe(()=>{ w.showToast && w.showToast(`Preset: ${p.name}`); });
          };
          if(p.group==='dark') darkGroup.group.appendChild(b); else lightGroup.group.appendChild(b);
        });
        if(darkGroup.group.children.length){ row.appendChild(darkGroup.container); }
        if(lightGroup.group.children.length){ row.appendChild(lightGroup.container); }
        withSafe(()=>{ const raw = localStorage.getItem('slideapp.config'); if(!raw){ const defaultIdx = presets.findIndex(p=>p.name && p.name.toLowerCase()==='default'); if(defaultIdx>=0) setActivePreset(defaultIdx); } });
      });
      // opacity slider
      withSafe(()=>{
        const slider = document.getElementById('cfgSlideOpacity');
        const readout = document.getElementById('cfgSlideOpacityVal');
        const val = typeof w.CONFIG?.slideOpacity==='number'? Math.round(w.CONFIG.slideOpacity*100):100;
        slider.value = String(val);
        readout.textContent = `(${val}%)`;
        slider.oninput = (e)=>{ const pct = Number(e.target.value)||0; readout.textContent = `(${pct}%)`; w.setSlideOpacity && w.setSlideOpacity(pct); };
      });
      // UI toggles & outline width
      withSafe(()=>{
        const hideSlides = document.getElementById('cfgHideSlidesWithUi');
        const hideProg = document.getElementById('cfgHideProgressWithUi');
        const remember = document.getElementById('cfgRememberDeck');
        const outlineChk = document.getElementById('cfgSlideOutline');
        const owEl = document.getElementById('cfgOutlineWidth');
        const owRead = document.getElementById('cfgOutlineWidthVal');
        if(hideSlides) hideSlides.checked = !!w.CONFIG.hideSlidesWithUi;
        if(hideProg) hideProg.checked = !!w.CONFIG.hideProgressWithUi;
        if(remember) remember.checked = !!w.CONFIG.rememberLastDeck;
        if(outlineChk) outlineChk.checked = (w.CONFIG.slideBorderOn !== false);
        if(owEl){
          const n = (typeof w.CONFIG.slideBorderWidth === 'number' && isFinite(w.CONFIG.slideBorderWidth))
            ? Math.max(0, Math.min(8, Math.round(w.CONFIG.slideBorderWidth)))
            : 3;
          owEl.value = String(n);
          if(owRead) owRead.textContent = `(${n}px)`;
        }
      });
      // overlay title/subtitle & fonts
  withSafe(()=>{
        const posWrap = document.getElementById('cfgOverlayPos');
        const posHint = document.getElementById('cfgOverlayPosHint');
        const tSize = document.getElementById('cfgTitleSize');
        const sSize = document.getElementById('cfgSubtitleSize');
        const cbTitle = document.getElementById('cfgOverlayTitleOn');
        const cbSub  = document.getElementById('cfgOverlaySubtitleOn');
        const sc     = document.getElementById('cfgSubtitleColor');
        const setPosDisabled=(d)=>{ [...posWrap.querySelectorAll('button')].forEach(b=>{ if(d){ b.setAttribute('disabled',''); b.setAttribute('aria-disabled','true'); } else { b.removeAttribute('disabled'); b.setAttribute('aria-disabled','false'); } }); if(posHint){ posHint.style.display = d ? 'inline' : 'none'; } };
        const setSizeDisabled=(d)=>{ tSize.disabled = d; };
        // Disable subtitle checkbox only when overlay itself is off, but
        // keep it enabled when toggling subtitle visibility so users can
        // re-enable it without re-opening the modal.
        const setSubtitleOptionsDisabled=(d)=>{ sSize.disabled = d; sc.disabled = d; };
        const setSubtitleControlsDisabled=(d)=>{ cbSub.disabled = d; setSubtitleOptionsDisabled(d); };
        const cur = ((w.CONFIG?.overlayPos)||'tl').toLowerCase();
        const setActive=(p)=>{ [...posWrap.querySelectorAll('button')].forEach(btn=>{ const on = (btn.dataset.pos===p); btn.classList.toggle('active', on); btn.setAttribute('aria-pressed', on? 'true':'false'); }); };
        setPosDisabled(!(w.CONFIG?.overlayOn===true));
        setSizeDisabled(!(w.CONFIG?.overlayOn===true));
        setSubtitleControlsDisabled(!(w.CONFIG?.overlayOn===true));
        setActive(cur);
        const ts = Math.max(12, Math.min(64, Math.round(Number(w.CONFIG?.overlayTitleSize)||22)));
        const ss = Math.max(10, Math.min(48, Math.round(Number(w.CONFIG?.overlaySubtitleSize)||16)));
        document.getElementById('cfgTitleSize').value = String(ts);
        document.getElementById('cfgTitleSizeVal').textContent = `(${ts}px)`;
        document.getElementById('cfgSubtitleSize').value = String(ss);
        document.getElementById('cfgSubtitleSizeVal').textContent = `(${ss}px)`;
        const cb = document.getElementById('cfgOverlaySubtitleOn'); cb.checked = (w.CONFIG?.overlaySubtitleOn !== false);
        sc.value = ((w.CONFIG?.overlaySubtitleColor)==='accent' ? 'accent' : 'primary');
        if(cbTitle) cbTitle.checked = (w.CONFIG?.overlayOn===true);
        document.getElementById('cfgTitleSize').oninput = (e)=>{ const px=Math.max(12, Math.min(64, Math.round(Number(e.target.value)||22))); document.getElementById('cfgTitleSizeVal').textContent = `(${px}px)`; w.CONFIG.overlayTitleSize = px; withSafe(()=>{ w.Theme && w.Theme.applyFontOutline && w.Theme.applyFontOutline({ overlayTitleSize: px }); }); };
        document.getElementById('cfgSubtitleSize').oninput = (e)=>{ const px=Math.max(10, Math.min(48, Math.round(Number(e.target.value)||16))); document.getElementById('cfgSubtitleSizeVal').textContent = `(${px}px)`; w.CONFIG.overlaySubtitleSize = px; withSafe(()=>{ w.Theme && w.Theme.applyFontOutline && w.Theme.applyFontOutline({ overlaySubtitleSize: px }); }); };
        // Title on/off inside Style UI: enable/disable position and sizes immediately
        if(cbTitle){
          cbTitle.onchange = ()=>{
            const on = !!cbTitle.checked;
            w.CONFIG.overlayOn = on;
            setPosDisabled(!on);
            setSizeDisabled(!on);
            // Subtitle controls follow the overlay on/off state as well
            setSubtitleControlsDisabled(!on);
            // Rebuild overlays live so the change is visible immediately
            withSafe(()=>{ (w.OverlayCtrl && w.OverlayCtrl.rebuildOverlays) ? w.OverlayCtrl.rebuildOverlays(w.__tempOverlayPos || cur) : (w.rebuildOverlays && w.rebuildOverlays(w.__tempOverlayPos || cur)); });
          };
        }
        cb.onchange = ()=>{ const on = cb.checked; setSubtitleOptionsDisabled(!on); w.CONFIG.overlaySubtitleOn = on; withSafe(()=>{ (w.OverlayCtrl && w.OverlayCtrl.rebuildOverlays) ? w.OverlayCtrl.rebuildOverlays(w.__tempOverlayPos || cur) : (w.rebuildOverlays && w.rebuildOverlays(w.__tempOverlayPos || cur)); }); };
        posWrap.querySelectorAll('button').forEach(btn=>{
          btn.setAttribute('aria-pressed', btn.dataset.pos===cur ? 'true' : 'false');
          btn.onclick=()=>{ const pos = btn.dataset.pos; setActive(pos); withSafe(()=>{ w.__tempOverlayPos = pos; }); withSafe(()=>{ w.showToast && w.showToast(`Title position: ${pos.toUpperCase()}`); }); if(w.CONFIG?.overlayOn===true){ withSafe(()=>{ (w.OverlayCtrl && w.OverlayCtrl.rebuildOverlays) ? w.OverlayCtrl.rebuildOverlays(pos) : (w.rebuildOverlays && w.rebuildOverlays(pos)); }); } };
        });
        const fp = document.getElementById('cfgFontPrimary');
        const fs = document.getElementById('cfgFontSecondary');
        fp.value = w.CONFIG?.fontPrimary||''; fs.value = w.CONFIG?.fontSecondary||'';
      });
      // content pos
      withSafe(()=>{
        const group = document.getElementById('cfgContentPos');
        if(group){
          const setActive=(p)=>{ [...group.querySelectorAll('button')].forEach(b=>{ const on=(b.dataset.pos===p); b.classList.toggle('active', on); b.setAttribute('aria-pressed', on? 'true':'false'); }); };
          const current = ((w.CONFIG?.contentPos) || 'tl').toLowerCase(); setActive(current);
          const applyPreview=(p)=>{ const sc = document.querySelector('.slide.active .content-scroll'); if(!sc) return; const mapRow = { t:'flex-start', m:'center', b:'flex-end' }; const mapCol = { l:'flex-start', m:'center', r:'flex-end' }; if(/^[tmb][lmr]$/.test(p)){ sc.style.setProperty('--content-y', mapRow[p[0]]); sc.style.setProperty('--content-x', mapCol[p[1]]); } };
          group.querySelectorAll('button').forEach(btn=>{ btn.onclick=()=>{ const pos=(btn.dataset.pos||'tl').toLowerCase(); setActive(pos); withSafe(()=>{ w.__tempContentPos = pos; }); applyPreview(pos); }; btn.addEventListener('keydown',(e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); btn.click(); }}); });
          applyPreview(current);
        }
      });
      // external config controls
      withSafe(()=>{
        const persistChk = document.getElementById('cfgPersistConfig'); if(persistChk){ persistChk.checked = !!w.PERSIST_CONFIG; persistChk.onchange = ()=>{ w.PERSIST_CONFIG = !!persistChk.checked; withSafe(()=>{ localStorage.setItem('slideapp.config.persist', w.PERSIST_CONFIG ? '1':'0'); w.showToast && w.showToast(w.PERSIST_CONFIG? 'Persist: on':'Persist: off'); }); }; }
        const urlInput = document.getElementById('cfgConfigUrl');
        const btnLoad = document.getElementById('cfgLoadUrl'); if(btnLoad){ btnLoad.onclick = async ()=>{ const u=(urlInput?.value||'').trim(); if(!u){ withSafe(()=>{ w.showToast && w.showToast('Enter a URL'); }); return; } await w.loadConfigFromUrl(u); } }
        const fileInput = document.getElementById('cfgImportFile');
        const importBtn = document.getElementById('cfgImportBtn');
        if(importBtn && fileInput){ importBtn.onclick = ()=>{ withSafe(()=>{ fileInput.click(); }); }; }
        if(fileInput){ fileInput.onchange = async (e)=>{ try{ const f=e.target.files && e.target.files[0]; if(!f) return; if(f.size > 2*1024*1024){ alert('File too large (max 2MB)'); e.target.value=''; return; } const text = await f.text(); const data = JSON.parse(text); w.mergeConfig && w.mergeConfig(data, 'merge'); if(w.PERSIST_CONFIG){ try{ localStorage.setItem('slideapp.config', JSON.stringify(w.CONFIG)); }catch(err){ /* ignore */ } } withSafe(()=>{ w.showToast && w.showToast('Config imported'); }); e.target.value=''; }catch(err){ console.error('Import failed',err); alert('Import failed: '+(err?.message||err)); e.target.value=''; } } }
        const btnExport = document.getElementById('cfgExport'); if(btnExport){ btnExport.onclick = ()=>{ try{ w.exportConfigBlob && w.exportConfigBlob(); }catch(e){ alert('Export failed: '+(e?.message||e)); } } }
      });
      // ensure Save button visible
      withSafe(()=>{ setTimeout(()=>{ document.getElementById('cfgSave')?.scrollIntoView({block:'center'}); }, 0); });
    }

    function close(){
      cfgOverlay.style.display='none';
      cfgModal.style.display='none';
      withSafe(()=>{ delete w.__tempOverlayPos; });
  withSafe(()=>{ (w.OverlayCtrl && w.OverlayCtrl.rebuildOverlays) ? w.OverlayCtrl.rebuildOverlays() : (w.rebuildOverlays && w.rebuildOverlays()); });
    }

    function save(ev){
      try{ if(ev && typeof ev.preventDefault==='function') ev.preventDefault(); }
      catch(e){ /* ignore */ }
      try{
      w.CONFIG.brand=document.getElementById('cfgName').value.trim();
      w.CONFIG.primary=document.getElementById('cfgPrimary').value;
      w.CONFIG.accent=document.getElementById('cfgAccent').value;
      // slide opacity
      const slider=document.getElementById('cfgSlideOpacity'); let pct=Number(slider && slider.value); if(!Number.isFinite(pct)) pct=100; pct=Math.round(Math.max(0, Math.min(100, pct))); w.CONFIG.slideOpacity = pct/100;
      const nm = document.getElementById('cfgName').value.trim();
      w.CONFIG.appName = nm; if(!w.CONFIG.brand) w.CONFIG.brand = nm;
      withSafe(()=>{
        const ra = (document.getElementById('cfgAppBg1')?.value || '').toString(); const na = normalizeHexLocal(ra);
        const rb = (document.getElementById('cfgAppBg2')?.value || '').toString(); const nb = normalizeHexLocal(rb);
        if(na) w.CONFIG.appBg1 = na; else delete w.CONFIG.appBg1;
        if(nb) w.CONFIG.appBg2 = nb; else delete w.CONFIG.appBg2;
        const rs1 = (document.getElementById('cfgSlideBg1')?.value || '').toString(); const ns1 = normalizeHexLocal(rs1);
        const rs2 = (document.getElementById('cfgSlideBg2')?.value || '').toString(); const ns2 = normalizeHexLocal(rs2);
        if(ns1) w.CONFIG.slideBg1 = ns1; else delete w.CONFIG.slideBg1;
        if(ns2) w.CONFIG.slideBg2 = ns2; else delete w.CONFIG.slideBg2;
        const rt = (document.getElementById('cfgTextColor')?.value || '').toString(); const nt = normalizeHexLocal(rt); if(nt) w.CONFIG.textColor = nt; else delete w.CONFIG.textColor;
        const modeSel = document.getElementById('cfgBtnTextMode');
        const btnClr = document.getElementById('cfgBtnTextColor');
        if(modeSel && btnClr){ if(modeSel.value==='auto'){ w.CONFIG.btnTextColor = 'auto'; } else { const n = normalizeHexLocal(String(btnClr.value||'')); if(n) w.CONFIG.btnTextColor = n; else delete w.CONFIG.btnTextColor; } }
        const bf=document.getElementById('cfgBtnFill'); const v=(bf?.value||'').toString().toLowerCase(); w.CONFIG.btnFill = (v==='outline'?'outline':'solid');
        const bwSaveEl = document.getElementById('cfgBtnBorderWidth');
        if(bwSaveEl){ const n = Math.max(1, Math.min(6, Math.round(Number(bwSaveEl.value)|| (w.CONFIG.btnFill==='outline'?2:1)))); w.CONFIG.btnBorderWidth = n; }
      });
      // UI toggles & widths
      w.CONFIG.hideSlidesWithUi = document.getElementById('cfgHideSlidesWithUi').checked;
      w.CONFIG.hideProgressWithUi = document.getElementById('cfgHideProgressWithUi').checked;
      w.CONFIG.slideBorderOn = document.getElementById('cfgSlideOutline').checked;
  const owSave = document.getElementById('cfgOutlineWidth'); let px = Math.max(0, Math.min(8, Math.round(Number(owSave.value)||0))); w.CONFIG.slideBorderWidth = px;
      // remember deck
      w.CONFIG.rememberLastDeck = document.getElementById('cfgRememberDeck').checked;
      // overlay saves
      w.CONFIG.overlayOn = document.getElementById('cfgOverlayTitleOn').checked;
      w.CONFIG.overlaySubtitleOn = document.getElementById('cfgOverlaySubtitleOn').checked;
      const ts = Math.max(12, Math.min(64, Math.round(Number(document.getElementById('cfgTitleSize').value)||22)));
      const ss = Math.max(10, Math.min(48, Math.round(Number(document.getElementById('cfgSubtitleSize').value)||16)));
      w.CONFIG.overlayTitleSize = ts; w.CONFIG.overlaySubtitleSize = ss;
      w.CONFIG.overlaySubtitleColor = (document.getElementById('cfgSubtitleColor').value === 'accent') ? 'accent' : 'primary';
  const fp = document.getElementById('cfgFontPrimary').value.trim(); const fs = document.getElementById('cfgFontSecondary').value.trim(); if(fp) w.CONFIG.fontPrimary = fp; if(fs) w.CONFIG.fontSecondary = fs;
      withSafe(()=>{ if(w.__tempOverlayPos){ w.CONFIG.overlayPos = w.__tempOverlayPos; delete w.__tempOverlayPos; } });
      withSafe(()=>{ if(w.__tempContentPos){ w.CONFIG.contentPos = w.__tempContentPos; delete w.__tempContentPos; } });
      if(w.PERSIST_CONFIG){ withSafe(()=>{ localStorage.setItem('slideapp.config', JSON.stringify(w.CONFIG)); }); } else { withSafe(()=>{ localStorage.removeItem('slideapp.config'); }); }
  // Apply via runtime helper and then page helper for any additional UI updates
  withSafe(()=>{ if(w.Theme && typeof w.Theme.applyConfig === 'function'){ try{ w.Theme.applyConfig(w.CONFIG); }catch(e){ /* ignore */ } } });
  withSafe(()=>{ if (typeof w.applyConfig==='function'){ try{ w.applyConfig(); }catch(e){ /* ignore */ } } });
      withSafe(()=>{ const el=document.getElementById('appName'); if(el){ el.textContent = (w.CONFIG.appName||w.CONFIG.brand||'SlideApp'); } });
      withSafe(()=>{ if(!(w.__deckAppName && String(w.__deckAppName).trim())){ const nm=(w.CONFIG.appName||w.CONFIG.brand||'SlideApp'); if(nm && nm.trim()) document.title = nm.trim(); } });
      withSafe(()=>{ w.updateActiveThumbGradient && w.updateActiveThumbGradient(); });
      }
      catch(e){
        try{ console.error('Save failed', e); }
        catch(_){ /* ignore */ }
      }
      // Always close the modal even if a non-critical field failed, to avoid trapping the UI
      cfgOverlay.style.display=cfgModal.style.display='none';
      withSafe(()=>{ w.showToast && w.showToast(`Saved: ${(w.CONFIG.appName||w.CONFIG.brand||'SlideApp')} • ${(w.CONFIG.primary||'#01B4E1')} / ${(w.CONFIG.accent||'#64FFFC')} • Opacity ${Math.round(w.CONFIG.slideOpacity*100)}% • Outline ${(w.CONFIG.slideBorderOn!==false?'on':'off')} ${w.CONFIG.slideBorderWidth}px`); });
      // Update baseline for T toggle
      withSafe(()=>{
        w.BASE_OPACITY = w.CONFIG.slideOpacity;
        try { globalThis.BASE_OPACITY = w.CONFIG.slideOpacity; }
        catch(e){ /* ignore */ }
      });
      // Rebuild overlays & content positions across slides
  withSafe(()=>{ (w.OverlayCtrl && w.OverlayCtrl.rebuildOverlays) ? w.OverlayCtrl.rebuildOverlays() : (w.rebuildOverlays && w.rebuildOverlays()); });
      withSafe(()=>{
        if(Array.isArray(w.slidesHTML) && w.slidesHTML.length){
          const slides = [...document.querySelectorAll('.slide')];
          slides.forEach((slideEl, idx)=>{
            const sc = slideEl.querySelector('.content-scroll');
            if(!sc) return;
            const fm = w.slidesHTML[idx]?.fm || {};
            const raw = String(fm['content-pos'] || fm.contentpos || w.CONFIG.contentPos || 'tl').toLowerCase();
            const mapRow = { t:'flex-start', m:'center', b:'flex-end' };
            const mapCol = { l:'flex-start', m:'center', r:'flex-end' };
            if(/^[tmb][lmr]$/.test(raw)){
              sc.style.setProperty('--content-y', mapRow[raw[0]]);
              sc.style.setProperty('--content-x', mapCol[raw[1]]);
            } else {
              sc.style.setProperty('--content-y', 'flex-start');
              sc.style.setProperty('--content-x', 'flex-start');
            }
          });
        }
      });
    }

    function reset(){
      withSafe(()=>{ localStorage.removeItem('slideapp.config'); });
      withSafe(()=>{ sessionStorage.removeItem('slideapp.session.deck'); });
      withSafe(()=>{ localStorage.removeItem('slideapp.persist.deck'); });
      withSafe(()=>{ w.BASE_OPACITY = 1; try { globalThis.BASE_OPACITY = 1; }
        catch(e){ /* ignore */ } });
      withSafe(()=>{ w.showToast && w.showToast('Settings reset to defaults', 1000); });
      setTimeout(()=>location.reload(), 400);
    }

    // wire buttons
  openBtn.addEventListener('click', open);
  withSafe(()=>{ const el=document.getElementById('cfgClose'); el && el.addEventListener('click', close); });
  // Bind directly and also via delegation to make Save resilient
  withSafe(()=>{ const el=document.getElementById('cfgSave'); el && el.addEventListener('click', save); });
  withSafe(()=>{ cfgModal.addEventListener('click', (e)=>{ try{ const t=e.target && (e.target.id==='cfgSave' || e.target.closest && e.target.closest('#cfgSave')); if(t){ e.preventDefault(); save(e); } }catch(_){ /* ignore */ } }, true); });
  // Keyboard activation on focused Save button
  withSafe(()=>{ const el=document.getElementById('cfgSave'); if(el){ el.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); save(e); } }); } });
  withSafe(()=>{ const el=document.getElementById('cfgReset'); el && el.addEventListener('click', reset); });
  }

  global.StyleModal = { init };
})(typeof window!=='undefined' ? window : this);
