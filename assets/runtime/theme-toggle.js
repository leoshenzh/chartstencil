/* Light/dark switch shared by every web deliverable. The page follows the system
   setting until the reader presses the button; the choice is then remembered.
   Export mode and chart frames embedded in a report keep the theme they were built with. */
'use strict';
const MBBTheme = (() => {
  const key = 'chartstencil-theme';
  const exporting = new URLSearchParams(location.search).has('export');
  let embedded;
  try { embedded = window.self !== window.top; } catch (_) { embedded = true; }
  const fixed = exporting || embedded;
  const query = matchMedia('(prefers-color-scheme: dark)');
  const listeners = [];
  let builtDefault = null;
  let chosen = null; // the reader's pick in this page, even when storage is unavailable
  const saved = () => {
    if (chosen) return chosen;
    try { const v = localStorage.getItem(key); return v === 'dark' || v === 'light' ? v : null; } catch (_) { return null; }
  };
  const current = () => saved() || builtDefault || (query.matches ? 'dark' : 'light');
  const zh = () => (document.documentElement.lang || '').startsWith('zh');

  function label(button, theme) {
    const next = theme === 'dark' ? 'light' : 'dark';
    button.textContent = zh() ? (next === 'dark' ? '深色' : '浅色') : (next === 'dark' ? 'Dark' : 'Light');
    button.setAttribute('aria-label', zh() ? `切换到${next === 'dark' ? '深色' : '浅色'}模式` : `Switch to ${next} mode`);
  }

  function apply(theme, notify) {
    document.documentElement.dataset.theme = theme;
    const button = document.querySelector('.theme-toggle');
    if (button) label(button, theme);
    if (notify) listeners.forEach((fn) => fn(theme));
  }

  function install() {
    if (fixed || document.querySelector('.theme-toggle')) return;
    const style = document.createElement('style');
    style.textContent = '.theme-bar{display:flex;justify-content:flex-end;padding:8px 12px 0}.theme-toggle{min-width:44px;min-height:44px;padding:0 14px;border:1px solid currentColor;border-radius:22px;background:Canvas;color:CanvasText;font:600 14px/1 system-ui,sans-serif;cursor:pointer}' +
      'html[data-theme="dark"] .theme-toggle{background:#0d2a40;color:#e8eef3}html[data-theme="light"] .theme-toggle{background:#fff;color:#142839}' +
      '.theme-toggle:focus-visible{outline:3px solid #be126d;outline-offset:2px}@media print{.theme-bar{display:none}}';
    // Pages served with a nonce-only Content-Security-Policy need the page nonce on injected styles.
    const nonce = document.querySelector('style[nonce],script[nonce]')?.nonce;
    if (nonce) style.nonce = nonce;
    document.head.append(style);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'theme-toggle';
    button.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      chosen = next;
      try { localStorage.setItem(key, next); } catch (_) { /* remembered for this page only */ }
      apply(next, true);
    });
    // A bar of its own at the top, so the button never covers page content at any width.
    const bar = document.createElement('div');
    bar.className = 'theme-bar';
    bar.append(button);
    document.body.prepend(bar);
    query.addEventListener('change', () => { if (!saved()) apply(current(), true); });
    apply(current(), false);
  }

  // Standalone chart page: start in the reader's theme, redraw straight to the final
  // frame on a switch (no replay), and keep the built theme when fixed.
  function chart(config) {
    const built = config.theme;
    builtDefault = built;
    const start = fixed ? config : {...config, theme: current()};
    const card = document.querySelector('.chart-card');
    const setCard = (theme) => { card.classList.remove('dark', 'light'); card.classList.add(theme); };
    // Redraw in another theme at the final frame, keeping a pinned selection.
    const redraw = (theme) => {
      if (window.mbb.config.theme === theme) return;
      const pinned = window.mbb.pinned;
      setCard(theme);
      MBBCharts.render({...window.mbb.config, theme});
      window.mbb.seek(window.mbb.duration);
      if (pinned != null && window.mbb.pin) window.mbb.pin(pinned);
    };
    setCard(start.theme);
    MBBCharts.render(start);
    if (!fixed) {
      listeners.push(redraw);
      // Printing keeps the theme the file was built with.
      addEventListener('beforeprint', () => {
        redraw(built);
        window.mbb.pause();
        window.mbb.seek(window.mbb.duration); // print the complete final frame
      });
      addEventListener('afterprint', () => redraw(document.documentElement.dataset.theme));
    }
    install();
  }

  return {install, chart, current: () => (fixed ? null : current())};
})();
