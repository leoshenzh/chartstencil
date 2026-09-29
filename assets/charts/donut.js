'use strict';
MBBCharts.templates.donut = (a, c, {w, H, zh, small, base, labels}) => {
  const {svg, palette: p, el, text, mark, step} = a;
  const d = c.data, lang = zh ? 0 : 1, cols = small ? 1 : 2, pw = w / cols, ph = d.reference != null ? 450 : 400;
  const max = Math.max(...d.periods.map(period => period.values.reduce((s, v) => s + v, 0)));
  const point = (cx, cy, r, angle) => [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  d.periods.forEach((period, j) => {
    const total = period.values.reduce((s, v) => s + v, 0), cx = j % cols * pw + pw / 2, cy = 240 + Math.floor(j / cols) * ph;
    const r = a.radius(total, max, small ? 125 : 165), inner = r * .58;
    MBB.wrapText(base, cx, cy - 195, period.name ? period.name[lang] : String(period.year), pw-25, {'text-anchor': 'middle', 'font-weight':700}, 21);
    let angle = -Math.PI / 2;
    period.values.forEach((value, i) => {
      const next = angle + value / total * Math.PI * 2, large = next - angle > Math.PI ? 1 : 0;
      const p1 = point(cx, cy, r, angle), p2 = point(cx, cy, r, next), p3 = point(cx, cy, inner, next), p4 = point(cx, cy, inner, angle);
      const path = el('path', {d: `M${p1} A${r} ${r} 0 ${large} 1 ${p2} L${p3} A${inner} ${inner} 0 ${large} 0 ${p4} Z`, fill: p.categories[i], stroke: p.background, 'stroke-width': 2}, null, svg);
      const middle = point(cx, cy, (r + inner) / 2, (angle + next) / 2);
      const target = el('circle', {cx: middle[0], cy: middle[1], r: 2, fill: 'transparent', style: 'pointer-events:none'}, null, svg);
      mark(path, {target, label: `${period.name ? period.name[lang] : period.year} · ${d.names[i][lang]}\n${value.toFixed(1)} ${d.unit[lang]}\n${zh ? '占总量' : 'Share'}: ${(value / total * 100).toFixed(1)}%`}, 1000 + j * Math.min(2100,4500/d.periods.length) + i * 350);
      angle = next;
    });
    if (d.reference != null) {
      const angle = -Math.PI / 2 + d.reference / 100 * Math.PI * 2;
      const innerPoint = point(cx, cy, inner - 5, angle), outerPoint = point(cx, cy, r + 20, angle);
      a.line(labels, ...innerPoint, ...outerPoint, {stroke: p.text, 'stroke-width': 2, 'stroke-dasharray': '4 3'});
      text(base, cx, cy + r + 35, `${d.referenceLabel[lang]} ${d.reference}%`, {'text-anchor': 'middle', class: 'small'});
    }
    const label = text(svg, cx, cy + 4, (d.reference != null ? period.values[0] : total).toFixed(1), {'text-anchor': 'middle', class: 'serif'});
    step(label, 5500 + j * Math.min(500,1400/d.periods.length), 450);
    text(base, cx, cy + 36, d.unit[lang], {'text-anchor': 'middle', class: 'small'});
  });
  const ly = Math.ceil(d.periods.length / cols) * ph + 36;
  d.names.forEach((name, i) => {
    const x = i % 2 * w / 2, y = ly + Math.floor(i / 2) * 30;
    el('rect', {x, y: y - 13, width: 15, height: 15, fill: p.categories[i]}, null, base);
    text(base, x + 24, y, name[lang], {class: 'small'});
  });
};
