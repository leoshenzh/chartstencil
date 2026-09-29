'use strict';
MBBCharts.templates.pictogram = (a, c, {w, zh, small, base, labels}) => {
  const {svg, palette: p, el, text, line, mark} = a;
  const d = c.data, lang = zh ? 0 : 1, total = d.rows.reduce((s, r) => s + r.value, 0);
  const cols = d.shape === 'shirt' ? 36 : 10, size = Math.min(w / cols, d.shape === 'shirt' ? 21 : 49);
  const origin = (w - cols * size) / 2, positions = [];
  if (d.shape === 'shirt') {
    for (let y = 0; y < 29; y++) for (let x = y < 10 ? 0 : 8; x < (y < 10 ? 36 : 28); x++) positions.push([x, y]);
  } else {
    for (let i = 0; i < total; i++) positions.push([i % cols, Math.floor(i / cols)]);
  }
  if (d.shape === 'circle') {
    const radius = Math.min((w - 80) / 2, 260), center = (w - 80) / 2;
    positions.splice(0);
    for (let i = 0; i < total; i++) {
      const angle = i * Math.PI * (3 - Math.sqrt(5)), distance = radius * Math.sqrt((i + .5) / total);
      positions.push([(center + distance * Math.cos(angle) - origin) / size - .5, (radius + distance * Math.sin(angle)) / size - .5]);
    }
  }
  if (d.shape === 'circle') positions.sort((a, b) => a[1] - b[1]);
  const chartBottom = 35 + (Math.max(...positions.map(p => p[1])) + 1) * size;
  let index = 0;
  d.rows.forEach((row, i) => {
    const group = el('g', {fill: p.categories[i]}, null, svg);
    let target;
    for (let n = 0; n < row.value; n++) {
      const [px, py] = positions[index++], x = origin + (px + .5) * size, y = 35 + (py + .5) * size;
      if (d.shape === 'shirt') {
        const dot = el('circle', {cx: x, cy: y, r: size * .34}, null, group);
        target ||= dot;
      } else {
        const person = el('g', d.shape === 'circle' ? {transform: `translate(${x},${y}) scale(.65) translate(${-x},${-y})`} : {}, null, group);
        el('circle', {cx: x, cy: y - size * .25, r: size * .095}, null, person);
        el('path', {d: `M${x - size * .1},${y - size * .11} h${size * .2} v${size * .28} h${-size * .04} v${size * .22} h${-size * .05} v${-size * .22} h${-size * .02} v${size * .22} h${-size * .05} v${-size * .22} h${-size * .04} Z`}, null, person);
        target ||= person;
      }
    }
    mark(group, {target, label: `${row.name[lang]}\n${row.value * d.unitValue} ${d.unit[lang]}\n${zh ? '占合计' : 'Share'}: ${(row.value / total * 100).toFixed(2)}%`}, 1000 + i * 1800);
    const ly = chartBottom + 40 + i * 45;
    el('rect', {x: 0, y: ly - 13, width: 15, height: 15, fill: p.categories[i]}, null, base);
    MBB.wrapText(base, 25, ly, `${row.name[lang]} · ${(row.value * d.unitValue).toLocaleString(lang ? 'en-US' : 'zh-CN')} ${d.unit[lang]}`, w - 25, {class: 'small'}, 18);
  });
  if (d.bracketIndexes) {
    const count = d.bracketIndexes.reduce((sum, i) => sum + d.rows[i].value, 0);
    const bx = (w - 80) / 2 + Math.min((w - 80) / 2, 260) + 15;
    const y0 = 35 + (positions[0][1] + .5) * size, y1 = 35 + (positions[count - 1][1] + .5) * size;
    line(labels, bx - 10, y0, bx, y0); line(labels, bx, y0, bx, y1); line(labels, bx - 10, y1, bx, y1);
    text(labels, bx + 5, (y0 + y1) / 2 + 4, `${Math.round(count / total * 100)}%`, {class: 'small', 'font-weight': 700});
  }
  if (d.summary) {
    const ly = chartBottom + 50 + d.rows.length * 45;
    line(labels, 0, ly - 15, w, ly - 15);
    MBB.wrapText(labels, 0, ly + 12, d.summary[lang], w, {'font-weight': 700}, 22);
  }
};
