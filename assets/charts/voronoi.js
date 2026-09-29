'use strict';
// Power cells use squared distance minus a weight (Aurenhammer, 1987).
// https://doi.org/10.1137/0216006 — independently implemented half-plane clipping.
MBBCharts.powerCells = (values, outline) => {
  const n = values.length, total = values.reduce((s, v) => s + v, 0);
  let sites = values.map((_, i) => {
    const r = .41 * Math.sqrt((i + .5) / n), angle = i * 2.399963229728653;
    return [.5 + r * Math.cos(angle), .5 + r * Math.sin(angle)];
  });
  const boundary = outline || [[.15, 0], [.85, 0], [1, .15], [1, .85], [.85, 1], [.15, 1], [0, .85], [0, .15]];
  function measure(poly) {
    let area = 0, cx = 0, cy = 0;
    poly.forEach((a, i) => {
      const b = poly[(i + 1) % poly.length], cross = a[0] * b[1] - b[0] * a[1];
      area += cross; cx += (a[0] + b[0]) * cross; cy += (a[1] + b[1]) * cross;
    });
    return {area: area / 2, center: area ? [cx / (3 * area), cy / (3 * area)] : [.5, .5]};
  }
  function clip(poly, nx, ny, k) {
    const output = [];
    poly.forEach((a, i) => {
      const b = poly[(i + 1) % poly.length], da = nx * a[0] + ny * a[1] - k, db = nx * b[0] + ny * b[1] - k;
      if (da <= 0) output.push(a);
      if ((da < 0) !== (db < 0)) {
        const t = da / (da - db);
        output.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]);
      }
    });
    return output;
  }
  if (outline) {
    const center = measure(boundary).center;
    sites = values.map((_, i) => {
      const point = boundary[Math.floor(i * boundary.length / n)];
      const ratio = .25 + .45 * ((i + .5) / n);
      return center.map((v, k) => v + ratio * (point[k] - v));
    });
  }
  const fullArea = measure(boundary).area, target = values.map(v => v / total * fullArea), weights = values.map(() => 0);
  let cells;
  for (let iteration = 0; iteration < 4000; iteration++) {
    cells = sites.map((s, i) => {
      let polygon = boundary;
      sites.forEach((t, j) => {
        if (i !== j) polygon = clip(polygon, 2 * (t[0] - s[0]), 2 * (t[1] - s[1]), t[0] ** 2 + t[1] ** 2 - s[0] ** 2 - s[1] ** 2 + weights[i] - weights[j]);
      });
      return {polygon, ...measure(polygon), target: target[i]};
    });
    if (cells.every((cell, i) => Math.abs(cell.area - target[i]) / target[i] < .001)) return cells;
    cells.forEach((cell, i) => { weights[i] += .08 * (target[i] - cell.area); });
  }
  throw Error('Voronoi area tolerance not reached');
};
MBBCharts.templates.voronoi = (a, c, {w, zh, small, base, labels}) => {
  const {svg, palette: p, el, text, mark} = a;
  const d = c.data, lang = zh ? 0 : 1, size = Math.min(w, 630), ox = (w - size) / 2;
  const colors=d.levels?(c.theme==='dark'?['#a6d6ff','#69b8ff','#268df4','#0067df']:['#87bce9','#559ad7','#2678c5','#0656ac']):p.categories;
  const format=v=>MBB.number(v,c.lang), extra=d.levels?d.levels.length*25:0;
  const cells = MBBCharts.powerCells(d.rows.map(r => r.value));
  d.rows.forEach((row, i) => {
    const cell = cells[i], group = el('g', {}, null, svg), color = colors[(row.group ?? i) % colors.length];
    el('polygon', {points: cell.polygon.map(([x, y]) => `${ox + x * size},${25 + y * size}`).join(' '), fill: color, stroke: p.background, 'stroke-width': 2, 'data-area': cell.area, 'data-target-area': cell.target}, null, group);
    const [cx, cy] = cell.center, x = ox + cx * size, y = 25 + cy * size;
    const target = el('circle', {cx: x, cy: y, r: 1, fill: 'transparent', 'pointer-events': 'none'}, null, group);
    text(group, x, y + 5, String(i + 1), {'text-anchor': 'middle', 'font-weight': 700, style: `fill:${MBB.ink(color)}`});
    mark(group, {target, label: `${row.name[lang]}\n${format(row.value)} ${d.unit[lang]}\n${zh ? '占合计' : 'Share'}: ${(row.value / d.rows.reduce((s, r) => s + r.value, 0) * 100).toFixed(1)}%`}, 1000 + i * Math.min(650,5000/d.rows.length));
    MBB.wrapText(base, small ? 0 : i % 2 * w / 2, size + 68 + extra + (small ? i : Math.floor(i / 2)) * 45, `${i + 1} · ${row.name[lang]} · ${format(row.value)} ${d.unit[lang]}`, small ? w : w / 2 - 16, {class: 'small'}, 17);
  });
  (d.levels||[]).forEach((level,i)=>{el('rect',{x:0,y:size+45+i*25,width:12,height:12,fill:colors[i]},null,base);text(base,21,size+56+i*25,level[lang],{class:'small'});});
  MBB.wrapText(labels, 0, size + 90 + extra + Math.ceil(d.rows.length / (small ? 1 : 2)) * 45, d.note[lang], w, {'font-weight': 700}, 21);
};
