'use strict';
Core.install('interval-columns', (d, w) => w < 720 ? d.rows.length * 108 + 125 : 650, v => {
  const {a, d, w, small, base, labels, name, label, color, group, mark, unit} = v;
  const max = Math.max(...d.rows.map(r => r.high));
  const ticks = MBB.ticks(0, max), step = ticks[1] - ticks[0] || max;
  const ceiling = Math.ceil(max / step) * step;
  if (small) {
    const left = 16, right = w - 26, x = n => left + n / ceiling * (right - left);
    MBB.ticks(0, ceiling).forEach(n => {
      a.line(base, x(n), 35, x(n), d.rows.length * 108 + 30);
      label(base, x(n), 22, MBB.number(n, v.c.lang), {'text-anchor': 'middle', 'data-axis-tick': 'x'});
    });
    d.rows.forEach((row, i) => {
      const y = 75 + i * 108, g = group();
      label(base, 0, y - 17, name(row.name), {'font-weight': 700});
      const rect = a.el('rect', {x: x(row.low), y, width: x(row.high) - x(row.low), height: 22, fill: color(i)}, null, g);
      label(g, row.low > max / 2 ? right : x(row.low), y + 46, `${row.low}–${row.high} ${unit}`, {'text-anchor': row.low > max / 2 ? 'end' : 'start'});
      mark(g, rect, `${name(row.name)}\n${row.low}–${row.high} ${unit}`, i, d.rows.length);
    });
    return;
  }
  const left = 65, bottom = 465, top = 45, pitch = (w - left - 15) / d.rows.length;
  const y = n => bottom - n / ceiling * (bottom - top);
  MBB.ticks(0, ceiling).forEach(n => {
    a.line(base, left, y(n), w - 10, y(n));
    label(base, left - 10, y(n) + 5, MBB.number(n, v.c.lang), {'text-anchor': 'end', 'data-axis-tick': 'y'});
  });
  d.rows.forEach((row, i) => {
    const x = left + (i + .5) * pitch, g = group(), bw = Math.min(70, pitch * .5);
    const bar = a.el('rect', {x: x - bw / 2, y: y(row.high), width: bw, height: y(row.low) - y(row.high), fill: color(i)}, null, g);
    label(g, x, y(row.high) - 13, String(row.high), {'text-anchor': 'middle'});
    label(g, x, y(row.low) + 22, String(row.low), {'text-anchor': 'middle'});
    const labelY = bottom + 67 + i % 2 * 72;
    a.line(g, x, y(row.low) + 31, x, labelY - 18, {stroke: a.palette.muted});
    MBB.wrapText(g, x, labelY, name(row.name), pitch * 1.65, {'text-anchor': 'middle', class: 'small'}, 22);
    mark(g, bar, `${name(row.name)}\n${row.low}–${row.high} ${unit}`, i, d.rows.length);
  });
  label(labels, 0, 639, v.c.lang === 'zh' ? '色块上下边界分别为估计区间上限和下限。' : 'Each block spans the lower and upper estimates.');
});
