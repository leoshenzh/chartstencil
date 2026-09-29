'use strict';
MBBCharts.templates['range-bubbles'] = (a, c, {w, H, zh, small, base, labels}) => {
  const {svg, palette: p, el, text, mark} = a;
  const rows = c.data.rows, lang = zh ? 0 : 1, cols = small ? 2 : 4;
  const pw = w / cols, ph = small ? 210 : 260, max = Math.max(...rows.map(r => r.high));
  text(base, 0, 22, zh ? '实心圆：下限；外圆边界：上限' : 'Filled circle: lower estimate; outer circle: upper estimate', {class: 'small'});
  rows.forEach((row, i) => {
    const x = i % cols * pw, y = 48 + Math.floor(i / cols) * ph;
    const group = el('g', {}, null, svg), cx = x + pw / 2, cy = y + (small ? 75 : 96);
    const r = a.radius(row.high, max, small ? 62 : 86), inner = a.radius(row.low, max, small ? 62 : 86);
    const ink = p.text;
    el('circle', {cx, cy, r, fill: 'none', stroke: ink, 'stroke-width': 2}, null, group);
    el('circle', {cx, cy, r: inner, fill: p.data}, null, group);
    text(group, cx, y + (small ? 153 : 197), row.name[lang], {'text-anchor': 'middle', 'font-weight': 700});
    text(group, cx, y + (small ? 178 : 224), `${row.low}–${row.high}`, {'text-anchor': 'middle', class: 'small'});
    const hot = el('circle', {cx, cy, r: Math.max(14, r), fill: 'transparent', style: 'pointer-events:all'}, null, group);
    mark(group, {target: hot, label: `${row.name[lang]}\n${row.low}–${row.high} ${c.data.unit[lang]}\n${zh ? '两个圆的面积分别编码上下限' : 'Circle areas encode lower and upper values'}`}, 1000 + i * 400);
  });
};
