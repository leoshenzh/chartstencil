'use strict';
MBBCharts.templates['radial-timeline'] = (a, c, {w, zh, small, base, labels}) => {
  const {svg, palette: p, el, text, line, mark} = a;
  const d = c.data, lang = zh ? 0 : 1, cx = w / 2;
  const outer = Math.min(w / 2 - (small ? 34 : 65), 420);
  const cy = outer + 48, gap = outer / (d.rows.length + 2);
  const legendTop = outer * 2 + 115;
  const max = Math.max(...d.rows.map(r => r.value)), angle = v => -Math.PI / 2 + v / max * Math.PI * 1.7;
  const point = (r, value) => [cx + r * Math.cos(angle(value)), cy + r * Math.sin(angle(value))];
  [0, max].forEach(value => {
    const q = point(outer + 29, value);
    text(base, q[0], q[1] + (value ? 6 : -9), `${value}`, {'text-anchor': 'middle', class: 'small'});
  });
  d.rows.forEach((row, i) => {
    const radius = outer - (d.dots ? d.rows.length-1-i : i) * gap, start = point(radius, 0), end = point(radius, row.value);
    const group=el('g',{},null,svg);
    if(d.dots)for(let k=0;k<row.value;k++){const q=point(radius,k+1);el('circle',{cx:q[0],cy:q[1],r:small?3:5.5,fill:p.categories[i%6]},null,group);}
    const path = el('path', {d: `M${start} A${radius},${radius} 0 ${row.value / max * 1.7 > 1 ? 1 : 0} 1 ${end}`, fill: 'none', style: 'pointer-events:stroke', stroke: d.dots ? 'transparent' : p.categories[i % 6], 'stroke-width': small ? 12 : 22, 'stroke-linecap': 'round'}, null, group);
    mark(d.dots?group:path, {kind:'ribbon',...(d.dots?{target:path}:{}), label: `${row.name[lang]}\n${row.value} ${(d.unit?.[lang]||'')}`}, 1100 + i * 950);
    const ly = legendTop + i * 36;
    line(base, 0, ly - 5, 20, ly - 5, {class:'',stroke: p.categories[i % 6], 'stroke-width': 7});
    text(base, 30, ly, row.name[lang], {'font-size':small?15:19});
    text(base, w - 4, ly, `${row.value} ${(d.unit?.[lang]||'')}`, {'text-anchor': 'end', 'font-weight': 700});
  });
  text(labels, cx, cy + 7, (d.centerLabel?.[lang]||''), {'text-anchor': 'middle','font-size':small?14:19});
};
