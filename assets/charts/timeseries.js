'use strict';
MBBCharts.templates.timeseries = (a, c, {w, H, zh, small, base, labels}) => {
  const {svg, palette: p, el, text, line, mark, step} = a;
  const {times, series, yDomain, yStep, xTicks, today, forecast} = c.data;
  const left = small ? 42 : 58, right = small ? w - 16 : w * .72, top = 35, bottom = small ? 490 : 622;
  const px = t => left + (t - times[0]) / (times.at(-1) - times[0]) * (right - left);
  const py = v => bottom - (v - yDomain[0]) / (yDomain[1] - yDomain[0]) * (bottom - top);
  const colors = [p.text, p.data, p.categories[1], p.categories[2], p.categories[3], p.categories[4], p.ordinal[3]];
  const patterns = ['', '6 4', '2 4'];
  for (const v of MBB.ticks(yDomain[0], yDomain[1], yStep ? (yDomain[1] - yDomain[0]) / yStep : 5)) {
    line(base, left, py(v), right, py(v));
    text(base, left - 9, py(v) + 5, MBB.number(v,c.lang), {'text-anchor': 'end', class: 'small', 'data-axis-tick':'y'});
  }
  xTicks.forEach(t => text(base, px(t), bottom + 28, String(t), {'text-anchor': 'middle', class: 'small'}));
  if (today || forecast) {
    const year = today || forecast, x = px(year);
    line(labels, x, top, x, bottom, {class: 'axis', 'stroke-dasharray': '4 4'});
    text(labels, x + 7, top + 20, today ? ((zh?'参考：':'Reference: ')+String(today)) : (zh ? '预测期 →' : 'Forecast →'), {class: 'small', 'font-weight': 700});
  }
  const defs = el('defs', {}, null, svg);
  const clip = el('clipPath', {id: 'line-reveal'}, null, defs);
  const reveal = el('rect', {x: left - 2, y: top - 4, width: right - left + 4, height: bottom - top + 8}, null, clip);
  let legendY = small ? 553 : 35;
  series.forEach((s, i) => {
    const color = colors[s.color % colors.length], pattern = patterns[s.pattern || 0];
    const path = el('path', {
      d: s.values.map((v, j) => `${j ? 'L' : 'M'}${px(times[j])},${py(v)}`).join(' '),
      fill: 'none', stroke: color, 'stroke-width': 2.4, 'stroke-dasharray': pattern, 'clip-path': 'url(#line-reveal)'
    }, null, svg);
    step(path, 1000, 5000, progress => reveal.setAttribute('width', progress * (right - left + 4)));
    const lx = small ? left : right + 27;
    line(base, lx, legendY - 5, lx + (small ? 22 : 48), legendY - 5, {class: 'legend-line', stroke: color, 'stroke-width': 2.4, 'stroke-dasharray': pattern});
    if (c.data.legendDots) el('circle', {cx: lx + (small ? 22 : 48), cy: legendY - 5, r: 3, fill: color}, null, base);
    const nameX = small ? lx + 32 : lx + 58;
    const name = MBB.wrapText(base, nameX, legendY, s.name[zh ? 0 : 1], w - nameX - 4, {'font-weight': 700, 'font-style': today || c.data.legendItalic ? 'italic' : 'normal', class: small ? 'small' : 'series-name'}, small ? 16 : 21);
    legendY += name.height + (small ? 9 : 10);
    if (s.description?.[zh ? 0 : 1]) {
      const description = MBB.wrapText(base, lx, legendY, s.description[zh ? 0 : 1], w - lx - 8, {class: 'small'}, small ? 16 : 20);
      legendY += description.height + 28;
    }
  });
  // Each nearest-time band reports every series; no invisible gaps between tiny points.
  times.forEach((t, j) => {
    const x = px(t), x0 = j ? (px(times[j - 1]) + x) / 2 : left;
    const x1 = j === times.length - 1 ? right : (x + px(times[j + 1])) / 2;
    const band = el('rect', {x: x0, y: top, width: Math.max(.1, x1 - x0), height: bottom - top, fill: 'transparent', style: 'pointer-events:fill'}, null, svg);
    const period = String(t);
    mark(band, {label: `${period} · ${(c.data.unit?.[zh?0:1]||'')}\n${series.map(s => `${s.name[zh ? 0 : 1]}: ${s.values[j]}`).join('\n')}\n${zh ? '数值来自输入数据' : 'Values from the input dataset'}`, crosshair: {x, y1: top, y2: bottom}, valueCount: series.length}, 1000 + j / (times.length - 1) * 4500);
  });
};
