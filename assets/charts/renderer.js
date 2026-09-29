/* Shared renderer; templates are bundled; data are supplied by the caller. */
'use strict';
const MBBCharts = {
  templates: {},
  render(c) {
    window.mbb?.destroy();
    document.querySelectorAll(".interaction-status,.bundle-controls").forEach(n=>n.remove());
    document.querySelector('.plot').replaceChildren();
    document.querySelector('.mobile-values').replaceChildren();
    const heading = document.querySelector('h1');
    heading.replaceChildren();
    for (const token of new Intl.Segmenter(c.lang, {granularity: 'word'}).segment(c.title)) {
      const span = document.createElement('span');
      span.className = 'heading-word';
      span.textContent = token.segment;
      heading.append(span);
    }
    const a = MBB.mount(c), zh = c.lang === 'zh', small = a.width < 720;
    if (c.editorial) {
      const text = a.text, mark = a.mark;
      a.text = (parent, x, y, value, attrs) => text(parent, x, y, Core.format(value, c.lang), attrs);
      a.mark = (node, data, ...rest) => mark(node, {...data, label: Core.format(data.label, c.lang)}, ...rest);
    }
    const cols = small ? (a.width < 440 ? 1 : 2) : Math.min(5, c.data.values?.length || 5);
    const panelHeight = small ? 230 : 360;
    const heights = {ribbons: 660, multiples: Math.ceil((c.data.values?.length || 5) / cols) * panelHeight,
      bubbles: small ? 835 : 780, trajectory: small ? 640 : 710,
      capabilities: c.data.rows?.length * (small ? 69 : 38) + (small ? 165 : 175),
      timeseries: small ? 610 + (c.data.series?.length || 0) * (c.data.today ? 55 : 26) : 710,
      'proportional-squares': Math.ceil((c.data.rows?.length || 1) / (small ? 1 : c.data.rows?.length || 1)) * (Math.min(a.width / (small ? 1 : c.data.rows?.length || 1) - 50, 270) + (c.data.groups ? 170 : 125)) + 20,
      'bubble-comparison': Math.ceil((c.data.rows?.length || 1) / (small ? 1 : c.data.rows?.length || 1)) * 390 + 20,
      'radial-timeline': 2*Math.min(a.width/2-(small?34:65),420)+115+(c.data.rows?.length||1)*36+15,
      pictogram: (c.data.shape === 'circle' ? Math.min(a.width - 80, 520) : c.data.shape === 'shirt' ? 29 * Math.min(a.width / 36, 21) : Math.ceil((c.data.rows || []).reduce((s, r) => s + r.value, 0) / 10) * Math.min(a.width / 10, 49)) + (c.data.rows?.length || 1) * 45 + 165,
      venn: Math.min(a.width, 650) * .92 + 90 + (c.data.rows?.length || 1) * (small ? 44 : 30),
      'timeline-table': small ? (c.data.periods?.length || 1) * 355 : 590,
      'range-dot': 120 + (c.data.rows?.length || 1) * (small ? 80 : 51),
      'diverging-stack': small ? 710 : 760,
      voronoi: (c.data.levels?.length || 0)*25 + Math.min(a.width, 630) + 165 + Math.ceil((c.data.rows?.length || 1) / (small ? 1 : 2)) * 45,
      sankey: (c.data.links ? 750 : 900) + Math.ceil(((c.data.inputs?.length || 0) + (c.data.outputs?.length || 0) + (c.data.links ? 0 : 1)) / (small ? 1 : 2)) * (c.data.links ? 65 : 47),
      'panel-series': Math.ceil((c.data.panels?.length || 1) / (small ? 1 : Math.min(3, c.data.panels?.length || 1))) * (420 + (Math.max(...(c.data.panels || [{series:[{}]}]).map(p => p.series?.length || 1)) - 1) * 23),
      'bubble-matrix': 365 + (c.data.rows?.length || 1) * (small ? 108 : 115),
      'aligned-bars': (small ? 190 : 140) + (c.data.rows?.length || 1) * (small ? 100 : 65),
      mekko: c.data.mode === 'growth' ? 700 + (c.data.columns?.length || 1) * (small ? 44 : 28) : 780,
      'quadrant-area': Math.ceil((c.data.panels?.length || 1) / (small ? 1 : 2)) * 410,
      'population-pyramid': 150 + (c.data.rows?.length || 1) * 70,
      breakdown: 450 + (c.data.rows?.length || 1) * (small ? 60 : 40),
      'unit-flow': 155 * (c.data.rows?.length || 1) + 150,
      composition: (c.data.sharedLegend ? Math.ceil((c.data.panels?.[0]?.data.series.length || 0) / (small ? 1 : 3)) * 28 + 25 : 0) + (c.data.panels || []).reduce((sum, p, i, list) => i % (small ? 1 : c.data.cols || 2) ? sum : sum + Math.max(...list.slice(i, i + (small ? 1 : c.data.cols || 2)).map(x => x.height || 0)) + 105, 0),
      'stacked-range': 100 + (c.data.rows?.length || 1) * (small ? 108 : 78),
      'hierarchical-treemap': (small ? 570 : 520) + 110 + (c.data.groups || []).flatMap(g => g.rows).length * 35,
      'scatter-story': 730 + (c.data.rows?.length || 1) * 27 + (c.data.notes?.length || 0) * 65,
      'dot-comparison': 150 + (c.data.rows?.length || 1) * (small ? 100 : 68),
      'aligned-metrics': Math.ceil((c.data.rows?.length||0)/(small?1:c.data.rows?.length||1))*(small?570:655),
      'stack-bubble-breakdown': (small ? 615 : 95) + Math.ceil((c.data.factors?.length || 0) / (small ? 2 : 3)) * 180,
      'aligned-stack': (small ? 240 : 175) + (c.data.rows?.length || 0) * (small ? 115 : 75),
      'cross-glyph': (small ? 175 : 95) + Math.ceil((c.data.rows?.length || 0) / (small ? 1 : 3)) * 270,
      'column-reference': 610 + (c.data.rows?.length || 0) * 27,
      'ring-progress': (small ? 170 : 245) + Math.min(a.width/2-22,205) + 90 + (c.data.rows?.length || 0)*42,
      'concentric-rings': 95 + Math.ceil((c.data.rows?.length || 0) / (small ? 1 : 3)) * 265,
      'icon-circles': Math.ceil((c.data.rows?.length||0)/(small?1:c.data.rows?.length||1))*440,
      'component-diagram': 200 + Math.min(a.width, 580) * .8 + Math.ceil((c.data.parts?.length || 0) / (small ? 1 : 2)) * 29 + (c.data.rows?.length || 0) * (small ? 150 : 125),
      'columns-leaders': small ? (c.data.rows?.length || 1) * 76 + 110 : Math.max(740, (c.data.rows?.length || 1) * 43 + 160),
      'stacked-area': small ? 810 + (c.data.overlay ? 28 : 0) : 710,
      'stacked-bars': c.data.annotations ? (small ? Math.max(850, 735 + (c.data.series?.length || 0) * 28) : 760) : small ? Math.max(645, 533 + (c.data.series?.length || 0) * 28) : 670,
      'grouped-bars': (c.data.rows?.length || 1) * (small ? 110 : 75) + (small ? 120 : 100),
      donut: Math.ceil((c.data.periods?.length || 1) / (small ? 1 : 2)) * (c.data.reference != null ? 450 : 400) + 115,
      slope: small ? 560 : 710,
      'range-bubbles': Math.ceil((c.data.rows?.length || 1) / (small ? 2 : 4)) * (small ? 210 : 260) + 65,
      waffle: Math.ceil((c.data.rows?.length || 1) / (small ? 1 : 3)) * 290,
      treemap: c.data.diamond ? a.width*.9+150+Math.ceil((c.data.rows?.length||0)/(small?1:2))*46 : small ? 825 : 755,
      bars: (c.data.rows?.length || 1) * (small ? 76 : 46) + (c.data.reference != null ? 160 : 110),
      flows: small ? 1030 : 920};
    const type = c.type || c.kind, H = heights[type] ?? Core.height(type,c.data,a.width);
    if (small && ['bubbles','flows'].includes(type)) {
      const data = type === 'bubbles' ? c.data : c.data.nodes;
      for (const [i,d] of data.entries()) {
        const row=document.createElement('div');
        row.textContent=type === 'bubbles'
          ? String(i+1)+' · '+d[zh?0:1]+' — '+d[3]+'% · '+d[4]
          : String(i+1)+' · '+d.name[zh?0:1]+' — '+(d.value??'—');
        document.querySelector('.mobile-values').append(row);
      }
    }
    a.svg.style.height = H + 'px';
    const w = a.svg.getBoundingClientRect().width;
    a.svg.setAttribute('viewBox', `0 0 ${w} ${H}`);
    a.svg.setAttribute('role', 'img');
    a.svg.setAttribute('aria-labelledby', 'chart-title chart-desc');
    a.el('title', {id: 'chart-title'}, c.title, a.svg);
    a.el('desc', {id: 'chart-desc'}, c.description, a.svg);
    const base = a.el('g', {}, null, a.svg), labels = a.el('g', {}, null, a.svg);
    a.step(base, 200, 500);
    MBBCharts.templates[type](a, c, {w, H, zh, small, cols, panelHeight, base, labels});
    a.step(labels, 6900, 600);
    if (c.editorial) Core.editorial(a, c, H);
    a.replay();
    return a;
  }
};
let lastWidth = innerWidth, resizeTimer;
addEventListener('resize', () => {
  if (window.__mbbExportMode || innerWidth === lastWidth) return;
  lastWidth = innerWidth;
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (window.__mbbExportMode) return;
    // Read the config when the redraw runs, so a theme switch in between is kept; no replay.
    const pinned = window.mbb.pinned;
    MBBCharts.render(window.mbb.config);
    window.mbb.seek(window.mbb.duration);
    if (pinned != null && window.mbb.pin) window.mbb.pin(pinned);
  }, 100);
});
