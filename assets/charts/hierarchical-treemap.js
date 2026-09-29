'use strict';
MBBCharts.templates['hierarchical-treemap'] = (a, c, {w, zh, small, base, labels}) => {
  const {svg, palette: p, el, text, mark} = a;
  const d = c.data, lang = zh ? 0 : 1, total = d.groups.flatMap(g => g.rows).reduce((s, r) => s + r.value, 0), height = small ? 570 : 520;
  let x = 0, leaf = 0;
  d.groups.forEach((group, k) => {
    const sum = group.rows.reduce((s, r) => s + r.value, 0), width = w * sum / total;
    let y = 55;
    group.rows.forEach((row, j) => {
      const h = height * row.value / sum, color = p.categories[k], g = el('g', {}, null, svg), index = ++leaf;
      const rect = el('rect', {x, y, width, height: h, fill: color, stroke: p.background, 'stroke-width': 2}, null, g);
      if (c.editorial) {
        MBB.wrapText(g,x+width/2,y+h/2-12,row.name[lang],width-12,{'text-anchor':'middle',style:`font-size:${small?11:20}px;fill:${MBB.ink(color)}`},20);
        text(g,x+width/2,y+h/2+24,String(row.value),{'text-anchor':'middle',style:`font-size:${small?16:24}px;fill:${MBB.ink(color)}`});
      } else text(g, x + width / 2, y + h / 2 + 4, String(index), {'text-anchor': 'middle', class: 'small', style: `fill:${MBB.ink(color)}`});
      mark(g, {target: rect, label: `${group.name[lang]} · ${row.name[lang]}\n${row.value} ${d.unit[lang]}`}, 1000 + index * 450);
      if (!c.editorial) MBB.wrapText(base, 0, height + 95 + (index - 1) * 35, `${index}. ${row.name[lang]} · ${row.value} ${d.unit[lang]}`, w, {class: 'small'}, 17);
      y += h;
    });
    const border = el('path', {d: `M${x + 2} 57 H${x + width - 2} V${55 + height - 2} H${x + 2} Z`, fill: 'none', stroke: p.text, 'stroke-width': 2, style: 'pointer-events:stroke'}, null, svg);
    mark(border, {kind: 'ribbon', label: `${group.name[lang]}\n${sum} ${d.unit[lang]}\n${(sum / total * 100).toFixed(1)}%`}, 1000 + k * 1100);
    MBB.wrapText(labels, x + width / 2, 20, group.name[lang], width - 10, {'text-anchor': 'middle', class: 'small'}, 18);
    x += width;
  });
};
