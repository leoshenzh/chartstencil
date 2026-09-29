'use strict';
Core.install('nested-voronoi', 900, v => {
  const {a, d, w, small, base, name, label, color, group, mark, unit} = v;
  const totals = d.groups.map(g => g.rows.reduce((sum, row) => sum + row.value, 0));
  if (d.groups.some(g => g.rows.some(row => !(row.value > 0)))) throw Error('Area values must be positive');
  const boundary = Array.from({length: 40}, (_, i) => [.5 + .5 * Math.cos(i * Math.PI / 20), .5 + .5 * Math.sin(i * Math.PI / 20)]);
  const parents = MBBCharts.powerCells(totals, boundary), size = small ? w - 40 : Math.min(w - 250, 650), ox = small ? 20 : 105, oy = 60;
  const point = ([x, y]) => [ox + x * size, oy + y * size];
  const all = d.groups.flatMap(g => g.rows), outside = [];
  let index = 0;
  d.groups.forEach((parent, k) => {
    const cells = MBBCharts.powerCells(parent.rows.map(row => row.value), parents[k].polygon);
    parent.rows.forEach((row, j) => {
      const cell = cells[j], g = group(), fill = color(k), [cx, cy] = point(cell.center);
      const polygon = a.el('polygon', {points: cell.polygon.map(p => point(p).join(',')).join(' '), fill, stroke: v.p.background, 'stroke-width': 1.5, 'data-area': cell.area, 'data-target-area': cell.target}, null, g);
      const number = ++index, isTiny = cell.area < (small ? .075 : .04);
      if (isTiny) outside.push({number, row, cx, cy, fill});
      else {
        label(g, cx, cy - 3, small ? String(number) : name(row.name), {'text-anchor': 'middle', 'font-size': small ? 14 : 16, style: `fill:${MBB.ink(fill)}`});
        label(g, cx, cy + 21, MBB.number(row.value, v.c.lang), {'text-anchor': 'middle', 'font-size': small ? 15 : 19, style: `fill:${MBB.ink(fill)};font-weight:700`});
      }
      mark(g, polygon, `${name(parent.name)} · ${name(row.name)}\n${MBB.number(row.value, v.c.lang)} ${unit}`, number - 1, all.length);
    });
    a.el('polygon', {points: parents[k].polygon.map(p => point(p).join(',')).join(' '), fill: 'none', stroke: v.p.background, 'stroke-width': 4, 'pointer-events': 'none'}, null, v.labels);
  });
  // Small leaves get short, ordered leaders; mobile uses a numbered key below.
  for (const right of [false, true]) {
    const leaves = outside.filter(r => (r.cx >= ox + size / 2) === right).sort((a, b) => a.cy - b.cy);
    leaves.forEach((row, i) => {
      const targetY = Math.max(oy + 25 + i * 44, Math.min(oy + size - 25 - (leaves.length - 1 - i) * 44, row.cy));
      const tx = right ? ox + size + (small ? 0 : 15) : ox - (small ? 0 : 15);
      a.line(base, row.cx, row.cy, tx, targetY, {class: '', stroke: v.p.text});
      label(base, tx, targetY - 5, small ? String(row.number) : `${name(row.row.name)} ${MBB.number(row.row.value, v.c.lang)}`, {'text-anchor': right ? 'start' : 'end', 'font-size': small ? 13 : 14});
    });
  }
  let y = oy + size + 45;
  d.groups.forEach((parent, k) => {
    a.el('rect', {x: 0, y: y - 14, width: 15, height: 15, fill: color(k)}, null, base);
    label(base, 25, y, `${name(parent.name)} · ${MBB.number(totals[k], v.c.lang)} ${unit}`, {'font-size': small ? 15 : 18});
    y += 32;
  });
  if (small) all.forEach((row, i) => {label(base, 0, y, `${i + 1} · ${name(row.name)} · ${MBB.number(row.value, v.c.lang)} ${unit}`, {'font-size': 14}); y += 28;});
});
