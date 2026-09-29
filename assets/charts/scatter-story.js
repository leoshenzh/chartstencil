'use strict';
MBBCharts.templates['scatter-story'] = (a, c, {w, zh, small, base, labels}) => {
  const {svg, palette: p, el, text, line, mark, step} = a;
  const d = c.data, lang = zh ? 0 : 1, left = 48, right = w - 30, top = 80, bottom = 525;
  const xmax = Math.ceil(Math.max(...d.rows.map(r => r.x))), ymin = Math.min(0, ...d.rows.map(r => r.y)), ymax = Math.max(...d.rows.map(r => r.y)) * 1.13;
  const xmin=d.logX?Math.pow(10,Math.floor(Math.log10(Math.min(...d.rows.map(r=>r.x))))):0;
  const x = v => left + (d.logX?(Math.log10(v)-Math.log10(xmin))/(Math.log10(xmax)-Math.log10(xmin)):v/xmax) * (right - left), y = v => bottom - (v - ymin) / (ymax - ymin) * (bottom - top), maxSize = Math.max(...d.rows.map(r => r.size));
  if(d.highlightFrom)el('rect',{x:x(d.highlightFrom),y:top,width:right-x(d.highlightFrom),height:bottom-top,fill:p.categories[0],opacity:.12,stroke:p.text,'stroke-dasharray':'4 4'},null,base);
  (d.logX?MBB.logTicks(xmin,xmax):MBB.ticks(0,xmax,4)).forEach(v => {line(base, x(v), top, x(v), bottom); text(base, x(v), bottom + 26, MBB.number(v,c.lang), {'text-anchor': 'middle', class: 'small', 'data-axis-tick':'x', 'data-axis-scale':d.logX?'log':'linear'});});
  MBB.ticks(ymin,ymax,4).forEach(v => {line(base, left, y(v), right, y(v));text(base, left - 8, y(v) + 4, MBB.number(v,c.lang), {'text-anchor': 'end', class: 'small', 'data-axis-tick':'y'});});
  text(base, left, 27, d.yLabel[lang], {class: 'small'});text(base, right, bottom + 54, d.xLabel[lang], {'text-anchor': 'end', class: 'small'});
  d.rows.forEach((row, i) => {
    const r = Math.sqrt(row.size / maxSize) * (small ? 6 : 12), start = row.focus ? 5300 : 1000 + i * 500, color = row.focus ? p.accent : p.data;
    const circle = el('circle', {cx: x(row.x), cy: y(row.y), r, fill: color, 'fill-opacity': .7, stroke: p.text}, null, svg);
    mark(circle, {label: `${row.name[lang]}\n${d.xLabel[lang]}: ${row.x}\n${d.yLabel[lang]}: ${row.y.toFixed(1)}\n${d.sizeLabel[lang]}: ${row.size}`}, start);
    const label = text(svg, x(row.x), y(row.y) + (row.labelBelow ? r + 17 : -r - 8), String(i + 1), {'text-anchor': 'middle', class: 'small'});step(label,start,450);
    MBB.wrapText(base, 0, 660 + i * 27, `${i + 1}. ${row.name[lang]}`, w, {class: 'small'}, 18);
  });
  text(base, 0, 616, d.sizeLabel[lang], {class: 'small'});
  [maxSize / 4, maxSize].forEach((v, i) => {const r = Math.sqrt(v / maxSize) * (small ? 6 : 12), cx = w - (small ? 90 : 150) + i * (small ? 65 : 100);el('circle',{cx,cy:610,r,fill:'none',stroke:p.muted},null,base);text(base,cx,651,v.toFixed(1),{'text-anchor':'middle',class:'small'});});
  d.notes.forEach((note, i) => {const group=el('g',{},null,svg);MBB.wrapText(group,0,700+d.rows.length*27+i*65,note[lang],w,{'font-weight':700},21);step(group,5700+i*500,450);});
};
