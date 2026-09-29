'use strict';
MBBCharts.templates['aligned-bars'] = (a, c, {w, zh, small, base, labels}) => {
  const {svg, palette: p, el, text, line, mark} = a;
  const d = c.data, lang = zh ? 0 : 1, left = small ? 0 : 135, gap = small ? 20 : 30;
  const pw = (w - left - gap) / 2, scale = i => d.metrics[i].max;
  d.metrics.forEach((metric, i) => MBB.wrapText(base, left + i * (pw + gap), 25, metric.name[lang], pw, {'font-weight': 700}, 20));
  d.rows.forEach((row, i) => {
    const y = (small ? 150 : 100) + i * (small ? 100 : 65);
    text(base, small ? 0 : left - 15, small ? y - 28 : y + 6, `${i + 1} ${row.name[lang]}`, {'text-anchor': small ? 'start' : 'end', class: 'small'});
    row.values.forEach((value, j) => {
      const x = left + j * (pw + gap), parts = Array.isArray(value) ? value : [value], metric = d.metrics[j];
      let offset = 0;
      if (metric.track) el('rect', {x, y:y-10, width:pw-32,height:22,fill:'none',stroke:p.muted}, null, base);
      parts.forEach((part, k) => {
        const width=part/scale(j)*(pw-32), group=el('g',{},null,svg);
        const bar=el('rect',{x:x+offset,y:y-10,width,height:22,fill:metric.parts?p.categories[k]:p.categories[j]},null,group);
        mark(group,{target:bar,label:`${row.name[lang]}\n${metric.name[lang]}${metric.parts?` · ${metric.parts[k][lang]}`:''}: ${part} ${metric.unit[lang]}`},1000+i*Math.min(500,4500/d.rows.length)+j*200+k*100);
        offset+=width;
      });
      text(labels,x+offset+5,y+6,MBB.number(parts.reduce((sum,n)=>sum+n,0),c.lang),{class:'small'});
    });
    line(base, left, y + 30, w, y + 30);
  });
};
