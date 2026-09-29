'use strict';
MBBCharts.templates['unit-flow'] = (a, c, {w, zh, small, base, labels}) => {
  const {svg, palette: p, el, text, line, mark} = a;
  const d = c.data, lang = zh ? 0 : 1, left = small ? 34 : 120, right = w - (small ? 80 : 220), rows = d.rows;
  text(base, 0, 28, d.origin[lang], {'font-weight': 700});
  const unit = d.unitValue || 1, grid = Math.min(12, (right - left) / 9), start = 100;
  let sourceIndex = 0;
  rows.forEach((row, k) => {
    const group = el('g', {}, null, svg), count = row.value / unit, top = 90 + k * 155, color = p.categories[k];
    let target;
    for (let i = 0; i < count; i++) {
      const n = sourceIndex++, sx = left + n % 10 * grid, sy = start + Math.floor(n / 10) * grid;
      el('circle', {cx: sx, cy: sy, r: grid * .29, fill: color}, null, group);
      const dot = el('circle', {cx: right + i % 8 * grid, cy: top + Math.floor(i / 8) * grid, r: grid * .29, fill: color}, null, group);
      target ||= dot;
    }
    const sy = start + (sourceIndex - count / 2) / 10 * grid, ty = top + Math.ceil(count / 8) * grid / 2;
    el('path', {d: `M${left + 10 * grid} ${sy} C${w / 2} ${sy},${w / 2} ${ty},${right - 12} ${ty}`, fill: 'none', stroke: color, 'stroke-width': 3, style: 'pointer-events:stroke'}, null, group);
    el('path', {d: `M${right - 18} ${ty - 5} L${right - 10} ${ty} L${right - 18} ${ty + 5}`, fill: 'none', stroke: color, 'stroke-width': 2}, null, group);
    mark(group, {target, label: `${d.origin[lang]} → ${row.name[lang]}\n${row.value} ${d.unit[lang]}`}, 1000 + k * 1600);
    MBB.wrapText(base, right - (small ? 20 : 0), top + Math.ceil(count / 8) * grid + 25, `${row.name[lang]} · ${row.value}`, w - right + (small ? 20 : 0), {class: 'small'}, 17);
  });
  MBB.wrapText(labels, 0, Math.max(90 + rows.length * 155, start + Math.ceil(sourceIndex / 10) * grid) + 25, `${zh ? '每点代表' : 'Each dot represents'} ${unit} ${d.unit[lang]}`, w, {class: 'small'}, 20);
};
