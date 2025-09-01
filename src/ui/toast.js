// Simple toast utility used by slider.html
// Exposes window.Toast.show(message, ms?) and a direct window.showToast for compatibility
(function (global) {
  'use strict';
  var toastTimer = null;
  function showToast(msg, ms) {
    try {
      var t = document.getElementById('toast');
      if (!t) return;
      var prefersReduced = (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      t.textContent = String(msg || '');
      if (prefersReduced) t.classList.add('no-anim');
      t.style.display = 'block';
      t.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () {
        try { t.classList.remove('show'); } catch(e){ /* noop */ void 0; }
        var hideDelay = prefersReduced ? 0 : 220;
        setTimeout(function () { try{ t.style.display = 'none'; }catch(e){ /* noop */ void 0; } }, hideDelay);
      }, Number.isFinite(ms) ? ms : 1800);
    } catch (e) {
      /* noop */ void 0;
    }
  }
  try {
    global.Toast = global.Toast || {};
    global.Toast.show = showToast;
    // Back-compat: allow direct global
    if (!global.showToast) global.showToast = showToast;
  } catch (e) {
    // ignore
  }
})(typeof window !== 'undefined' ? window : this);
