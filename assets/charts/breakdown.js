'use strict';
MBBCharts.templates.breakdown = (a, c, {w, zh, small, base, labels}) => {
  const {svg, palette: p, el, text, line, mark} = a;
  const d = c.data, lang = zh ? 0 : 1, total = d.rows.reduce((s, r) => s + r.value, 0), selected = d.rows.filter(r => r.selected), subtotal = selected.reduce((s, r) => s + r.value, 0);
  function bar(rows, sum, top, conditional) {
    let x = 0;
    rows.forEach((row, i) => {
      const width = row.value / sum * w, index = d.rows.indexOf(row), group = el('g', {}, null, svg), color = p.categories[index];
      const rect = el('rect', {x, y: top, width, height: 70, fill: color, stroke: p.background, 'stroke-width': 2}, null, group);
      const percent = row.value / sum * 100;
      text(group, x + width / 2, top + 42, `${percent.toFixed(conditional ? 1 : 0)}%`, {'text-anchor': 'middle', style: `fill:${MBB.ink(color)}`, class: 'small'});
      mark(group, {target: rect, label: `${row.name[lang]}\n${row.value} ${d.unit[lang]}\n${conditional ? d.subsetName[lang] : d.totalName[lang]}: ${percent.toFixed(1)}%`}, (conditional ? 3900 : 1000) + i * 600);
      x += width;
    });
  }
  text(base, 0, 30, d.totalName[lang], {'font-weight': 700}); bar(d.rows, total, 60, false);
  const first = d.rows.findIndex(r => r.selected), start = d.rows.slice(0, first).reduce((s, r) => s + r.value, 0) / total * w, end = start + subtotal / total * w;
  line(labels, start, 145, start, 160); line(labels, start, 160, end, 160); line(labels, end, 145, end, 160);
  line(labels, (start + end) / 2, 160, w / 2, 220, {'stroke-dasharray': '4 4'});
  text(base, 0, 250, `${d.subsetName[lang]} · ${subtotal} / ${total}`, {'font-weight': 700}); bar(selected, subtotal, 280, true);
  d.rows.forEach((row, i) => MBB.wrapText(base, 0, 410 + i * (small ? 60 : 40), `${row.name[lang]} · ${row.value} ${d.unit[lang]}`, w, {class: 'small'}, 19));
};
