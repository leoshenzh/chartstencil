/* One dot per observation; facets preserve both destination and subgroup. */
'use strict';
Core.install('faceted-unit-flow', (d, w) => 145 + d.rows.length * (w < 720 ? 255 : 190), v => {
  const {a, d, w, small, base, labels, name, label, color, group, mark, unit} = v;
  const pitch = small ? 255 : 190;
  const centers = [w / 6, w / 2, w * 5 / 6];
  d.destinations.forEach((n, i) => label(base, centers[i], 24, name(n), {'text-anchor': 'middle', 'font-weight': 700}));
  d.series.forEach((n, i) => {
    a.el('circle', {cx: 8, cy: 52 + i * 25, r: 5, fill: color(i)}, null, base);
    label(base, 22, 57 + i * 25, name(n));
  });
  d.rows.forEach((row, i) => {
    const top = 120 + i * pitch;
    label(base, 0, top, name(row.name), {'font-weight': 700});
    const columns = [row.left, row.left.map((n, j) => n + row.right[j]), row.right];
    const maxCount = Math.max(...columns.map(values => values.reduce((sum, n) => sum + n, 0)));
    const gridCols = small ? 5 : 10;
    const spacing = Math.min(small ? 13 : 14, (w / 3 - 30) / gridCols);
    const gridRows = Math.ceil(maxCount / gridCols);
    columns.forEach((values, j) => {
      const g = group(), left = centers[j] - (gridCols - 1) * spacing / 2;
      let offset = 0;
      values.forEach((count, k) => {
        const subgroup = a.el('g', {}, null, g);
        let target;
        for (let n = 0; n < count; n++) {
          const index = offset++;
          const dot = a.el('circle', {
            cx: left + index % gridCols * spacing,
            cy: top + 28 + Math.floor(index / gridCols) * spacing,
            r: spacing * .34, fill: color(k),
          }, null, subgroup);
          target ||= dot;
        }
        if (target) mark(subgroup, target, `${name(row.name)} · ${name(d.destinations[j])}\n${name(d.series[k])}: ${count} ${unit}`, i * 6 + j * 2 + k, d.rows.length * 6);
      });
      label(base, centers[j], top + 39 + gridRows * spacing, String(offset), {'text-anchor': 'middle'});
    });
    [0, 2].forEach(j => {
      const direction = j ? 1 : -1;
      const x = w / 2 + direction * w / 6;
      const y = top + 50;
      a.el('path', {d: `M${x - direction * 12} ${y}h${direction * 24}m${-direction * 6} -5l${direction * 6} 5l${-direction * 6} 5`, fill: 'none', stroke: a.palette.muted, 'stroke-width': 2}, null, base);
    });
    a.line(base, 0, top + pitch - 23, w, top + pitch - 23);
  });
  MBB.wrapText(labels, 0, 132 + d.rows.length * pitch, v.c.lang === 'zh' ? `每点代表 1 ${unit}；中列为左右两列之和。` : `Each dot represents 1 ${unit}; the middle column sums both destinations.`, w, {style: `font-size:${small ? 14 : 18}px`}, 22);
});
