'use strict';
MBBCharts.templates['columns-leaders'] = (a, c, options) => {
  const {w, H, zh, small, base} = options;
  if (small) {
    MBBCharts.templates.bars(a, c, options);
    return;
  }
  const {svg, palette: p, el, text, line, mark, step} = a;
  const d = c.data, lang = zh ? 0 : 1, rightSpace = 285, left = 8;
  const pitch = (w - rightSpace - left) / d.rows.length, bw = pitch * .84;
  const bottom = H - 35, max = Math.max(...d.rows.map(r => r.value));
  d.rows.forEach((row, i) => {
    const x = left + i * pitch, top = bottom - row.value / max * (bottom - 110), labelY = 37 + i * 43;
    const color = i === d.focus ? p.accent : p.data, group = el('g', {}, null, svg);
    const bar = el('rect', {x, y: top, width: bw, height: bottom - top, fill: color}, null, group);
    line(group, x + bw / 2, Math.min(labelY + 9, top), x + bw / 2, Math.max(labelY + 9, top), {stroke: p.muted});
    el('path', {d: `M${x + bw / 2} ${labelY - 7} l5,8 l-5,8 l-5,-8 Z`, fill: p.text}, null, group);
    MBB.wrapText(group, x + bw / 2 + 12, labelY + 5, row.name[lang], w - x - bw / 2 - 18, {class: 'small'}, 18);
    text(group, x + bw / 2, top + 21, String(row.value), {'text-anchor': 'middle', class: 'small', 'font-weight': 700, style: `fill:${MBB.ink(color)}`});
    mark(bar, {label: `${row.name[lang]}\n${row.value}${d.unit[lang]}${d.sample ? `\nn=${d.sample}` : ''}`}, 1000 + i * 370);
    step(group, 1000 + i * 370, 450);
  });
};
