'use strict';
MBBCharts.templates['timeline-table'] = (a, c, {w, zh, small, base}) => {
  const {svg, palette: p, el, text, line, mark} = a;
  const d = c.data, lang = zh ? 0 : 1;
  const format = (row, entry) => `${entry.less ? '<' : row.approx ? '≈' : ''}${entry.value.toLocaleString(zh ? 'zh-CN' : 'en-US')}${row.unit[lang]}`;
  const left = small ? 0 : 210, colWidth = small ? w : (w - left) / d.periods.length;
  if (!small) d.rows.forEach((row, j) => MBB.wrapText(base, 0, 120 + j * 120, row.name[lang], left - 25, {'font-weight': 700}, 20));
  d.periods.forEach((period, i) => {
    const x = small ? 0 : left + i * colWidth, top = small ? i * 355 : 0;
    MBB.wrapText(base, small ? 0 : x + colWidth / 2, top + 27, period.name[lang], small ? w : colWidth - 16, {'text-anchor': small ? 'start' : 'middle', 'font-weight': 700}, 20);
    text(base, small ? w : x + colWidth / 2, top + (small ? 27 : 77), period.years[lang], {'text-anchor': small ? 'end' : 'middle', class: 'small'});
    d.rows.forEach((row, j) => {
      const y = top + (small ? 83 + j * 64 : 125 + j * 120), group = el('g', {}, null, svg);
      const box = el('rect', {x, y: y - 25, width: colWidth - (small ? 0 : 5), height: small ? 52 : 85, fill: p.data, 'fill-opacity': .08 + .035 * i}, null, group);
      if (small) text(group, x + 9, y - 5, row.name[lang], {class: 'small'});
      text(group, small ? w - 9 : x + colWidth / 2, y + (small ? 18 : 17), format(row, row.values[i]), {'text-anchor': small ? 'end' : 'middle', 'font-weight': 700});
      mark(group, {target: box, label: `${period.name[lang]} · ${period.years[lang]}\n${row.name[lang]}: ${format(row, row.values[i])}`}, 1000 + i * 850 + j * 220);
    });
    if (small) line(base, 0, top + 337, w, top + 337);
  });
};
