'use strict';
MBBCharts.templates['dot-comparison'] = (a, c, {w, zh, small, base}) => {
  const {svg, palette: p, el, text, line, mark, step} = a;
  const d=c.data,lang=zh?0:1,left=small?10:(d.groupedRows?330:210),right=w-22,top=80,pitch=small?100:68;
  const minimum=d.min ?? 0, x=v=>left+(v-minimum)/(d.max-minimum)*(right-left);
  d.series.forEach((name,j)=>{const xx=small?j*w/d.series.length:j*190;el('circle',{cx:xx+6,cy:17,r:5,fill:p.categories[j]},null,base);text(base,xx+18,22,name[lang],{class:'small'});});
  MBB.ticks(minimum,d.max,4).forEach(v=>{line(base,x(v),top-15,x(v),top+d.rows.length*pitch);text(base,x(v),top+d.rows.length*pitch+27,String(v),{'text-anchor':'middle',class:'small','data-axis-tick':'x'});});
  d.rows.forEach((row,i)=>{
    const y=top+i*pitch+(small?32:0),group=el('g',{},null,svg);
    if(d.groupedRows && !small && (i===0 || JSON.stringify(row.group)!==JSON.stringify(d.rows[i-1].group))) {
      MBB.wrapText(base,0,y+4,row.group[lang],115,{class:'small'},19);
      line(base,0,y-25,w,y-25);
    }
    const rowTitle=small&&d.groupedRows?`${row.group[lang]} · ${row.name[lang]}`:row.name[lang];
    MBB.wrapText(base,small?0:left-15,y-(small?23:-4),rowTitle,small?w:left-(d.groupedRows?145:22),{'text-anchor':small?'start':'end',class:'small'},18);
    if(d.rangeHighlight) {
      el('rect',{x:left,y:y-14,width:right-left,height:28,fill:p.muted,opacity:.3},null,group);
      el('rect',{x:x(Math.min(...row.values.filter(Number.isFinite))),y:y-14,width:x(Math.max(...row.values.filter(Number.isFinite)))-x(Math.min(...row.values.filter(Number.isFinite))),height:28,fill:p.text,opacity:.25},null,group);
    }
    if(d.arrow && row.values.every(Number.isFinite)) {
      const start=x(row.values[0]),end=x(row.values[1]),direction=Math.sign(end-start);
      line(group,start,y,end,y,{stroke:p.categories[0],'stroke-width':2});
      el('path',{d:`M${end-direction*8} ${y-5}L${end} ${y}L${end-direction*8} ${y+5}`,fill:'none',stroke:p.categories[0],'stroke-width':2},null,group);
    }
    row.values.forEach((v,j)=>Number.isFinite(v)&&el('circle',{cx:x(v),cy:y,r:6,fill:p.categories[j],stroke:p.background,'stroke-width':1},null,group));
    const target=el('rect',{x:left,y:y-12,width:right-left,height:28,fill:'transparent'},null,group);
    mark(group,{target,valueCount:row.values.filter(Number.isFinite).length,label:`${row.name[lang]}\n${row.values.map((v,j)=>`${d.series[j][lang]}: ${v==null?(zh?'未提供':'Not available'):`${v}${d.unit[lang]}`}`).join('\n')}`},1000+i*Math.min(700,5000/d.rows.length));
    text(group,right,y+35,d.arrow ? (row.values.every(Number.isFinite) ? `${zh?'变化':'Change'}: ${MBB.number(row.values[1]-row.values[0],c.lang)} ${d.unit[lang]}` : (zh?'变化：未提供':'Change: not available')) : row.values.map(v=>`${v==null?(zh?'未提供':'Not available'):`${v}${d.unit[lang]}`}`).join(' / '),{'text-anchor':'end',class:'small'});
  });
};
