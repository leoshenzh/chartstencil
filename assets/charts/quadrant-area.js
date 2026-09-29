'use strict';
MBBCharts.templates['quadrant-area'] = (a, c, {w, zh, small, base}) => {
  const {svg, palette: p, el, text, line, mark} = a;
  const d = c.data, lang = zh ? 0 : 1, cols = small ? 1 : 2, pw = w / cols;
  d.panels.forEach((panel, k) => {
    const ox = k % cols * pw, oy = Math.floor(k / cols) * (small && d.centeredSquares ? w + 125 : 410), size = small && d.centeredSquares ? pw - 20 : Math.min(pw - 50, 275), left = ox + (pw - size) / 2, top = oy + 78;
    MBB.wrapText(base, ox + pw / 2, oy + 24, panel.name[lang], pw - 20, {'text-anchor': 'middle', 'font-weight': 700}, 20);
    text(base, left + size / 2, top - 18, d.xLabel?.[lang] || '', {'text-anchor': 'middle', class: 'small'});
    if (d.centeredSquares) {
      el('rect', {x:left,y:top,width:size,height:size,fill:'none',stroke:p.muted}, null, base);
      line(base,left+size/2,top,left+size/2,top+size);line(base,left,top+size/2,left+size,top+size/2);
    }
    const upper = panel.values[0] + panel.values[1], lower = panel.values[2] + panel.values[3];
    panel.values.forEach((value, i) => {
      const rowTotal = i < 2 ? upper : lower, height = size * rowTotal / 100;
      let width = size * value / rowTotal, x = left + (i % 2 ? size * panel.values[i - 1] / rowTotal : 0), y = top + (i < 2 ? 0 : size * upper / 100), rectHeight = height;
      if (d.centeredSquares) {
        width = rectHeight = size / 2 * Math.sqrt(value / 100);
        x = left + size / 2 - (i % 2 ? 0 : width);
        y = top + size / 2 - (i < 2 ? width : 0);
      }
      const color = [p.categories[4], p.categories[3], p.data, p.categories[1]][i], group = el('g', {}, null, svg);
      const rect = el('rect', {x, y, width, height: rectHeight, fill: color, stroke: p.background, 'stroke-width': 2}, null, group);
      if (width > 30 && rectHeight > 20) text(group, x + width / 2, y + rectHeight / 2 + 4, `${value}%`, {'text-anchor': 'middle', class: 'small', style: `fill:${MBB.ink(color)}`});
      mark(group, {target: rect, label: `${panel.name[lang]}\n${d.names[i][lang]}: ${value}%`}, 1000 + k * 280 + i * 450);
    });
    text(base, left, top + size + 28, d.yLabel?.[lang] || '', {class: 'small'});
    line(base, left, top + size + 43, left + size, top + size + 43);
  });
};
