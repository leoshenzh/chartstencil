'use strict';
MBBCharts.templates['bubble-matrix'] = (a, c, {w, zh, small, base, labels}) => {
  const {svg, palette: p, el, text, line, mark} = a;
  const d = c.data, lang = zh ? 0 : 1, cw = w / d.columns.length, rh = small ? 108 : 115;
  const colors = (c.palette || c.brand) ? p.ordinal : c.theme === 'dark' ? ['#d2e8ff', '#a5d1ff', '#78baff', '#4ba3ff', '#1e8cff'] : ['#8fbcf0', '#6da1df', '#4b86ce', '#296bbd', '#0750ac'];
  const breaks=d.colorBreaks||[0,20,40,60,80,100], bins=breaks.length-1, palette=Array.from({length:bins},(_,i)=>colors[Math.round(i*4/(bins-1))]);
  const sizeUnit=d.sizeUnit?.[lang]??'%',colorUnit=d.colorUnit?.[lang]??'%';
  d.columns.forEach((column, i) => column[lang].split('\n').forEach((part, j) => text(base, (i + .5) * cw, 22 + j * 17, part, {'text-anchor': 'middle', class: 'small'})));
  if (d.dividerBefore != null) line(base,d.dividerBefore*cw,62,d.dividerBefore*cw,95+(d.rows.length-1)*rh+44,{stroke:p.muted});
  const maximum = Math.max(...d.rows.flatMap(row => row.values));
  d.rows.forEach((row, i) => {
    const y = 95 + i * rh;
    text(base, 0, y - 45, row.name[lang], {'font-weight': 700, class: 'small'});
    line(base, 0, y + 44, w, y + 44);
    row.values.forEach((value, j) => {
      const x = (j + .5) * cw, radius = Math.sqrt(value / maximum) * Math.min(35, cw * .35);
      const colorValue = row.colors?.[j] ?? value, color = palette[Math.max(0, Math.min(bins-1, breaks.findIndex((n,i)=>i>0&&colorValue<=n)-1))];
      const group = el('g', {}, null, svg);
      const circle = el('circle', {cx: x, cy: y, r: radius, fill: color, stroke: p.text, 'stroke-width': .7}, null, group);
      text(group, x, radius < 13 ? y + radius + 16 : y + 5, String(value), {'text-anchor': 'middle', class: 'small', style: `fill:${radius < 13 ? p.text : MBB.ink(color)}`});
      mark(group, {target: circle, label: `${row.name[lang]} · ${d.columns[j][lang].replace('\n', ' ')}\n${d.sizeMetric[lang]}: ${value}${sizeUnit}\n${d.colorMetric[lang]}: ${colorValue}${colorUnit}`}, 1000 + i * 500 + j * 420);
    });
  });
  const y = 115 + d.rows.length * rh;
  text(base, 0, y, `${d.colorMetric[lang]} · ${colorUnit}`, {class: 'small'});
  palette.forEach((color, i) => {
    const x = i * w / bins;
    el('rect', {x, y: y + 17, width: w / bins - 5, height: 17, fill: color}, null, base);
    text(base, x + (w / bins - 5) / 2, y + 55, `${i ? ">" : ""}${breaks[i]}–${breaks[i+1]}`, {'text-anchor': 'middle', class: 'small'});
  });
  text(base, 0, y + 93, `${zh ? '圆面积' : 'Circle area'}: ${d.sizeMetric[lang]} · ${sizeUnit}`, {class: 'small'});
  (d.sizeLegend || [10, 50, 100]).forEach((value, i) => {
    const x = (i + .5) * w / 3, radius = Math.sqrt(value / maximum) * Math.min(35, cw * .35);
    el('path', {d: `M${x - radius} ${y + 195} A${radius} ${radius} 0 0 1 ${x + radius} ${y + 195}`, fill: 'none', stroke: p.text}, null, base);
    line(base, x - radius, y + 195, x + radius, y + 195, {stroke: p.muted});
    text(base, x, y + 220, `${value}${sizeUnit}`, {'text-anchor': 'middle', class: 'small'});
  });
};
