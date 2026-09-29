'use strict';
MBBCharts.templates['stacked-bars'] = (a, c, {w, H, zh, small, base, labels}) => {
  const {svg, palette: p, el, text, line, mark, step} = a;
  const d = c.data, lang = zh ? 0 : 1, top = (small ? Math.max(155, 43 + d.series.length * 28) : 110) + (d.annotations ? 65 : 0), bottom = small ? top + 390 : 570;
  const colors = d.ordinal ? (c.theme === 'dark' ? ['#d2e8ff','#b0d6ff','#8cc4ff','#68b2ff','#429eff','#1e8cff'] : ['#8fbcf0','#74a7e2','#5892d4','#3d7dc6','#2167b8','#0750ac']) : p.categories;
  const left = d.bottomTable ? (small ? 85 : 150) : d.money && zh ? 65 : 45, pw = (w - left) / d.rows.length, bw = d.contiguous ? pw : Math.min(small ? 74 : 160, pw * .6);
  const max = d.max || 100, unit = d.unit?.[lang] || '%', format = v => MBB.number(v,c.lang);
  const y = value => bottom - value / max * (bottom - top);
  d.series.forEach((name, i) => {
    const x = small ? 0 : i % 2 * w / 2, ly = 18 + (small ? i : Math.floor(i / 2)) * 28;
    el('rect', {x, y: ly - 13, width: 15, height: 15, fill: colors[i]}, null, base);
    text(base, x + 24, ly, name[lang], {class: 'small'});
  });
  for (const v of MBB.ticks(0, max)) {
    line(base, left, y(v), w - 10, y(v));
    text(base, left - 8, y(v) + 4, format(v), {'text-anchor': 'end', class: 'small', 'data-axis-tick':'y'});
  }
  let annotationLayer;
  if (d.annotations) {
    const g=el('g',{},null,svg);
    line(g,left,y(d.annotations.reference),w-10,y(d.annotations.reference),{'stroke-dasharray':'5 4',stroke:p.text});
    text(g,w-10,top-59,d.annotations.referenceLabel[lang],{'text-anchor':'end',class:'small'});
    el('path',{d:`M${left} ${top-6}v-18H${w-10}v18`,fill:'none',stroke:p.text},null,g);
    text(g,(left+w-10)/2,top-32,d.annotations.bracket[lang],{'text-anchor':'middle',class:'small','font-weight':700});
    annotationLayer=g; step(g,6900,600);
  }
  d.rows.forEach((row, i) => {
    let sum = 0, outsideY = Infinity;
    const x = left + i * pw + (pw - bw) / 2;
    row.values.forEach((value, j) => {
      const bottomValue = sum; sum += value;
      const group = el('g', {}, null, svg), color = colors[j];
      const bar = el('rect', {x, y: y(sum), width: bw, height: y(bottomValue) - y(sum), fill: color, stroke: p.background, 'stroke-width': 1}, null, group);
      const target=value===0?el('circle',{cx:x+bw/2,cy:y(sum),r:3,fill:p.background,stroke:color,'stroke-width':1.5},null,group):bar;
      const mid = (y(sum) + y(bottomValue)) / 2;
      if (value > 0 && y(bottomValue) - y(sum) < 22 && !d.contiguous) {
        outsideY = Math.min(outsideY - 18, mid + 4);
        line(group, x + bw, mid, x + bw + 7, outsideY - 4, {stroke: p.muted});
        text(group, x + bw + 10, outsideY, format(value), {class: 'small'});
      } else if (y(bottomValue) - y(sum) >= 22) text(group, x + bw / 2, mid + 5, format(value), {'text-anchor': 'middle', 'font-weight': 700, ...(d.money ? {class: 'small'} : {}), style: `fill:${MBB.ink(color)}`});
      mark(group, {target, label: `${row.name[lang]}\n${d.series[j][lang]}: ${format(value)}${unit}\n${zh ? '全部类别合计' : 'All categories'}: ${format(row.values.reduce((s, v) => s + v, 0))}${unit}`}, 1000 + i * Math.min(2000, Math.floor((6400 - (d.series.length - 1) * 400) / Math.max(1, d.rows.length - 1))) + j * 400);
    });
    if (d.totals) {
      el('rect', {x: x + bw / 2 - 27, y: y(sum) - 31, width: 54, height: 22, fill: p.background}, null, labels);
      text(labels, x + bw / 2, y(sum) - 14, format(sum), {'text-anchor': 'middle', class: 'small', 'font-weight': 700});
    }
    text(base, x + bw / 2, bottom + 29, row.name[lang], {'text-anchor': 'middle', 'font-weight': 700});
    if (d.annotations) {
      const value=d.annotations.values[i],g=el('g',{},null,svg);
      el('circle',{cx:x+bw/2,cy:bottom+73,r:22,fill:p.categories[0]},null,g);
      text(g,x+bw/2,bottom+78,`${value}${d.annotations.unit||''}`,{'text-anchor':'middle',class:'small',style:`fill:${MBB.ink(p.categories[0])}`});
      text(g,x+bw/2,bottom+119,d.annotations.bottomLabel[lang],{'text-anchor':'middle',class:'small'});
      mark(g,{label:`${row.name[lang]} ${d.annotations.bottomLabel[lang]}: ${value}${d.annotations.unit??'%'} `},6500);
    }
    (d.bottomTable || []).forEach((metric, k) => {
      const yy=bottom+80+k*44,value=metric.values[i],g=el('g',{},null,svg);
      if(i===0)MBB.wrapText(base,left-12,yy,metric.name[lang],left-20,{'text-anchor':'end',style:'font-size:13px'},18);
      const cell=el('rect',{x:left+i*pw,y:yy-23,width:pw,height:34,fill:'transparent'},null,g);
      text(g,x+bw/2,yy,value==null?(zh?'未提供':'N/A'):MBB.number(value,c.lang),{'text-anchor':'middle',style:'font-size:14px;font-weight:600'});
      mark(g,{target:cell,label:`${row.name[lang]} · ${metric.name[lang]}\n${value==null?(zh?'未提供':'Not provided'):`${value}${metric.unit||''}`}`},5000+k*200+i*90);
    });
    if (d.summary) {
      const value = d.summary.values?.[i] ?? d.summary.indexes.reduce((s, j) => s + row.values[j], 0);
      text(labels, x + bw / 2, bottom + 61, `${d.summary.name[lang]} ${format(value)}${unit}`, {'text-anchor': 'middle', class: 'small', 'font-weight': 700});
    }
  });
  if(annotationLayer)svg.appendChild(annotationLayer);
};
