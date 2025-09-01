(function (global){
  'use strict';

  function setBgButtonLabel(mode){
    try{
      var el = document.getElementById('bgBtn');
      if(!el) return; 
      el.textContent = (mode==='gradient'?'🌌 Background':mode==='particles'?'✨ Particles':'⛔ Background Off');
    }catch(e){ /* noop */ }
  }

  function setBackgroundMode(mode, state){
    // state: { canvas, particles, prefersReduced }
    try{ localStorage.setItem('bgMode', mode); }catch(e){ /* noop */ }
    setBgButtonLabel(mode);
    var canvas = state && state.canvas; var particles = state && state.particles; var prefersReduced = !!(state && state.prefersReduced);
    var gradientEl = document.querySelector('.bg-gradient');
    if(mode === 'off'){
      try{ particles && typeof particles.stop==='function' && particles.stop(); }catch(e){ /* noop */ }
      if(canvas) canvas.style.display='none';
      if(gradientEl) gradientEl.style.display='none';
    } else if(mode === 'gradient'){
      try{ particles && typeof particles.stop==='function' && particles.stop(); }catch(e){ /* noop */ }
      if(canvas) canvas.style.display='none';
      if(gradientEl) gradientEl.style.display='block';
    } else { // particles
      if(gradientEl) gradientEl.style.display='none';
      if(canvas) canvas.style.display='block';
      try{ particles && typeof particles.start==='function' && particles.start({ prefersReduced: prefersReduced }); }catch(e){ /* noop */ }
    }
  }

  function cycleBackground(currentMode){
    var order=['gradient','particles','off'];
    var idx = order.indexOf(currentMode);
    return order[(idx+1)%order.length];
  }

  var api = { setBgButtonLabel: setBgButtonLabel, setBackgroundMode: setBackgroundMode, cycleBackground: cycleBackground };
  if(typeof module !== 'undefined' && module.exports){ module.exports = api; }
  try{ (global||window).BackgroundToggle = api; }catch(e){ /* noop */ }
})(typeof globalThis !== 'undefined' ? globalThis : this);
