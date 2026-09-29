'use strict';
MBBCharts.templates['grouped-bars'] = (a, c, {w, H, zh, small, base, labels}) => {
  const {svg, palette: p, el, text, line, mark} = a;
  const d = c.data, lang = zh ? 0 : 1, values = d.rows.flatMap(r => r.values);
  const colors = d.ordinal ? (c.theme === 'dark' ? ['#a6d6ff','#69b8ff','#268df4','#0067df'] : ['#87bce9','#559ad7','#2678c5','#0656ac']) : d.series.length === 2 ? [p.data, p.muted] : p.categories;
  if (d.series.length > colors.length) throw Error('Split categories into facets when distinct colors run out.');
  const min = d.min ?? Math.min(0, ...values), max = d.max ?? Math.max(0, ...values);
  const left = small ? (min < 0 ? 38 : 0) : 200, right = w - 75, top = Math.max(small ? 105 : 85, d.series.length * 26 + 50);
  const rh = Math.max(small ? 110 : 75, d.series.length * 24 + (small ? 45 : 20));
  const x = value => left + (value - min) / (max - min) * (right - left), unit = d.unit?.[lang] || '';
  const deltaUnit = d.deltaUnit?.[lang] || (unit === '%' ? (zh ? '个百分点' : 'percentage points') : unit);
  d.series.forEach((name, j) => {
    el('rect', {x: 0, y: 4 + j * 26, width: 15, height: 15, fill: colors[j]}, null, base);
    text(base, 24, 17 + j * 26, name[lang], {class: 'small'});
  });
  for (const [i, value] of MBB.ticks(min, max, 4).entries()) {
    line(base, x(value), top - 14, x(value), top + d.rows.length * rh - 25);
    text(base, x(value), top - 22, MBB.number(value, c.lang), {'text-anchor': small && i === 0 ? 'start' : 'middle', class: 'small', 'data-axis-tick':'x'});
  }
  if (d.reference != null) {
    line(labels,x(d.reference),top-12,x(d.reference),top+d.rows.length*rh-25,{class:'',stroke:p.text,'stroke-dasharray':'4 4'});
    text(labels,w-3,top+d.rows.length*rh+10,`${d.referenceName[lang]} ${d.reference}${unit}`,{'text-anchor':'end',class:'small'});
  }
  d.rows.forEach((row, i) => {
    const y = top + i * rh, start = 1000 + i * Math.min(750, 4800 / d.rows.length);
    MBB.wrapText(base, small ? 0 : left - 18, y + 10, row.name[lang], small ? w : left - 25, {'text-anchor': small ? 'start' : 'end', style:`font-size:${small?14:17}px`},20);
    const delta = c.editorial ? row.values[1] - row.values[0] : row.values[0] - row.values[1];
    row.values.forEach((value, j) => {
      const group = el('g', {}, null, svg), by = y + (small ? 30 : 0) + j * 24;
      const bar = el('rect', {x: Math.min(x(0),x(value)), y: by, width: Math.abs(x(value)-x(0)), height: 18, fill: colors[j]}, null, group);
      const target = value===0 ? el('circle',{cx:x(0),cy:by+9,r:3,fill:p.background,stroke:colors[j]},null,group) : bar;
      const valueLabel = text(group, x(value) + (value<0?-7:7), by + 14, MBB.number(value,c.lang), {'text-anchor':value<0?'end':'start',class: 'small'});
      const box = valueLabel.getBBox();
      const backing = el('rect', {x: box.x - 1, y: box.y - 1, width: box.width + 2, height: box.height + 2, fill: p.background}, null, group);
      group.insertBefore(backing, valueLabel);
      mark(group, {target, label: `${row.name[lang]}\n${d.series[j][lang]}: ${value}${unit}${d.series.length===2?`\n${zh?'两组差值':'Group difference'}: ${delta>0?'+':''}${MBB.number(delta,c.lang)} ${deltaUnit}`:''}`}, start + j * 200);
    });
    if(d.series.length===2)text(labels, w - 3, y + (small ? 50 : 23), `${delta > 0 ? '+' : ''}${MBB.number(delta,c.lang)} ${deltaUnit}`, {'text-anchor': 'end', class: 'small', 'font-weight': 700});
  });
};
