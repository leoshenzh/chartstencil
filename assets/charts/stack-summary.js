'use strict';
Core.install('stack-summary', (d, w) => w < 720 ? 740 + d.series.length * 58 : Math.max(740, 230 + d.series.length * 58), v => {
  const {a, d, w, small, base, labels, name, label, color, group, mark} = v;
  MBBCharts.templates['stacked-bars'](a, v.c, {...v, w: small ? w : w - 325, H: 720, zh: v.c.lang === 'zh', base, labels});
  if (small) base.querySelectorAll('text.small').forEach(node => node.style.fontSize = '12px');
  const x = small ? 0 : w - 300, top = small ? 700 : 150, available = w - x;
  const first = available * .48, column = (available - first) / d.summaryTable.headings.length;
  d.summaryTable.headings.forEach((heading, j) => MBB.wrapText(base, x + first + (j + .5) * column, top - 25, name(heading), column - 5, {'text-anchor': 'middle', style: 'font-size:14px;font-weight:700'}, 19));
  d.series.forEach((series, i) => {
    const y = top + 55 + i * 58;
    if (d.summaryTable.highlight === i) a.el('rect', {x: x - 3, y: y - 25, width: available, height: 43, fill: v.p.muted, 'fill-opacity': .12}, null, base);
    a.el('rect', {x, y: y - 11, width: 11, height: 11, fill: color(i)}, null, base);
    MBB.wrapText(base, x + 20, y, name(series), first - 25, {style: 'font-size:14px'}, 19);
    d.summaryTable.values[i].forEach((value, j) => {
      const g = group(), cx = x + first + (j + .5) * column;
      const cell = a.el('rect', {x: cx - column / 2 + 2, y: y - 20, width: column - 4, height: 32, fill: 'transparent'}, null, g);
      const formatted = value == null ? (v.c.lang === 'zh' ? '未提供' : 'N/A') : `${MBB.number(value, v.c.lang)}${d.summaryTable.unit || ''}`;
      label(g, cx, y, formatted, {'text-anchor': 'middle', 'font-size': 14});
      mark(g, cell, `${name(series)} · ${name(d.summaryTable.headings[j])}\n${formatted}`, i * d.summaryTable.headings.length + j, d.series.length * d.summaryTable.headings.length);
    });
    a.line(base, x, y + 26, w, y + 26);
  });
});
