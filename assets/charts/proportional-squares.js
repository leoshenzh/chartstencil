'use strict';
MBBCharts.templates['proportional-squares'] = (a, c, {w, zh, small, base, labels}) => {
  const {svg, palette: p, el, text, mark} = a;
  const d = c.data, lang = zh ? 0 : 1, cols = small ? 1 : d.rows.length;
  const cell = w / cols, max = Math.max(...d.rows.map(r => r.values.reduce((s, v) => s + v, 0)));
  const sideMax = Math.min(cell - 50, small ? 360 : 270), rowHeight = sideMax + (d.groups ? 170 : 125);
  if (d.growthBracket) {
    const first=d.rows[0].values.reduce((s,n)=>s+n,0),last=d.rows.at(-1).values.reduce((s,n)=>s+n,0),rate=((last/first)**(1/d.growthBracket.years)-1)*100;
    const yy=small?d.rows.length*rowHeight+15:rowHeight+15;
    el('path',{d:`M${w*.15} ${yy}v20H${w*.85}v-15m-4,5l4,-5l4,5`,fill:'none',stroke:p.text},null,labels);
    text(labels,w/2,yy+52,`${zh?'年均增长':'CAGR'} ${MBB.number(rate,c.lang)}%`,{'text-anchor':'middle','font-weight':700});
  }
  d.rows.forEach((row, i) => {
    const total = row.values.reduce((s, v) => s + v, 0), side = sideMax * Math.sqrt(total / max);
    const cx = (i % cols + .5) * cell, bottom = Math.floor(i / cols) * rowHeight + sideMax + 50;
    text(base, cx, bottom - sideMax - 24, row.name[lang], {'text-anchor': 'middle', 'font-weight': 700});
    let offset = 0;
    row.values.forEach((value, j) => {
      const group = el('g', {}, null, svg);
      let x=cx-side/2+offset,y=bottom-side,width=side*value/total,height=side;
      if(d.groups){
        const gi=d.groups.findIndex(g=>g.includes(j)),indexes=d.groups[gi],subtotal=indexes.reduce((s,k)=>s+row.values[k],0);
        x=cx-side/2+side*d.groups.slice(0,gi).flat().reduce((s,k)=>s+row.values[k],0)/total;
        width=side*subtotal/total;height=side*value/subtotal;
        y=bottom-side+side*indexes.slice(0,indexes.indexOf(j)).reduce((s,k)=>s+row.values[k],0)/subtotal;
      }
      const rect = el('rect', {x,y,width,height, fill: p.categories[j], stroke: p.background}, null, group);
      mark(group, {target: rect, label: `${row.name[lang]}\n${d.series[j][lang]}: ${value} ${d.unit[lang]}\n${zh ? '合计' : 'Total'}: ${total} ${d.unit[lang]}`}, 1100 + i * 1500 + j * 500);
      offset += side * value / total;
    });
    text(base, cx, bottom + 30, `${zh ? '合计' : 'Total'} ${total}`, {'text-anchor': 'middle', 'font-weight': 700});
    row.values.forEach((v, j) => text(labels, cx, bottom + 54 + j * 19, `${d.series[j][lang]} ${v}`, {'text-anchor': 'middle', class: 'small'}));
  });
};
