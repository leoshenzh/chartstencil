'use strict';
MBBCharts.templates.trajectory = (a, c, {w, H, zh, small, base, labels}) => {
  const {svg, palette: p, el, text, line, mark, step} = a;
  const left = small ? 42 : 100, right = small ? w - 26 : w * .78;
  const top = 50, bottom = small ? 425 : 620;
  const px = v => left + v * (right - left), py = v => bottom - v * (bottom - top);
  el('rect', {x: left, y: top, width: right - left, height: bottom - top, fill: 'none', stroke: p.grid}, null, base);
  line(base, px(.5), top, px(.5), bottom);
  line(base, left, py(.5), right, py(.5));
  for (const value of [0, .2, .4, .6, .8, 1]) {
    text(base, left - 10, py(value) + 5, value.toFixed(1), {'text-anchor': 'end', class: 'small', 'data-axis-tick':'y'});
    text(base, px(value), bottom + 23, value.toFixed(1), {'text-anchor': 'middle', class: 'small'});
  }
  text(base, left + 18, top + 45, c.data.topic || '', {class: 'serif'});
  text(base, left, 18, (c.data.yLabel?.[zh?0:1] || (zh?'指标 Y':'Metric Y')), {class: 'small'});
  text(base, left, bottom + 57, (c.data.xLabel?.[zh?0:1] || (zh?'指标 X':'Metric X')), {class: 'small'});
  const defs = el('defs', {}, null, svg);
  const arrow = el('marker', {id: 'score-arrow', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 5, markerHeight: 5, orient: 'auto-start-reverse'}, null, defs);
  el('path', {d: 'M0 0 L10 5 L0 10 Z', fill: p.muted}, null, arrow);
  const axis = {class: 'axis', 'marker-start': 'url(#score-arrow)', 'marker-end': 'url(#score-arrow)'};
  line(base, small ? 7 : left - 65, bottom, small ? 7 : left - 65, top, axis);
  line(base, left, bottom + 38, right, bottom + 38, axis);
  const legendX = small ? left : right + 32, legendY = small ? 535 : 35;
  text(base, legendX, legendY, (c.data.levelLabel?.[zh?0:1] || (zh?'等级':'Level')), {'font-weight': 700});
  text(base, legendX, legendY + 24, '1–5', {class: 'small'});
  const colors = (c.palette || c.brand) ? p.ordinal : c.theme === 'dark'
    ? ['#d2e8ff', '#a5d1ff', '#78baff', '#4ba3ff', '#1e8cff']
    : ['#8fbcf0', '#6da1df', '#4b86ce', '#296bbd', '#0750ac'];
  const formatSize = value => MBB.number(value,c.lang)+' '+(Array.isArray(c.data.sizeUnit)?c.data.sizeUnit[zh?0:1]:(c.data.sizeUnit||''));
  colors.forEach((color, i) => {
    const x = legendX + i * (small ? 34 : 28);
    el('circle', {cx: x + 8, cy: legendY + 47, r: 7, fill: color, stroke: p.muted}, null, base);
    text(base, x + 8, legendY + 73, String(i + 1), {'text-anchor': 'middle', class: 'small'});
  });
  const periods = c.data.periods, maximum = Math.max(...periods.map(d => d.size));
  const connectors = el('g', {}, null, svg);
  periods.forEach((d, i) => {
    const x = px(d.x), y = py(d.y), r = a.radius(d.size, maximum, small ? 35 : 60);
    const start = 1300 + i * 1700;
    if (i) {
      const prev = periods[i - 1];
      const connector = el('path', {d: `M${px(prev.x)},${py(prev.y)} L${x},${y}`, fill: 'none', stroke: p.muted, 'stroke-width': 2}, null, connectors);
      step(connector, start - 700, 900, true);
      mark(connector, {label: `${prev.period} → ${d.period}\n${(c.data.sizeLabel?.[zh?0:1] || (zh?'规模':'Size'))}: ${formatSize(prev.size)} → ${formatSize(d.size)}\n${zh ? '位置按输入分数绘制' : 'Positions encode input scores'}`, kind: 'ribbon'}, start, false);
    }
    const bubble = el('circle', {cx: x, cy: y, r, fill: colors[d.level - 1], stroke: p.text, 'stroke-width': 1.5}, null, svg);
    mark(bubble, {label: `${d.period}\n${(c.data.sizeLabel?.[zh?0:1] || (zh?'规模':'Size'))}: ${formatSize(d.size)}\n${'X / Y'}: ${d.x} / ${d.y}\n${(c.data.levelLabel?.[zh?0:1] || (zh?'等级':'Level'))}: ${d.level}`}, start);
    const label = text(svg, x, y + 5, String(d.period), {'text-anchor': 'middle', 'font-weight': 700, style: `fill:${MBB.ink(colors[d.level - 1])}`});
    step(label, start + 400, 400);
    const tx = i ? x - r - 12 : x + r + 12;
    const amount = text(svg, tx, y + (small ? 52 : 3), `${formatSize(d.size)}`, {'text-anchor': i ? 'end' : 'start', 'font-weight': 700});
    step(amount, start + 500, 500);
  });
};
