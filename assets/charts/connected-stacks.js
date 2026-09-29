'use strict';
Core.install('connected-stacks', (d, w) => (w < 720 ? 665 : 760) + d.series.length * 33, v => {
  const {a, d, w, small, base, labels, name, label, color, group, mark, unit} = v;
  if (!(d.years > 0) || d.series.some((_, j) => !(d.periods[0].values[j] > 0) || (d.contributions !== false && d.periods.at(-1).values[j] < d.periods[0].values[j]))) throw new Error('Connected growth contributions require positive baselines and non-decreasing final values.');
  const top = 85, bottom = small ? 465 : 520, left = 48;
  const right = w - (small ? 8 : d.contributions === false ? 215 : 330), pitch = (right - left) / d.periods.length, bw = Math.min(100, pitch * .62);
  const totals = d.periods.map(row => row.values.reduce((sum, n) => sum + n, 0));
  const max = Math.max(...totals) * 1.12, y = n => bottom - n / max * (bottom - top);
  const position = i => d.periods.length === 1 ? (left + right) / 2 : left + bw / 2 + i * (right - left - bw) / (d.periods.length - 1);
  const starts = d.periods.map((row, i) => {
    const order = d.orders?.[i] || row.values.map((_, j) => j);
    if (order.length !== d.series.length || new Set(order).size !== d.series.length || order.some(j => j < 0 || j >= d.series.length)) throw new Error('Each period must list every series exactly once.');
    const result = []; let total = 0;
    order.forEach(j => {result[j] = total; total += row.values[j];});
    return result;
  });
  const rate = j => 100 * ((d.periods.at(-1).values[j] / d.periods[0].values[j]) ** (1 / d.years) - 1);
  const growth = totals.at(-1) - totals[0];
  if (d.contributions !== false && !(growth > 0)) throw new Error('A growth contribution chart requires positive total growth.');
  MBB.ticks(0, max).forEach(n => {
    a.line(base, left, y(n), right, y(n));
    label(base, left - 9, y(n) + 5, MBB.number(n, v.c.lang), {'text-anchor': 'end', 'font-size': small ? 13 : 16, 'data-axis-tick': 'y'});
  });
  d.periods.slice(1).forEach((row, k) => row.values.forEach((n, j) => {
    const g = group(), x1 = position(k) + bw / 2, x2 = position(k + 1) - bw / 2;
    const path = a.el('path', {d: `M${x1} ${y(starts[k][j])}L${x2} ${y(starts[k + 1][j])}L${x2} ${y(starts[k + 1][j] + n)}L${x1} ${y(starts[k][j] + d.periods[k].values[j])}Z`, fill: color(j), 'fill-opacity': .25}, null, g);
    mark(g, path, `${name(d.series[j])}\n${name(d.periods[k].name)}: ${d.periods[k].values[j]} ${unit}\n${name(row.name)}: ${n} ${unit}`, k * d.series.length + j, d.periods.length * d.series.length);
  }));
  d.periods.forEach((row, i) => {
    row.values.forEach((n, j) => {
      const g = group(), fill = color(j), h = y(starts[i][j]) - y(starts[i][j] + n);
      const rect = a.el('rect', {x: position(i) - bw / 2, y: y(starts[i][j] + n), width: bw, height: h, fill, stroke: a.palette.background}, null, g);
      if (h > 23) label(g, position(i), y(starts[i][j] + n / 2) + 5, String(n), {'text-anchor': 'middle', 'font-size': small ? 13 : 17, style: `fill:${MBB.ink(fill)}`});
      mark(g, rect, `${name(row.name)} · ${name(d.series[j])}\n${n} ${unit}`, i * d.series.length + j, d.periods.length * d.series.length);
    });
    label(labels, position(i), y(totals[i]) - 13, String(totals[i]), {'text-anchor': 'middle', 'font-weight': 700});
    label(base, position(i), bottom + 28, name(row.name), {'text-anchor': 'middle', 'font-size': small ? 13 : 17});
  });
  const totalRate = 100 * ((totals.at(-1) / totals[0]) ** (1 / d.years) - 1);
  a.el('path', {d: `M${position(0)} ${top - 12}V${top - 38}H${position(d.periods.length - 1)}v18m-4,-5l4,5l4,-5`, fill: 'none', stroke: a.palette.text}, null, labels);
  label(labels, (left + right) / 2, top - 47, `${v.c.lang === 'zh' ? '年均增长' : 'CAGR'} ${MBB.number(totalRate, v.c.lang)}%`, {'text-anchor': 'middle', 'font-weight': 700});
  const tableY = bottom + 90;
  label(base, 0, tableY, d.contributions === false ? (v.c.lang === 'zh' ? '系列 · 年均增长率' : 'Series · CAGR') : (v.c.lang === 'zh' ? '系列 · 年均增长率 · 增量 · 增量占比' : 'Series · CAGR · increase · growth share'), {'font-weight': 700, 'font-size': small ? 14 : 18});
  let contribution = 0;
  d.series.forEach((series, j) => {
    const share = 100 * (d.periods.at(-1).values[j] - d.periods[0].values[j]) / growth;
    const ly = tableY + 35 + j * 33;
    a.el('rect', {x: 0, y: ly - 12, width: 12, height: 12, fill: color(j)}, null, base);
    label(base, 22, ly, `${name(series)} · ${MBB.number(rate(j), v.c.lang)}%${d.contributions === false ? '' : ` · ${MBB.number(d.periods.at(-1).values[j]-d.periods[0].values[j],v.c.lang)} ${unit} · ${MBB.number(share, v.c.lang)}%`}`, {'font-size': small ? 14 : 17});
    if (!small && d.contributions === false) label(base, right + 12, y(starts.at(-1)[j] + d.periods.at(-1).values[j] / 2) + 5, name(series), {'font-size': 15});
    if (!small && d.contributions !== false) {
      const g = group(), height = share / 100 * (bottom - top), yy = bottom - (contribution + share) / 100 * (bottom - top);
      const rect = a.el('rect', {x: w - 110, y: yy, width: 75, height, fill: color(j), stroke: a.palette.background}, null, g);
      label(g, w - 72, yy + height / 2 + 5, `${MBB.number(share, v.c.lang)}%`, {'text-anchor': 'middle', 'font-size': 15, style: `fill:${MBB.ink(color(j))}`});
      label(base, right + 18, y(starts.at(-1)[j] + d.periods.at(-1).values[j] / 2) + 5, `${MBB.number(rate(j), v.c.lang)}%`, {'font-size': 16});
      mark(g, rect, `${name(series)}\n${v.c.lang === 'zh' ? '增量贡献' : 'Share of growth'}: ${MBB.number(share, v.c.lang)}%`, j, d.series.length);
      contribution += share;
    }
  });
  if (!small && d.contributions !== false) {
    label(base, right + 18, top - 18, v.c.lang === 'zh' ? '年均增长' : 'CAGR', {'font-size': 15});
    label(base, w - 72, top - 18, v.c.lang === 'zh' ? '增量贡献' : 'Growth share', {'text-anchor': 'middle', 'font-size': 15});
  }
});
