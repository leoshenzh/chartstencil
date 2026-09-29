'use strict';
MBBCharts.templates.multiples = (a, c, layout) => {
  const {svg, palette: p, el, text, line, mark, step} = a;
  const {w, H, zh, small, cols, panelHeight, base, labels} = layout;
    const {values, dates, samples, panels, metric} = c.data, pw = w / cols;
    for (let k = 0; k < values.length; k++) {
      const ox = (k % cols) * pw, oy = Math.floor(k / cols) * panelHeight;
      const xx = ox + 32, right = ox + pw - 17, yt = oy + 63, yb = oy + panelHeight - 38;
      text(base, ox + pw / 2, oy + 25, panels[k][zh ? 0 : 1], {'text-anchor': 'middle', 'font-weight': 700});
      for (let v = 0; v <= 100; v += 25) {
        const y = yb - v / 100 * (yb - yt);
        line(base, xx, y, right, y);
        if (k % cols === 0) text(base, xx - 7, y + 5, String(v), {'text-anchor': 'end', class: 'small', 'data-axis-tick':'y'});
      }
      text(base, xx, yb + 27, dates[0][zh ? 0 : 1].slice(0, 4), {class: 'small'});
      text(base, right, yb + 27, dates.at(-1)[zh ? 0 : 1].match(/\d{4}/)[0], {class: 'small', 'text-anchor': 'end'});
      values[k].forEach((v, j) => {
        const x = xx + j / (dates.length - 1) * (right - xx), y = yb - v / 100 * (yb - yt), start = 1000 + k * 650 + j * 230;
        if (j) {
          const prev = values[k][j - 1];
          const seg = el('path', {
            d: `M${xx + (j - 1) / (dates.length - 1) * (right - xx)},${yb - prev / 100 * (yb - yt)} L${x},${y}`,
            fill: 'none', stroke: p.data, 'stroke-width': 3
          }, null, svg);
          step(seg, start - 100, 500, true);
        }
        const dot = el('circle', {cx: x, cy: y, r: 4.5, fill: p.data}, null, svg);
        step(dot, start, 400);
        const hot = el('circle', {cx: x, cy: y, r: 12, fill: 'transparent'}, null, svg);
        mark(hot, {
          label: `${dates[j][zh ? 0 : 1]} · ${metric[zh ? 0 : 1]}\n${values.map((row, i) => `${panels[i][zh ? 0 : 1]}: ${row[j]}%`).join('\n')}\nn=${samples[j].toLocaleString('en-US')}`,
          crosshair: {x, y1: yt, y2: yb}
        }, start);
        const label = text(svg, x, y - 13, String(v), {'text-anchor': 'middle', 'font-weight': 600, style: `font-size:${small ? 13 : 17}px`});
        step(label, start + 200, 350);
      });
    }

};
