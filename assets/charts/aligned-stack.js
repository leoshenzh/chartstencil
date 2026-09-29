'use strict';
MBBCharts.templates['aligned-stack'] = (a, c, {w, zh, small, base}) => {
  const {svg,palette:p,el,text,line,mark}=a,d=c.data,lang=zh?0:1;
  const left=small?0:230,gap=35,plot=(w-left-gap)*.65,right=left+plot+gap,rw=w-right-45,pitch=small?115:75;
  d.series.forEach((name,j)=>{const x=small?0:j%3*w/3,y=18+Math.floor(j/(small?1:3))*25;el('rect',{x,y:y-12,width:12,height:12,fill:p.categories[j]},null,base);text(base,x+20,y,name[lang],{class:'small'});});
  const top=small?200:125;
  text(base,left,top-35,(d.stackLabel?.[lang]||(zh?'构成（%）':'Composition (%)')),{class:'small','font-weight':700});
  text(base,right,top-35,(d.metricLabel?.[lang]||(zh?'辅助指标':'Companion metric')),{class:'small','font-weight':700});
  d.rows.forEach((row,i)=>{
    const y=top+i*pitch,g=el('g',{},null,svg);let total=0;
    MBB.wrapText(base,small?0:left-12,y-(small?20:-5),row.name[lang],small?w:left-20,{'text-anchor':small?'start':'end',class:'small'},18);
    row.values.forEach((v,j)=>{
      const x=left+total/(d.stackMax||100)*plot,width=v/(d.stackMax||100)*plot;total+=v;
      const bar=el('rect',{x,y,width,height:25,fill:p.categories[j]},null,g);
      if(width>23)text(g,x+width/2,y+17,String(v),{'text-anchor':'middle',class:'small',style:`fill:${MBB.ink(p.categories[j])}`});
      mark(bar,{label:`${row.name[lang]}\n${d.series[j][lang]}: ${v}%`},900+i*400+j*90);
    });
    const width=row.metric/d.metricMax*rw,bar=el('rect',{x:right,y,width,height:25,fill:p.categories[5]},null,g);
    text(g,right+width+4,y+18,MBB.number(row.metric,c.lang),{class:'small'});
    mark(bar,{label:`${row.name[lang]}\n${(d.metricLabel?.[lang]||(zh?'辅助指标':'Companion metric'))}: ${row.metric.toLocaleString(zh?'zh-CN':'en-US')} ${(d.metricUnit?.[lang]||'')}`},1100+i*400);
    line(base,left,y+40,w,y+40);
  });
};
