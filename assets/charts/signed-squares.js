'use strict';
Core.install('signed-squares', (d, w) => w < 720 ? 300 + d.rows.length * 35 : 660, v => {
  const {a, d, w, small, base, labels, name, label, group, mark, unit} = v;
  const roots = d.rows.map(row => Math.sqrt(Math.abs(row.value)));
  const scale = (w - 30) / roots.reduce((sum, n) => sum + n, 0);
  const maxSide = Math.max(...roots) * scale;
  let offset = 15;
  d.rows.forEach((row, i) => {
    const side = roots[i] * scale, baseline = maxSide + 50;
    const x = offset, y = row.value < 0 ? baseline : baseline - side;
    const g = group(), fill = row.value < 0 ? a.palette.accent : a.palette.data;
    const rect = a.el('rect', {x, y, width: side, height: side, fill, stroke: a.palette.background}, null, g);
    label(g, x + side / 2, y + side / 2 + 6, String(Math.abs(row.value)), {'text-anchor': 'middle', style: `fill:${MBB.ink(fill)}`});
    if (small) {
      label(base, 0, 260 + i * 35, `${i + 1} · ${name(row.name)} · ${Math.abs(row.value)}${unit}`);
      label(base, x + side / 2, row.value < 0 ? baseline - 14 : baseline + 25, String(i + 1), {'text-anchor': 'middle'});
    } else MBB.wrapText(base, x + side / 2, row.value < 0 ? baseline - 30 : baseline + 30, name(row.name), Math.max(side - 5, 70), {'text-anchor': 'middle', class: 'small'}, 21);
    mark(g, rect, `${name(row.name)}\n${Math.abs(row.value)} ${unit}\n${row.value < 0 ? name(d.negativeLabel) : name(d.positiveLabel)}`, i, d.rows.length);
    offset += side;
  });
  a.line(base, 10, maxSide + 50, w - 10, maxSide + 50);
  MBB.wrapText(labels, 0, small ? 290 + d.rows.length * 35 : 630, name(d.encodingNote), w, {class: 'small', style: `font-size:${small ? 14 : 15}px`}, 22);
});
