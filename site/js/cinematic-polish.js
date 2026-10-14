/* Cosmetic, non-invasive enhancement. No interception of clicks, media or API calls. */
(() => {
  'use strict';
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (media.matches || typeof IntersectionObserver !== 'function') return;
  const selector = '.section, .section-heading, .page-title, .editorial, .detail-info, .card-grid, .results-heading';
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('pf-in-view');
      observer.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px 70px 0px', threshold: 0.04 });
  function decorate(root) {
    if (!(root instanceof Element)) return;
    const elements = [];
    if (root.matches(selector)) elements.push(root);
    elements.push(...root.querySelectorAll(selector));
    for (const element of elements) {
      if (element.hasAttribute('data-pf-reveal')) continue;
      // Never change the video player or its control tree.
      if (element.closest('.player, .player-controls, .player-host')) continue;
      element.setAttribute('data-pf-reveal', '');
      observer.observe(element);
    }
  }
  const content = document.getElementById('content');
  const app = document.getElementById('app');
  if (!app) return;
  decorate(content || app);
  let queued = false;
  const watch = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      decorate(document.getElementById('content') || app);
    });
  });
  watch.observe(app, { childList: true, subtree: true });
  window.addEventListener('pagehide', () => { watch.disconnect(); observer.disconnect(); }, { once:true });
})();
