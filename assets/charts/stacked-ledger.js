'use strict';
Core.install('stacked-ledger', (d, w) => {
  const legend = Math.ceil(d.series.length / (w < 720 ? 2 : 4)) * 30 + 70;
  const scale = d.weighted ? 40 / Math.min(...d.rows.map(r => r.weight)) : 1;
  return legend + d.rows.reduce((sum, r) => sum + (d.weighted ? r.weight * scale : 30) + (w < 720 ? 110 : d.contiguous ? 0 : 80), 0) + 30;
}, v => {
  const {a, d, w, small, base, name, label, color, group, mark, unit} = v;
  const colors = d.ordinal ? a.palette.ordinal : [...a.palette.categories, a.palette.muted, a.palette.text];
  if (d.series.length > colors.length) throw new Error('Too many categories for distinct colors; split the chart into facets.');
  const fillFor = i => colors[i];
  const cols = small ? 2 : 4, legendRows = Math.ceil(d.series.length / cols);
  d.series.forEach((n, i) => {
    const x = i % cols * w / cols, y = 22 + Math.floor(i / cols) * 30;
    a.el('rect', {x, y: y - 12, width: 12, height: 12, fill: fillFor(i)}, null, base);
    label(base, x + 20, y, name(n), {'font-size': small ? 12 : 15});
  });
  const left = small ? 0 : d.contiguous ? 250 : 205, right = w - (small ? 0 : 130);
  const scale = d.weighted ? 40 / Math.min(...d.rows.map(r => r.weight)) : 1;
  let top = legendRows * 30 + 60;
  if (d.summaryLabel && !small) label(base, right + 20, top - 23, name(d.summaryLabel), {'font-size': 15});
  if (d.contiguous && !small) {
    const total = d.rows.reduce((sum, row) => sum + row.weight, 0);
    MBB.ticks(0, total).forEach(value => {
      const y = top + (total - value) * scale;
      a.line(base, left - 25, y, left - 15, y);
      label(base, left - 30, y + 5, MBB.number(value, v.c.lang), {'text-anchor':'end','font-size':14,'data-axis-tick':'y'});
    });
    [0,25,50,75,100].forEach(value => label(base, left + value/100*(right-left), top + total*scale + 30, String(value), {'text-anchor':'middle','font-size':14,'data-axis-tick':'x'}));
  }
  d.rows.forEach((row, i) => {
    const height = d.weighted ? row.weight * scale : 30;
    const total = row.values.reduce((sum, n) => sum + n, 0);
    if (row.highlight) a.el('rect', {x: 0, y: top - (small ? 31 : 10), width: w, height: height + (small ? 92 : 40), fill: a.palette.muted, opacity: .12}, null, base);
    MBB.wrapText(base, small ? 0 : left - (d.contiguous ? 75 : 16), top + (small ? -15 : height / 2 + 5), name(row.name), small ? w : left - (d.contiguous ? 80 : 25), {'text-anchor': small ? 'start' : 'end', style: `font-size:${small ? 14 : 17}px`}, 22);
    let offset = 0;
    row.values.forEach((value, j) => {
      const width = value / total * (right - left), g = group(), fill = fillFor(j), x = left + offset;
      const rect = a.el('rect', {x, y: top, width, height, fill, stroke: a.palette.background, 'stroke-width': .6}, null, g);
      if (width > 30) label(g, x + width / 2, top + height / 2 + 5, MBB.number(value, v.c.lang), {'text-anchor': 'middle', 'font-size': small ? 13 : 16, style: `fill:${MBB.ink(fill)}`});
      if (value) mark(g, rect, `${name(row.name)} · ${name(d.series[j])}\n${value}${unit}${d.weighted ? `\n${name(d.weightLabel)}: ${row.weight}` : ''}`, i * d.series.length + j, d.rows.length * d.series.length);
      offset += width;
    });
    if (row.summary != null) label(base, small ? 0 : right + 20, small ? top + height + 24 : top + height / 2 + 5, `${small ? name(d.summaryLabel) + ': ' : ''}${row.summary}`, {'font-weight': 700, 'font-size': small ? 14 : 17});
    (d.brackets || []).forEach(bracket => {
      const prefix = row.values.slice(0, bracket.start).reduce((s, n) => s + n, 0);
      const value = row.values.slice(bracket.start, bracket.end + 1).reduce((s, n) => s + n, 0);
      const x1 = left + prefix / total * (right - left), x2 = x1 + value / total * (right - left), y = top + height + 8;
      a.el('path', {d: `M${x1} ${y}v10H${x2}v-10`, fill: 'none', stroke: a.palette.muted}, null, base);
      label(base, Math.max(left + 50, Math.min(right - 50, (x1 + x2) / 2)), y + 32, `${name(bracket.name)} ${MBB.number(value, v.c.lang)}`, {'text-anchor': 'middle', 'font-size': small ? 12 : 15});
    });
    top += height + (small ? 110 : d.contiguous ? 0 : 80);
  });
});
