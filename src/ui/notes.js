(function (global){
  'use strict';

  function toggleNotes(notesEl, onToggle){
    if(!notesEl) return false;
    var now = notesEl.classList.toggle('show');
    try{ onToggle && onToggle(now); }catch(e){ /* noop */ }
    return now;
  }

  var api = { toggleNotes: toggleNotes };
  if(typeof module !== 'undefined' && module.exports){ module.exports = api; }
  try{ (global||window).NotesCtrl = api; }catch(e){ /* noop */ }
})(typeof globalThis !== 'undefined' ? globalThis : this);
