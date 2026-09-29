'use strict';
MBBCharts.templates['component-diagram'] = (a, c, {w, zh, small, base, labels}) => {
  const {svg, palette: p, el, text, line, mark} = a;
  const d = c.data, lang = zh ? 0 : 1, size = Math.min(w, 580), ox = (w - size) / 2, sy = 45;
  const figure = el('g', {transform: `translate(${ox},${sy}) scale(${size / 100})`, fill: 'none', stroke: p.muted, 'stroke-width': 1}, null, base);
  d.figure.forEach(path => el('path', {d: path}, null, figure));
  d.parts.forEach((part, i) => {
    const cx = ox + part.x * size / 100, cy = sy + part.y * size / 100, group = el('g', {}, null, svg);
    const circle = el('circle', {cx, cy, r: small ? 9 : 13, fill: part.focus ? p.accent : p.data, stroke: p.text}, null, group);
    text(group, cx, cy + 4, String(i + 1), {'text-anchor': 'middle', class: 'small', style: `fill:${MBB.ink(part.focus ? p.accent : p.data)}`});
    mark(group, {target: circle, label: part.name[lang]}, 1000 + i * 450);
    MBB.wrapText(base, small ? 0 : i % 2 * w / 2, sy + size * .8 + 40 + (small ? i : Math.floor(i / 2)) * 29, `${i + 1}. ${part.name[lang]}`, small ? w : w / 2 - 15, {class: 'small'}, 18);
  });
  const top = sy + size * .8 + 80 + Math.ceil(d.parts.length / (small ? 1 : 2)) * 29;
  line(labels, w / 2, top - 30, w / 2, top - 10, {stroke: p.accent, 'stroke-width': 2});
  text(base, 0, top + 14, d.detailTitle[lang], {'font-weight': 700});
  d.rows.forEach((row, i) => {
    const y = top + 70 + i * (small ? 150 : 125);
    text(base, 0, y - 17, row.name[lang], {class: 'small', 'font-weight': 700});
    let x = 0;
    row.values.forEach((entry, j) => {
      const width = w * entry.value / 100, color = entry.focus ? p.accent : p.categories[(entry.color || 0) % 5], group = el('g', {}, null, svg);
      const bar = el('rect', {x, y, width, height: 32, fill: color, stroke: p.background}, null, group);
      if (width > 30) text(group, x + width / 2, y + 22, `${entry.value}%`, {'text-anchor': 'middle', class: 'small', style: `fill:${MBB.ink(color)}`});
      mark(group, {target: bar, label: `${row.name[lang]} · ${entry.name[lang]}\n${entry.value}%`}, 3100 + i * 500 + j * 180);
      MBB.wrapText(base, j % 2 * w / 2, y + 59 + Math.floor(j / 2) * (small ? 27 : 21), `${entry.name[lang]} ${entry.value}%`, w / 2 - 8, {class: 'small'}, 17);
      x += width;
    });
  });
};
