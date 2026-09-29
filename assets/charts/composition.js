'use strict';
// Compose existing renderers with separate units and scales; each child keeps its data marks.
MBBCharts.templates.composition = (a, c, {w, zh, small}) => {
  const cols = small ? 1 : c.data.cols || 2, gap = small ? 0 : 35, pw = (w - gap * (cols - 1)) / cols;
  let top = 0;
  if (c.data.sharedLegend) {
    const names = c.data.panels[0].data.series.map(s => s.name), colors = MBBCharts.areaColors(c.theme), legendCols = small ? 1 : 3;
    names.forEach((name, i) => {
      const x = i % legendCols * w / legendCols, y = 18 + Math.floor(i / legendCols) * 28;
      a.el('rect', {x, y: y - 13, width: 14, height: 14, fill: colors[i]}, null, a.svg);
      a.text(a.svg, x + 23, y, name[zh ? 0 : 1], {class: 'small'});
    });
    top = Math.ceil(names.length / legendCols) * 28 + 25;
  }
  for (let row = 0; row < Math.ceil(c.data.panels.length / cols); row++) {
    const panels = c.data.panels.slice(row * cols, row * cols + cols);
    panels.forEach((panel, j) => {
      const H = panel.height, group = a.el('g', {transform: `translate(${j * (pw + gap)},${top + 65})`}, null, a.svg);
      const base = a.el('g', {}, null, group), labels = a.el('g', {}, null, group);
      MBB.wrapText(a.svg, j * (pw + gap), top + 25, panel.name[zh ? 0 : 1], pw, {'font-weight': 700}, 21);
      a.step(base, 200, 500); a.step(labels, 6900, 600);
      MBBCharts.templates[panel.type]({...a, svg: group}, {...c, kind: `${c.kind}-${row}-${j}`, data: {...panel.data, hideLegend: Boolean(c.data.sharedLegend)}}, {w: pw, H, zh, small: pw < 720, base, labels});
    });
    if (small && c.editorial) a.svg.querySelectorAll('text.small').forEach(n => n.style.fontSize = '12px');
    top += Math.max(...panels.map(p => p.height)) + 105;
  }
};
