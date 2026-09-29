'use strict';
MBBCharts.templates.sankey = (a, c, {w, zh, small, base, labels}) => {
  const {svg, palette: p, el, text, mark} = a;
  const d = c.data, lang = zh ? 0 : 1, matrix = Boolean(d.links), total = d.inputs.reduce((s, r) => s + r.value, 0);
  const gap = 15, height = 570, top = 70, scale = (height - gap * (Math.max(d.inputs.length, d.outputs.length) - 1)) / total;
  const x = matrix ? (small ? (c.editorial ? [65, w - 82] : [18, w - 34]) : [155, w - 171]) : (small ? [18, w / 2 - 8, w - 34] : [155, w / 2 - 8, w - 171]);
  const columns = matrix ? [d.inputs, d.outputs] : [d.inputs, [{name: d.totalName, value: total}], d.outputs];
    const formatted = value => MBB.number(value,c.lang)+' '+(d.unit?.[lang]||'');
  const legendY = matrix ? 720 : 870;
  const nodes = [];
  columns.forEach((rows, col) => {
    let y = top + (height - total * scale - gap * (rows.length - 1)) / 2;
    rows.forEach((row, i) => {
      nodes.push({...row, col, index: i, x: x[col], y, h: row.value * scale, number: nodes.length + 1});
      y += row.value * scale + gap;
    });
    text(base, small && col === 0 ? 0 : small && col === columns.length - 1 ? w : x[col] + 8, 27, d.columnNames[col][lang], {'text-anchor': small && col === 0 ? 'start' : small && col === columns.length - 1 ? 'end' : 'middle', class: 'small', 'font-weight': 700});
  });
  const central = nodes.find(n => n.col === 1);
  const links = [];
  if (matrix) {
    const sourceOffsets = d.inputs.map(() => 0), targetOffsets = d.outputs.map(() => 0);
    d.links.forEach(link => {
      const from = nodes.find(n => n.col === 0 && n.index === link.source), to = nodes.find(n => n.col === 1 && n.index === link.target);
      links.push({...link, from, to, y1: from.y + sourceOffsets[link.source], y2: to.y + targetOffsets[link.target]});
      sourceOffsets[link.source] += link.value * scale;
      targetOffsets[link.target] += link.value * scale;
    });
  } else {
    let offset = 0;
    d.inputs.forEach((r, i) => {
      const from = nodes.find(n => n.col === 0 && n.index === i), y = central.y + offset;
      offset += r.value * scale;
      links.push({from, to: central, y1: from.y, y2: y, value: r.value});
    });
    offset = 0;
    d.outputs.forEach((r, i) => {
      const to = nodes.find(n => n.col === 2 && n.index === i), y = central.y + offset;
      offset += r.value * scale;
      links.push({from: central, to, y1: y, y2: to.y, value: r.value});
    });
  }
  links.forEach((link, i) => {
    const group = el('g', {}, null, svg), xa = link.from.x + 16, xb = link.to.x, mid = (xa + xb) / 2, h = link.value * scale;
    const ribbon = el('path', {d: `M${xa},${link.y1} C${mid},${link.y1} ${mid},${link.y2} ${xb},${link.y2} V${link.y2 + h} C${mid},${link.y2 + h} ${mid},${link.y1 + h} ${xa},${link.y1 + h} Z`, fill: p.categories[(matrix ? link.from.index : i) % 6], 'fill-opacity': .6}, null, group);
    const target = el('circle', {cx: mid, cy: (link.y1 + link.y2 + h) / 2, r: 1, fill: 'transparent', 'pointer-events': 'none'}, null, group);
    mark(matrix ? ribbon : group, {target, ...(matrix ? {kind: 'ribbon'} : {}), label: `${link.from.name[lang]} → ${link.to.name[lang]}\n${formatted(link.value)}${link.growth == null ? '' : `\n${zh ? '同比' : 'Year over year'}: ${link.growth > 0 ? '+' : ''}${link.growth}%`}`}, 1000 + i * 330);
  });
  nodes.forEach((node, i) => {
    const group = el('g', {}, null, svg), color = p.categories[!matrix && node.col === 1 ? 0 : node.index % 6];
    const rect = el('rect', {x: node.x, y: node.y, width: 16, height: node.h, fill: color, stroke: p.text, 'stroke-width': .8}, null, group);
    mark(group, {target: rect, label: `${node.name[lang]}\n${formatted(node.value)}${node.net == null ? '' : `\n${zh ? '净流入' : 'Net inflow'}: ${formatted(node.net)}`}`}, 1000 + i * 200);
    const tx = node.col === 0 ? node.x - 5 : node.x + 21;
    if (matrix || node.col !== 1) text(base, tx, node.y + node.h / 2 + 4, c.editorial ? `${node.name[lang]} ${node.value}` : String(node.number), {'text-anchor': node.col === 0 ? 'end' : 'start', class: 'small', ...(c.editorial ? {style:`font-size:${small?11:18}px`} : {})});
    if (!c.editorial) MBB.wrapText(base, small ? 0 : i % 2 * w / 2, legendY + (small ? i : Math.floor(i / 2)) * (matrix ? 65 : 47), `${node.number} · ${node.name[lang]} · ${formatted(node.value)}${node.net == null ? '' : ` · ${zh ? '净流入' : 'Net'} ${formatted(node.net)}`}`, small ? w : w / 2 - 16, {class: 'small'}, 17);
  });
  const defs = el('defs', {}, null, svg);
  const arrow = el('marker', {id: 'feedback-arrow', viewBox: '0 0 6 6', refX: 5, refY: 3, markerWidth: 6, markerHeight: 6, orient: 'auto'}, null, defs);
  el('path', {d: 'M0,0 L6,3 L0,6 Z', fill: p.categories[5]}, null, arrow);
  (d.feedback || []).forEach((index, i) => {
    const node = nodes.find(n => n.col === 2 && n.index === index), yy = 710 + i * 35, right = w - 4 - i * 4, left = 4 + i * 4;
    const path = el('path', {d: `M${node.x + 16},${node.y + node.h / 2 + Math.min(15, node.h / 3)} H${right} V${yy} H${left} V${central.y - 20} H${central.x}`, fill: 'none', style: 'pointer-events:stroke', stroke: p.categories[5], 'stroke-width': 2, 'stroke-dasharray': '5 4', 'marker-end': 'url(#feedback-arrow)'}, null, svg);
    mark(path, {kind: 'ribbon', label: `${node.name[lang]} → ${zh ? '下一周期' : 'Next cycle'}\n${zh ? '回流路径；未提供逐条数量，线宽不表示数量' : 'Feedback route; per-route counts not provided, so width is not quantitative'}`}, 6100 + i * 200);
  });
  if (d.feedback?.length) text(labels, w / 2, 825, zh ? '虚线：进入下一周期的回流路径' : 'Dashed: feedback routes into the next cycle', {'text-anchor': 'middle', class: 'small'});
};
