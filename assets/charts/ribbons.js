'use strict';
MBBCharts.templates.ribbons = (a, c, layout) => {
  const {svg, palette: p, el, text, line, mark, step} = a;
  const {w, H, zh, small, cols, panelHeight, base, labels} = layout;
    const {names, before, after, years, unit} = c.data;
    const order = after.map((v, i) => i).sort((i, j) => after[j] - after[i]);
    const gap = (H - 205) / Math.max(1, names.length - 1), top = 80, rmax = small ? 29 : 44;
    const maxValue = Math.max(...before, ...after), focus = c.data.focus ?? names.length - 1;
    const beforeOrder = before.map((v, i) => i).sort((i, j) => before[j] - before[i]);
    const X = (side, rank) => side === 0
      ? w * (small ? .34 : .33) - Math.sin(rank / Math.max(1, names.length - 1) * Math.PI) * w * (small ? .05 : .07)
      : w * (small ? .66 : .67) + Math.sin(rank / Math.max(1, names.length - 1) * Math.PI) * w * (small ? .05 : .07);
    const paths = el('g', {}, null, svg), dots = el('g', {}, null, svg);
    text(base, X(0, 0), 20, String(years[0]), {'text-anchor': 'middle', 'font-weight': 700});
    text(base, X(1, 0), 20, String(years[1]), {'text-anchor': 'middle', 'font-weight': 700});
    for (let i = 0; i < names.length; i++) {
      const name = names[i][zh ? 0 : 1], rank = order.indexOf(i), oldRank = beforeOrder.indexOf(i);
      const x1 = X(0, oldRank), x2 = X(1, rank), y1 = top + oldRank * gap, y2 = top + rank * gap;
      const color = (i === focus ? p.accent : p.categories[i % (p.categories.length - 1)]), start = i === focus ? 5300 : 1100 + i / Math.max(1, names.length - 1) * 3250;
      const path = el('path', {
        d: `M${x1},${y1} C${w * .49},${y1} ${w * .51},${y2} ${x2},${y2}`,
        fill: 'none', stroke: color, 'stroke-width': small ? (i === focus ? 24 : 20) : (i === focus ? 40 : 34),
        'stroke-opacity': .82
      }, null, paths);
      step(path, start, 1400, true);
      mark(path, {
        label: `${name}\n${years[0]}: ${before[i]} · ${zh ? '排名' : 'Rank'} ${oldRank + 1}\n${years[1]}: ${after[i]} · ${zh ? '排名' : 'Rank'} ${rank + 1}\n${zh ? '名次变化（正数为上升）' : 'Rank change (positive = up)'}: ${oldRank - rank > 0 ? '+' : ''}${oldRank - rank}\n${zh ? '单位：' : 'Unit: '}${unit[zh ? 0 : 1]}`,
        kind: 'ribbon'
      }, start, false);
      for (const [year, value, x, y, r] of [[years[0], before[i], x1, y1, oldRank], [years[1], after[i], x2, y2, rank]]) {
        const g = el('g', {}, null, dots), rad = a.radius(value, maxValue, rmax);
        const circle = el('circle', {cx: x, cy: y, r: rad, fill: color, stroke: p.background, 'stroke-width': 1.5}, null, g);
        step(circle, start + 500, 600);
        const hit = el('circle', {cx: x, cy: y, r: Math.max(rad, 14), fill: 'transparent'}, null, g);
        mark(hit, {label: `${name} · ${year}\n${value} ${unit[zh ? 0 : 1]}\n${zh ? '排名' : 'Rank'} ${r + 1}`}, start + 500);
        const valueText = text(g, x, y + 5, String(value), {
          'text-anchor': 'middle', style: `font-size:${small ? 12 : 18}px;fill:${MBB.ink(color)}`, 'font-weight': 700
        });
        step(valueText, start + 900, 300);
        const lx = year === years[0] ? x - rad - 10 : x + rad + 10;
        const label = text(g, lx, y + 5, `${r + 1} ${name}`, {
          'text-anchor': year === years[0] ? 'end' : 'start',
          style: `font-size:${small ? 11 : 18}px`, 'font-weight': i === focus ? 700 : 400
        });
        step(label, start + 700, 350);
      }
    }
    a.note(labels, small ? 4 : 20, H - 55, [
      zh ? `${names[focus][0]}：从第 ${beforeOrder.indexOf(focus) + 1} 位${beforeOrder.indexOf(focus) > order.indexOf(focus) ? '升至' : beforeOrder.indexOf(focus) < order.indexOf(focus) ? '降至' : '保持'}第 ${order.indexOf(focus) + 1} 位` : `${names[focus][1]}: rank ${beforeOrder.indexOf(focus) + 1} → ${order.indexOf(focus) + 1}`,
      zh ? '圆面积表示数量；彩带连接同一对象' : 'Bubble area encodes quantity; ribbons link each entity'
    ]);

};
