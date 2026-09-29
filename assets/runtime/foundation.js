/* Original ChartStencil runtime. No external dependencies. */
'use strict';
const MBB = (() => {
  const NS = 'http://www.w3.org/2000/svg';
  const palettes = {
    dark: {
      background: '#071f31', text: '#f6f9fc', muted: '#bcccd9', grid: '#547086',
      data: '#008cff', accent: '#f02c91',
      categories: ['#008cff', '#3478ed', '#00c7dc', '#009eba', '#00bb9c', '#f02c91'],
      ordinal: ['#3478ed', '#009eba', '#00bb9c', '#42dcc0'],
      diverging: ['#f02c91', '#bcccd9', '#00bb9c']
    },
    light: {
      background: '#ffffff', text: '#142839', muted: '#526878', grid: '#8394a1',
      data: '#006dd5', accent: '#be126d',
      categories: ['#006dd5', '#214eb8', '#008296', '#00778e', '#007e69', '#be126d'],
      ordinal: ['#214eb8', '#00778e', '#007e69', '#148472'],
      diverging: ['#be126d', '#526878', '#007e69']
    }
  };

  function el(tag, attrs = {}, value, parent) {
    const node = document.createElementNS(NS, tag);
    for (const [key, val] of Object.entries(attrs)) node.setAttribute(key, val);
    if (value != null) node.textContent = value;
    if (parent) parent.append(node);
    return node;
  }
  function text(parent, x, y, value, attrs = {}) {
    return el('text', {x, y, ...attrs}, value, parent);
  }
  function line(parent, x1, y1, x2, y2, attrs = {}) {
    return el('line', {x1, y1, x2, y2, class: 'grid', ...attrs}, null, parent);
  }
  function note(parent, x, y, lines) {
    const node = el('text', {x, y}, null, parent);
    lines.forEach((s, i) => el('tspan', {x, dy: i ? 25 : 0, 'font-weight': i ? 400 : 700}, s, node));
    return node;
  }
  function leader(parent, x, y, lx, ly, label) {
    el('path', {d: `M${x},${y} L${lx - 12},${ly - 5} H${lx - 4}`, fill: 'none', stroke: 'var(--muted)', 'stroke-width': 1}, null, parent);
    return text(parent, lx, ly, label);
  }
  function wrapText(parent, x, y, value, width, attrs = {}, lineHeight = 20) {
    const node = text(parent, x, y, '', attrs);
    let row = el('tspan', {x, dy: 0}, '', node), count = 1;
    const tokens = [...new Intl.Segmenter('zh', {granularity: 'word'}).segment(value)].map(t => t.segment);
    for (const token of tokens) {
      const previous = row.textContent;
      row.textContent += token;
      if (previous.trim() && row.getComputedTextLength() > width) {
        row.textContent = previous.trimEnd();
        row = el('tspan', {x, dy: lineHeight}, token.trimStart(), node);
        count++;
      }
    }
    return {node, height: count * lineHeight};
  }
  // Readable decimal steps, while preserving the chart's actual scale domain.
  function ticks(min, max, count = 5) {
    if (!(max > min)) return [min];
    const rough = (max - min) / count;
    const power = 10 ** Math.floor(Math.log10(rough));
    const unit = [1, 2, 2.5, 5, 10].reduce((best, n) =>
      Math.abs(n - rough / power) < Math.abs(best - rough / power) ? n : best, 1);
    const step = unit * power;
    const first = Math.ceil(min / step - 1e-10), last = Math.floor(max / step + 1e-10);
    return Array.from({length: last - first + 1}, (_, i) => Number(((first + i) * step).toPrecision(12)));
  }
  function logTicks(min, max) {
    const values = [];
    for (let power = Math.floor(Math.log10(min)); power <= Math.ceil(Math.log10(max)); power++) {
      for (const unit of [1, 2, 5]) {
        const value = unit * 10 ** power;
        if (value >= min && value <= max) values.push(value);
      }
    }
    return values;
  }
  function categoryIndices(count, limit = 8) {
    if (count <= limit) return Array.from({length: count}, (_, i) => i);
    return Array.from({length: limit}, (_, i) => Math.round(i * (count - 1) / (limit - 1)));
  }
  function number(value, lang = 'en') {
    return new Intl.NumberFormat(lang === 'zh' ? 'zh-CN' : 'en-US', {
      maximumFractionDigits: 4, ...(value !== 0 && Math.abs(value) < .001 ? {notation:'scientific', maximumFractionDigits:2} : {})
    }).format(value);
  }
  function radius(value, max, maxRadius) {
    return Math.sqrt(value / max) * maxRadius;
  }
  function luminance(color) {
    const rgb = [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16) / 255)
      .map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
    return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
  }
  function ink(color) {
    return luminance(color) > .179 ? '#000000' : '#ffffff';
  }

  function mount(config) {
    const source = document.querySelector('.source');
    if (source && source.textContent.trim()) {
      const first = source.firstChild;
      if (first?.nodeType === Node.TEXT_NODE) first.textContent = first.textContent.replace(/^\s*(?:来源\s*[：:]|Source\s*:)\s*/i, '');
      source.prepend(document.createTextNode(config.lang === 'zh' ? '来源：' : 'Source: '));
    }
    const card = document.querySelector('.chart-card');
    const svg = document.querySelector('.plot');
    const tip = document.querySelector('.tooltip');
    const controller = new AbortController();
    const signal = controller.signal;
    const records = [], steps = [];
    const palette = typeof MBBColors === 'undefined' ? palettes[config.theme] : MBBColors.resolve(config, palettes[config.theme]);
    for (const [css, role] of Object.entries({bg:'background',fg:'text',muted:'muted',grid:'grid',accent:'accent'})) card.style.setProperty('--'+css, palette[role]);
    card.classList.toggle('magazine-card', config.appearance === 'magazine');
    const duration = 8000;
    let frame = 0, playing = false, current = 0, generation = 0;
    // This flag survives a responsive re-render. Export starts before autoplay can run.
    window.__mbbExportMode ||= new URLSearchParams(location.search).has('export');
    const api = {
      config, svg, card, palette,
      width: card.clientWidth - (innerWidth < 800 ? 44 : 96),
      records, duration, signal, el, text, line, note, leader, radius
    };
    function step(node, start = 0, length = 500, draw = false) {
      const pathLength = draw === true ? node.getTotalLength() : 0;
      steps.push({node, start, length, draw, pathLength});
      if (draw === true) node.style.strokeDasharray = pathLength;
      return node;
    }
    function mark(node, data, start = 1200, animate = true) {
      node.dataset.mark = records.length;
      node.setAttribute('tabindex', '0');
      node.setAttribute('role', 'img');
      node.setAttribute('aria-label', data.label);
      records.push({node, ...data});
      if (animate) step(node, start, 450);
      return node;
    }
    function hide() {
      tip.hidden = true;
      svg.querySelectorAll('.crosshair').forEach(node => node.remove());
    }
    function show(node, x, y) {
      const rec = records[Number(node.dataset.mark)];
      if (!rec) return;
      tip.textContent = rec.label;
      tip.hidden = false;
      const b = tip.getBoundingClientRect();
      tip.style.left = Math.max(8, Math.min(x + 14, innerWidth - b.width - 8)) + 'px';
      tip.style.top = Math.max(8, Math.min(y + 14, innerHeight - b.height - 8)) + 'px';
      svg.querySelectorAll('.crosshair').forEach(node => node.remove());
      if (rec.crosshair) line(svg, rec.crosshair.x, rec.crosshair.y1, rec.crosshair.x, rec.crosshair.y2, {class: 'crosshair'});
    }
    svg.addEventListener('pointermove', event => {
      const node = event.target.closest('[data-mark]');
      if (node) show(node, event.clientX, event.clientY);
      else if (event.pointerType !== 'touch') hide();
    }, {signal});
    svg.addEventListener('pointerleave', hide, {signal});
    svg.addEventListener('focusin', event => {
      const node = event.target.closest('[data-mark]');
      if (node) {
        const b = node.getBoundingClientRect();
        show(node, b.x + b.width / 2, b.y + b.height / 2);
      }
    }, {signal});
    svg.addEventListener('focusout', hide, {signal});
    document.addEventListener('click', event => {
      const node = event.target.closest('[data-mark]');
      if (node) {
        const b = node.getBoundingClientRect();
        show(node, event.clientX || b.x, event.clientY || b.y);
      } else hide();
    }, {signal});
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') hide();
    }, {signal});

    function applyTime(ms) {
      current = Math.max(0, Math.min(duration, ms));
      for (const s of steps) {
        const p = Math.max(0, Math.min(1, (current - s.start) / s.length));
        // Keep completed SVG layers intact; redundant writes can rerasterize edge pixels.
        if (s.lastProgress === p) continue;
        s.lastProgress = p;
        s.node.style.opacity = p;
        if (s.draw === true) s.node.style.strokeDashoffset = (1 - p) * s.pathLength;
        else if (typeof s.draw === 'function') s.draw(p);
      }
      return current;
    }
    function pause() {
      generation++;
      cancelAnimationFrame(frame);
      playing = false;
      return current;
    }
    function seek(ms) {
      pause();
      return applyTime(ms);
    }
    function replay() {
      pause();
      hide();
      if (window.__mbbExportMode || matchMedia('(prefers-reduced-motion: reduce)').matches) {
        applyTime(duration);
        return;
      }
      const start = performance.now(), token = generation;
      playing = true;
      function tick(now) {
        if (!playing || token !== generation || window.__mbbExportMode) return;
        applyTime(now - start);
        if (current < duration) frame = requestAnimationFrame(tick);
        else playing = false;
      }
      applyTime(0);
      frame = requestAnimationFrame(tick);
    }
    function bounds() {
      const b = card.getBoundingClientRect();
      return {x: b.x + scrollX, y: b.y + scrollY, width: b.width, height: b.height, scale: 1};
    }
    function enterExport() {
      api.resetInteraction?.();
      document.activeElement?.blur();
      window.__mbbExportMode = true;
      pause();
      hide();
      seek(duration);
      return bounds();
    }
    Object.assign(api, {
      destroy: () => { pause(); controller.abort(); hide(); },
      mark, step, seek, pause, replay, hide,
      export: {width: 1080, duration, clip: bounds, prepare: enterExport}
    });
    Object.defineProperties(api, {
      time: {get: () => current}, playing: {get: () => playing},
      exporting: {get: () => Boolean(window.__mbbExportMode)}
    });
    window.mbb = api;
    return api;
  }
  return {ticks, logTicks, categoryIndices, number, palettes, mount, el, text, line, note, leader, radius, ink, wrapText};
})();
