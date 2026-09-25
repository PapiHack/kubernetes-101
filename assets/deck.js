/* Kubernetes 101 — shared deck navigation.
   Keys: ← → / space navigate, F fullscreen, N speaker notes, O overview, Home/End. */
(function () {
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  if (!slides.length) return;
  var i = 0;
  var tot = document.getElementById('tot');
  var cur = document.getElementById('cur');
  var bar = document.getElementById('progress');
  if (tot) tot.textContent = slides.length;

  function show(n, push) {
    i = Math.max(0, Math.min(slides.length - 1, n));
    slides.forEach(function (s, k) { s.classList.toggle('active', k === i); });
    if (cur) cur.textContent = i + 1;
    if (bar) bar.style.width = ((i + 1) / slides.length * 100) + '%';
    if (push !== false) history.replaceState(null, '', '#' + (i + 1));
  }

  function fromHash() {
    var n = parseInt((location.hash || '').replace('#', ''), 10);
    show(isNaN(n) ? 0 : n - 1, false);
  }

  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var k = e.key;
    if (k === 'ArrowRight' || k === ' ' || k === 'PageDown') { show(i + 1); e.preventDefault(); }
    else if (k === 'ArrowLeft' || k === 'PageUp') { show(i - 1); e.preventDefault(); }
    else if (k === 'Home') { show(0); e.preventDefault(); }
    else if (k === 'End') { show(slides.length - 1); e.preventDefault(); }
    else if (k === 'f' || k === 'F') {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen();
    }
    else if (k === 'n' || k === 'N') document.body.classList.toggle('notes-on');
  });

  // Click the left quarter to go back, anywhere else to advance.
  document.addEventListener('click', function (e) {
    if (e.target.closest('a')) return;
    show(i + (e.clientX < window.innerWidth * 0.25 ? -1 : 1));
  });

  window.addEventListener('hashchange', fromHash);
  fromHash();
})();
