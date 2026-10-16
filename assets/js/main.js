/* Progressive enhancement: content, navigation and legacy anchors work without JS. */
(() => {
  'use strict';
  document.querySelectorAll('.image-frame img').forEach(image => {
    const fallback = () => image.classList.add('is-missing');
    image.addEventListener('error', fallback);
    if (image.complete && !image.naturalWidth) fallback();
  });

  const links = [...document.querySelectorAll('.section-nav a[href^="#"]')];
  const sections = links.map(link => document.getElementById(link.hash.slice(1)));
  if (!links.length || sections.some(section => !section)) return;
  let locked = null;
  let timeout;
  let frame;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const normalize = hash => hash === '#experiences' ? '#experience' : hash;
  function highlight(id) {
    links.forEach(link => {
      if (link.hash === '#' + id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function sync() {
    if (locked) return;
    const bottom = window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
    const line = Math.min(180, window.innerHeight * .25);
    const current = bottom ? sections.at(-1) : sections.filter(section => section.getBoundingClientRect().top <= line).at(-1) || sections[0];
    highlight(current.id);
  }
  function release() {
    clearTimeout(timeout);
    locked = null;
    sync();
  }
  function navigate(hash, smooth, focus = false) {
    const target = sections.find(section => '#' + section.id === normalize(hash));
    if (!target) { release(); return; }
    clearTimeout(timeout);
    locked = target.id;
    highlight(target.id);
    if (focus) target.focus({ preventScroll: true });
    target.scrollIntoView({ behavior: smooth && !reducedMotion.matches ? 'smooth' : 'instant', block: 'start' });
    // scrollend is primary; timeout supports older browsers and no-op scrolls.
    timeout = window.setTimeout(release, 1400);
  }
  links.forEach(link => link.addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (location.hash !== link.hash) history.pushState(null, '', link.hash);
    navigate(link.hash, true, true);
  }));
  window.addEventListener('scroll', () => {
    if (frame) return;
    frame = requestAnimationFrame(() => { frame = null; sync(); });
  }, { passive: true });
  window.addEventListener('scrollend', release);
  window.addEventListener('wheel', release, { passive: true });
  window.addEventListener('touchstart', release, { passive: true });
  window.addEventListener('keydown', event => {
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) release();
  });
  window.addEventListener('resize', sync);
  window.addEventListener('hashchange', () => navigate(location.hash, false));
  window.addEventListener('popstate', () => {
    if (location.hash) navigate(location.hash, false);
    else { release(); window.scrollTo({ top: 0, behavior: 'instant' }); }
  });
  window.addEventListener('pageshow', () => location.hash ? navigate(location.hash, false) : sync());
  sync();
})();
