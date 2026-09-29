'use strict';
MBBCharts.templates.flows = (a, c, {w, H, zh, small, base, labels}) => {
  const {svg, palette: p, el, text, mark, step} = a;
  const {nodes, edges, period, coverage} = c.data;
  const colors = [p.text, p.data, p.categories[2], p.accent];
  const left = small ? 40 : 76, span = w - left * 2, top = small ? 155 : 148, height = small ? 590 : 590;
  const numeric = nodes.filter(d => typeof d.value === 'number').map(d => d.value);
  const maximum = Math.max(...numeric), maxRadius = small ? 69 : 175;
  const data = nodes.map((d, i) => ({...d, i, x: left + d.x * span, y: top + d.y * height,
    r: typeof d.value === 'number' ? a.radius(d.value, maximum, maxRadius) : small ? 5 : 7}));
  const byId = new Map(data.map(d => [d.id, d]));
  text(base, 0, 32, period, {class: 'serif'});
  MBB.wrapText(base, small ? 0 : 170, small ? 65 : 21, zh ? `${edges.length} 条连接${coverage == null ? '' : '，覆盖 ' + coverage + '%'}` : `${edges.length} connections${coverage == null ? '' : ': ' + coverage + '% coverage'}`, small ? w : w * .40, {class: 'small'}, 18);
  MBB.wrapText(base, small ? 0 : w * .64, small ? 95 : 20, zh ? '气泡面积：节点数量；箭头：来源 → 去向；带宽：相对数量' : 'Area: node quantity; arrows: source to destination; width: relative quantity', small ? w : w * .36, {class: 'small'}, 18);
  const legendY = small ? 143 : 98;
  const legendX = small ? 0 : w * .64;
  el('path', {d: `M${legendX} ${legendY} h48 m-12 -7 l12 7 -12 7`, fill: 'none', stroke: p.text, 'stroke-width': 3}, null, base);
  text(base, legendX + 60, legendY + 5, zh ? '来源 → 去向' : 'Source → destination', {class: 'small'});
  const defs = el('defs', {}, null, svg), corridors = el('g', {}, null, svg), nodeLayer = el('g', {}, null, svg);
  edges.forEach((edge, i) => {
    const source = byId.get(edge.source), target = byId.get(edge.target), color = colors[source.group];
    const cx = (source.x + target.x) / 2 + ((i % 5) - 2) * w * .048;
    const cy = (source.y + target.y) / 2 + ((i % 3) - 1) * 62;
    const startLength = Math.hypot(cx - source.x, cy - source.y), endLength = Math.hypot(cx - target.x, cy - target.y);
    const sx = source.x + (cx - source.x) / startLength * (source.r + 2), sy = source.y + (cy - source.y) / startLength * (source.r + 2);
    const ex = target.x + (cx - target.x) / endLength * (target.r + 3), ey = target.y + (cy - target.y) / endLength * (target.r + 3);
    const width = (small ? 28 : 85) * edge.relativeWidth + 1;
    const arrow = el('marker', {id: `flow-arrow-${i}`, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: Math.max(small ? 11 : 20, width * 1.65), markerHeight: Math.max(small ? 11 : 20, width * 1.65), orient: 'auto', markerUnits: 'userSpaceOnUse'}, null, defs);
    el('path', {d: 'M0 0 L10 5 L0 10 Z', fill: color}, null, arrow);
    const path = el('path', {d: `M${sx},${sy} Q${cx},${cy} ${ex},${ey}`, fill: 'none', stroke: color, 'stroke-width': width, 'stroke-opacity': .65, 'marker-end': `url(#flow-arrow-${i})`}, null, corridors);
    step(path, 1100 + i * 175, 650, true);
    mark(path, {label: `${source.name[zh ? 0 : 1]} → ${target.name[zh ? 0 : 1]}\n${period}\n${zh ? '连接数量见输入数据' : 'Connection quantity from input data'}\n${zh ? '相对带宽' : 'Relative width'}: ${edge.relativeWidth}\n${zh ? '方向与带宽来自输入数据' : 'Direction and width from input data'}`, kind: 'ribbon'}, 1100, false);
  });
  data.forEach(d => {
    const color = colors[d.group], value = typeof d.value === 'number' ? d.value.toFixed(1) : d.value || (zh ? '未提供' : 'Not provided');
    const group = el('g', {}, null, nodeLayer);
    const circle = el('circle', {cx: d.x, cy: d.y, r: d.r, fill: color}, null, group);
    const inside = d.r > (small ? 20 : 35);
    if (small) {
      const outside = d.r < 12;
      text(group, outside ? d.x + d.r + 7 : d.x, d.y + 4, String(d.i + 1), {
        'text-anchor': outside ? 'start' : 'middle', 'font-weight': 700,
        style: `font-size:11px;fill:${outside ? p.text : MBB.ink(color)};${outside ? `paint-order:stroke;stroke:${p.background};stroke-width:3px` : ''}`
      });
    } else if (inside) {
      const title = MBB.wrapText(group, d.x, d.y - 8, d.name[zh ? 0 : 1], d.r * 2 - 8, {'text-anchor': 'middle', 'font-weight': 700, style: `fill:${MBB.ink(color)};font-size:15px`}, 17);
      text(group, d.x, d.y + title.height - 1, value, {'text-anchor': 'middle', 'font-weight': 700, style: `fill:${MBB.ink(color)}`});
    } else {
      text(group, d.x, d.y + 4, typeof d.value === 'number' ? value : '', {'text-anchor': 'middle', 'font-weight': 700, style: `fill:${MBB.ink(color)};font-size:13px`});
      const tx = d.x, ty = d.value === null ? d.y - 18 : d.y + d.r + 20;
      MBB.wrapText(group, tx, ty, d.name[zh ? 0 : 1] + (typeof d.value === 'string' ? ` ${value}` : ''), Math.min(130, w - tx) * 1.6, {'text-anchor': 'middle', class: 'small'}, 17);
    }
    const hot = el('circle', {cx: d.x, cy: d.y, r: Math.max(12, d.r), fill: 'transparent'}, null, group);
    mark(hot, {label: `${d.name[zh ? 0 : 1]} · ${period}\n${zh ? '节点数量' : 'Node quantity'}: ${value}${d.value == null ? '' : (Array.isArray(c.data.unit)?c.data.unit[zh?0:1]:(c.data.unit||''))}\n${zh ? '节点数量来自输入数据' : 'Node quantity from input data'}`}, 600 + d.i * 120);
    step(group, 600 + d.i * 120, 450);
  });
  const noteY = small ? 910 : 870;
  (c.data.notes || []).slice(0,2).forEach((note,i) => MBB.wrapText(labels, i*w*.56, noteY, Array.isArray(note)?note[zh?0:1]:note, w*.44, {class:'small'},18));
};
