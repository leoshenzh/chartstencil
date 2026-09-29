'use strict';
MBBCharts.templates['diverging-stack'] = (a, c, {w, zh, small, base, labels}) => {
  const {svg, palette: p, el, text, line, mark} = a;
  const d = c.data, lang = zh ? 0 : 1, top = small ? 210 : 140, bottom = small ? 600 : 650;
  const bound = Math.max(...d.rows.flatMap(r => [r.values.filter(v => v > 0).reduce((s, v) => s + v, 0), -r.values.filter(v => v < 0).reduce((s, v) => s + v, 0)]));
  const domain=d.domain||[-bound,bound],y=v=>bottom-(v-domain[0])/(domain[1]-domain[0])*(bottom-top);
  const stepWidth = (w - 50 - (d.leaders && !small ? 260 : 0)) / d.rows.length, width = Math.min(160, stepWidth * .65);
  d.series.forEach((name, i) => {
    const lx = small ? 0 : i % 3 * w / 3, ly = 22 + (small ? i : Math.floor(i / 3)) * 28;
    el('rect', {x: lx, y: ly - 12, width: 14, height: 14, fill: p.categories[i]}, null, base);
    text(base, lx + 22, ly, name[lang], {class: 'small'});
  });
  MBB.ticks(...domain).forEach(v => {
    line(base, 40, y(v), w, y(v), {'stroke-width': v === 0 ? 2 : 1});
    text(base, 31, y(v) + 4, `${v}`, {'text-anchor': 'end', class: 'small'});
  });
  d.rows.forEach((row, i) => {
    let positive = 0, negative = 0;
    const x = 45 + i * stepWidth + (stepWidth - width) / 2;
    row.values.forEach((v, j) => {
      if (!v) return;
      const start = v > 0 ? positive : negative, end = start + v;
      if (v > 0) positive = end; else negative = end;
      const group = el('g', {}, null, svg), color = p.categories[j];
      const bar = el('rect', {x, y: Math.min(y(start), y(end)), width, height: Math.abs(y(end) - y(start)), fill: color, stroke: p.background}, null, group);
      if (Math.abs(y(end) - y(start)) > 18) text(group, x + width / 2, (y(start) + y(end)) / 2 + 4, `${v > 0 ? '+' : ''}${v}`, {'text-anchor': 'middle', class: 'small', style: `fill:${MBB.ink(color)}`});
      mark(group, {target: bar, label: `${row.name[lang]}\n${d.series[j][lang]}: ${v > 0 ? '+' : ''}${v} ${d.unit?.[lang] || ''}${row.range?`\n${zh?'区间':'Range'}: ${row.range[0]}–${row.range[1]}`:''}`}, 1000 + i * Math.min(850,4500/d.rows.length) + j * 200);
    });
    if(row.net!==undefined) {
      const g=el('g',{},null,svg),circle=el('circle',{cx:x+width+9,cy:y(row.net),r:7,fill:p.background,stroke:p.text,'stroke-width':2},null,g);
      text(g,x+width/2,bottom+76,`${zh?'净值':'Net'} ${row.net}`,{'text-anchor':'middle','font-weight':700,'font-size':small?14:18});
      mark(g,{target:circle,label:`${row.name[lang]} ${zh?'净值':'Net'}: ${row.net}`},5900);
    }
    if(d.leaders && !small){
      const cy=Math.min(y(positive)-52,45+i*39);
      line(base,x+width/2,cy+9,x+width/2,y(positive)-34,{stroke:p.muted});
      el('path',{d:`M${x+width/2} ${cy-7}l5,7l-5,7l-5,-7Z`,fill:p.text},null,base);
      MBB.wrapText(base,x+width/2+11,cy+5,row.name[lang],w-x-width/2-15,{class:'small'},18);
    }else MBB.wrapText(base, x + width / 2, bottom + 30, row.name[lang], stepWidth - 5, {'text-anchor': 'middle', class: 'small'}, 17);
    if(row.range){
      const caption=text(labels,x+width/2,y(positive)-12,`${row.range[0]}–${row.range[1]}`,{'text-anchor':'middle',class:'small'}),b=caption.getBBox();
      const backing=el('rect',{x:b.x-2,y:b.y-1,width:b.width+4,height:b.height+2,fill:p.background},null,labels);labels.insertBefore(backing,caption);
    }
  });
};
