/* Lightweight runtime particle lifecycle.
   - Starts/stops the canvas animation
   - Uses window.Theme.computeParticleConfig if available to derive config
   - Defensive: no-ops if DOM/canvas missing
*/
(function initParticlesRuntime(){
  let particles = [];
  let rafId = null;
  let cfg = { count: 60, gridSize: 120, maxVelocity: 0.6, lineDistance: 120, effectColor: '#3C9DFF' };
  let canvas = null;
  let ctx = null;

  function safeGetConfig(hint){
    try{
      if(window && window.Theme && typeof window.Theme.computeParticleConfig === 'function'){
        return window.Theme.computeParticleConfig(hint || {});
      }
    }catch(err){
      // defensive: if Theme.computeParticleConfig throws, fall back to local cfg
      // keep a minimal console debug when available to aid troubleshooting
      if(typeof console !== 'undefined' && typeof console.debug === 'function') console.debug('Particles.safeGetConfig error', err && err.message);
    }
    return cfg;
  }

  function resizeCanvas(){
    if(!canvas) return;
    const dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = Math.floor(innerWidth * dpr);
    canvas.height = Math.floor(innerHeight * dpr);
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
    if(ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function initParticlesLocal(count){
    particles = Array.from({length: count}, () => ({ x: Math.random()*innerWidth, y: Math.random()*innerHeight, vx: (Math.random()-0.5)*cfg.maxVelocity, vy: (Math.random()-0.5)*cfg.maxVelocity }));
  }

  function step(){
    if(!ctx) return;
    ctx.clearRect(0,0,innerWidth,innerHeight);
    for(const p of particles){
      p.x += p.vx; p.y += p.vy;
      if(p.x < 0 || p.x > innerWidth) p.vx *= -1;
      if(p.y < 0 || p.y > innerHeight) p.vy *= -1;
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, Math.PI*2); ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.fill();
    }
    // simple linking lines (O(n^2) but OK for modest counts)
    ctx.lineWidth = 0.6;
    const stroke = (getComputedStyle(document.documentElement).getPropertyValue('--effect-color').trim() || getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || cfg.effectColor || '#3C9DFF');
    ctx.strokeStyle = stroke;
    for(let i=0;i<particles.length;i++){
      const a = particles[i];
      for(let j=i+1;j<particles.length;j++){
        const b = particles[j];
        const dx = a.x - b.x; const dy = a.y - b.y; const d2 = dx*dx + dy*dy;
        if(d2 < cfg.lineDistance * cfg.lineDistance){
          const alpha = 1 - Math.sqrt(d2) / cfg.lineDistance;
          if(alpha > 0){ ctx.globalAlpha = alpha; ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); }
        }
      }
    }
    ctx.globalAlpha = 1;
    rafId = requestAnimationFrame(step);
  }

  function start(hint){
    try{
      canvas = document.getElementById('bg-canvas');
      if(!canvas) return { started: false, reason: 'no-canvas' };
      ctx = canvas.getContext('2d');
      cfg = safeGetConfig(hint) || cfg;
      resizeCanvas();
      initParticlesLocal(cfg.count || 60);
      if(rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(step);
      canvas.style.display = 'block';
      return { started: true, cfg };
    }catch(e){ return { started: false, reason: e && e.message } }
  }

  function stop(){
    try{ if(rafId) cancelAnimationFrame(rafId); rafId = null; if(ctx) ctx.clearRect(0,0,innerWidth,innerHeight); if(canvas) canvas.style.display = 'none'; return { stopped: true } }catch(e){ return { stopped: false, reason: e && e.message } }
  }

  function resize(){ try{ resizeCanvas(); return { resized: true }; }catch(e){ return { resized: false, reason: e && e.message } } }

  // expose API
  window.Particles = Object.assign(window.Particles || {}, { start, stop, resize });
})();
