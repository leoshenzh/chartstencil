'use strict';
MBBCharts.templates['stacked-range'] = (a, c, {w, zh, small, base}) => {
  const {svg, palette: p, el, text, line, mark} = a;
  const d = c.data, lang = zh ? 0 : 1, left = small ? 0 : 210, right = w - 45, max = Math.max(...d.rows.map(r => r.high));
  const x = v => left + v / max * (right - left), pitch = small ? 108 : 78;
  d.rows.forEach((row, i) => {
    const y = 75 + i * pitch, group = el('g', {}, null, svg);
    MBB.wrapText(base, small ? 0 : left - 16, y - (small ? 28 : -4), row.name[lang], small ? w : left - 22, {'text-anchor': small ? 'start' : 'end', class: 'small'}, 18);
    let cumulative = 0;
    const values = row.values || [row.low];
    values.forEach((v, j) => {
      const rect = el('rect', {x: x(cumulative), y: y - 12, width: x(v) - left, height: 26, fill: p.categories[j]}, null, group);
      if (row.values) mark(rect, {label: `${row.name[lang]} · ${d.series[j][lang]}\n${v} ${d.unit[lang]}`}, 1000 + i * 550 + j * 200);
      cumulative += v;
    });
    const range = line(group, x(row.low), y + 27, x(row.high), y + 27, {stroke: p.accent, 'stroke-width': 4});
    [row.low, row.high].forEach(v => line(group, x(v), y + 20, x(v), y + 34, {stroke: p.accent, 'stroke-width': 2}));
    text(group, x(row.low), y + 53, `${row.low}–${row.high}`, {'text-anchor': 'end', class: 'small'});
    mark(range, {kind: 'ribbon', label: `${row.name[lang]}\n${d.rangeLabel[lang]}: ${row.low}–${row.high} ${d.unit[lang]}`}, 1000 + i * 550);
    if (!row.values) mark(group, {target: group.querySelector('rect'), label: `${row.name[lang]}\n${zh ? '区间下限' : 'Lower bound'}: ${row.low} ${d.unit[lang]}\n${zh ? '组成项：未提供' : 'Components not provided'}`}, 1000 + i * 550);
  });
};
