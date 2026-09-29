'use strict';
MBBCharts.templates['population-pyramid'] = (a, c, {w, zh, small, base}) => {
  const {svg, palette: p, el, text, line, mark} = a;
  const d = c.data, lang = zh ? 0 : 1, cx = w / 2, gutter = small ? 55 : 90, room = cx - gutter - 15;
  const max = Math.max(...d.rows.flatMap(r => r.values));
  d.sides.forEach((name, j) => text(base, cx + (j ? 1 : -1) * (gutter + room / 2), 30, name[lang], {'text-anchor': 'middle', 'font-weight': 700}));
  text(base, cx, 30, d.center[lang], {'text-anchor': 'middle', class: 'small'});
  d.rows.forEach((row, i) => {
    const y = 90 + i * 70;
    MBB.wrapText(base, cx, y + 9, row.name[lang], gutter * 2 - 10, {'text-anchor': 'middle', class: 'small'}, 18);
    row.values.forEach((value, j) => {
      const length = value / max * room, x = j ? cx + gutter : cx - gutter - length, color = p.categories[j];
      const group = el('g', {}, null, svg), rect = el('rect', {x, y: y - 15, width: Math.max(length, 2), height: 35, fill: color}, null, group);
      if (length > 40) text(group, j ? x + 7 : x + length - 7, y + 8, `${value}`, {'text-anchor': j ? 'start' : 'end', style: `fill:${MBB.ink(color)}`, class: 'small'});
      mark(group, {target: rect, label: `${row.name[lang]} · ${d.sides[j][lang]}\n${value} ${d.unit[lang]}`}, 1000 + i * 500 + j * 150);
    });
  });
  const bottom = 70 + d.rows.length * 70;
  line(base, cx - gutter, 60, cx - gutter, bottom); line(base, cx + gutter, 60, cx + gutter, bottom);
  MBB.wrapText(base, 0, bottom + 40, d.note[lang], w, {class: 'small'}, 20);
};
