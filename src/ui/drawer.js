(function (global){
  'use strict';

  // expects: { thumbsRoot, drawerBtn, scrimEl, isOverlayFn }
  function setDrawerUI(ctx){
    if(!ctx || !ctx.thumbsRoot || !ctx.drawerBtn) return;
    var drawerKey='drawerCollapsed';
    var collapsed = localStorage.getItem(drawerKey)==='1';
    var open = localStorage.getItem('drawerOpen')==='1';
    var overlay = ctx.isOverlayFn ? !!ctx.isOverlayFn() : (innerWidth < 1024);
    var root = ctx.thumbsRoot; var btn = ctx.drawerBtn; var scrim = ctx.scrimEl;
    root.classList.remove('collapsed','overlay','open');
    if(overlay){
      root.classList.add('overlay');
      if(open) root.classList.add('open');
      if(scrim) scrim.style.display = open ? 'block' : 'none';
      btn.textContent='🧭 Slides';
      btn.title = open?'Hide slides':'Show slides';
    } else {
      root.classList.toggle('collapsed', collapsed);
      if(scrim) scrim.style.display = 'none';
      btn.textContent='🧭 Slides';
      btn.title = collapsed?'Show slides':'Hide slides';
    }
  }

  function toggleDrawer(ctx, onToggle){
    if(!ctx) return;
    var drawerKey='drawerCollapsed';
    var overlay = ctx.isOverlayFn ? !!ctx.isOverlayFn() : (innerWidth < 1024);
    if(overlay){
      var open = !(localStorage.getItem('drawerOpen')==='1');
      localStorage.setItem('drawerOpen', open?'1':'0');
      setDrawerUI(ctx);
      try{ onToggle && onToggle(open, true); }catch(e){ /* noop */ }
    } else {
      var collapsed = !(localStorage.getItem(drawerKey)==='1');
      localStorage.setItem(drawerKey, collapsed?'1':'0');
      setDrawerUI(ctx);
      try{ onToggle && onToggle(!collapsed, false); }catch(e){ /* noop */ }
    }
  }

  var api = { setDrawerUI: setDrawerUI, toggleDrawer: toggleDrawer };
  if(typeof module !== 'undefined' && module.exports){ module.exports = api; }
  try{ (global||window).DrawerCtrl = api; }catch(e){ /* noop */ }
})(typeof globalThis !== 'undefined' ? globalThis : this);
