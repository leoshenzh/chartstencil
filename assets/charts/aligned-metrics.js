'use strict';
// A shared category column aligns a two-period trend, metric1, metric2 and metric3.
MBBCharts.templates['aligned-metrics'] = (a, c, {w, zh, small, base}) => {
  const {svg,palette:p,el,text,line,mark}=a,d=c.data,lang=zh?0:1;
  const cols=small?1:d.rows.length,pw=w/cols,ph=small?570:655;
  const low=Math.min(0,...d.rows.flatMap(r=>r.values)),high=Math.max(...d.rows.flatMap(r=>r.values))*1.2;
  const maxMetric2=Math.max(...d.rows.map(r=>r.metric2||0));
  const metrics=d.metricLabels||[['指标 1','Metric 1'],['指标 2','Metric 2'],['指标 3','Metric 3']];
  d.rows.forEach((r,i)=>{
    const ox=(i%cols)*pw,oy=Math.floor(i/cols)*ph,left=ox+20,right=ox+pw-20,top=oy+95,bottom=oy+265;
    const y=v=>bottom-(v-low)/(high-low)*(bottom-top),start=1000+i*Math.min(450,4000/d.rows.length);
    text(base,ox+pw/2,oy+26,r.name[lang],{'text-anchor':'middle','font-weight':700});
    line(base,left,y(0),right,y(0));
    const g=el('g',{},null,svg);
    el('path',{d:`M${left} ${y(0)}L${left} ${y(r.values[0])}L${right} ${y(r.values[1])}L${right} ${y(0)}Z`,fill:p.data,opacity:.22},null,g);
    line(g,left,y(r.values[0]),right,y(r.values[1]),{class:'',stroke:p.data,'stroke-width':3});
    [left,right].forEach((x,j)=>{
      el('circle',{cx:x,cy:y(r.values[j]),r:5,fill:j?p.data:p.background,stroke:p.data,'stroke-width':2},null,g);
      text(g,x,y(r.values[j])-13,`${r.values[j]}`,{'text-anchor':j?'end':'start',class:'small'});
    });
    const hit=el('rect',{x:left,y:top-35,width:right-left,height:bottom-top+35,fill:'transparent'},null,g);
    mark(g,{target:hit,label:`${r.name[lang]}\n${d.periods.map((v,j)=>`${v[lang]}: ${r.values[j]} ${d.unit[lang]}`).join('\n')}`,valueCount:2},start);
    d.periods.forEach((v,j)=>text(base,j?right:left,bottom+25,v[lang],{'text-anchor':j?'end':'start',class:'small'}));
    ['metric1','metric2','metric3'].forEach((key,j)=>{
      const cy=oy+340+j*95,value=r[key];
      if(value==null)return;
      const cell=el('g',{},null,svg);
      text(base,ox+pw/2,cy-33,metrics[j][lang],{'text-anchor':'middle',class:'small'});
      if(key==='metric2')el('circle',{cx:ox+pw/2,cy,r:Math.sqrt(value/maxMetric2)*29,fill:p.data,opacity:.4},null,cell);
      const target=el('rect',{x:ox+8,y:cy-28,width:pw-16,height:58,fill:'transparent'},null,cell);
      text(cell,ox+pw/2,cy+6,value.toLocaleString(zh?'zh-CN':'en-US'),{'text-anchor':'middle','font-weight':700});
      mark(cell,{target,label:`${r.name[lang]}\n${metrics[j][lang]}: ${value}`},start+400+j*400);
    });
  });
};
