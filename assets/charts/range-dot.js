'use strict';
MBBCharts.templates['range-dot'] = (a, c, {w, zh, small, base, labels}) => {
  const {svg, palette: p, el, text, line, mark} = a;
  const d = c.data, lang = zh ? 0 : 1, left = small ? 18 : 190, right = w - 25;
  const min = d.min ?? Math.min(0, ...d.rows.map(r => r.low)), max = d.max ?? Math.max(...d.rows.map(r => r.high));
  const x = v => left + (v - min) / (max - min) * (right - left), rowHeight = small ? 80 : 51;
  d.rows.forEach((row, i) => {
    const y = 60 + i * rowHeight, group = el('g', {}, null, svg);
    MBB.wrapText(base, small ? 0 : left - 20, y - (small ? 29 : -4), row.name[lang], small ? w : left - 25, {'text-anchor': small ? 'start' : 'end', class: 'small'}, 17);
    const path = line(group, x(row.low), y, x(row.high), y, {stroke: p.categories[0], 'stroke-width': 5});
    [row.low, row.high].forEach((v, j) => el('circle', {cx: x(v), cy: y, r: 6, fill: p.categories[j], stroke: p.text}, null, group));
    if (row.middle != null) el('path', {d: `M${x(row.middle)},${y - 8} l8,8 l-8,8 l-8,-8 Z`, fill: p.categories[5]}, null, group);
    text(group, x(row.low), y + 24, String(row.low), {'text-anchor': 'middle', class: 'small'});
    text(group, x(row.high), y + 24, String(row.high), {'text-anchor': 'middle', class: 'small'});
    mark(group, {target: path, label: `${row.name[lang]}\n${d.ends[0][lang]}: ${row.low} ${d.unit[lang]}\n${d.ends[1][lang]}: ${row.high} ${d.unit[lang]}${row.middle == null ? '' : `\n${d.middleLabel[lang]}: ${row.middle} ${d.unit[lang]}`}`}, 1000 + i * Math.min(400, 4700 / d.rows.length));
  });
  const y = 60 + d.rows.length * rowHeight;
  line(base, left, y, right, y);
  [min, max].forEach(v => text(base, x(v), y + 22, `${v}`, {'text-anchor': 'middle', class: 'small'}));
};
