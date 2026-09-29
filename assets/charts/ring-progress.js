'use strict';
MBBCharts.templates['ring-progress']=(a,c,{w,zh,small,base,labels})=>{
  const {svg,palette:p,el,text,mark,step}=a,d=c.data,lang=zh?0:1,cx=w/2,cy=small?170:245,r=Math.min(w/2-22,205),inner=r*.76,total=d.rows.reduce((s,r)=>s+r.values[0],0);
  const pt=(rad,ang)=>[cx+rad*Math.cos(ang),cy+rad*Math.sin(ang)];
  const arc=(start,end)=>`M${pt(r,start)} A${r},${r} 0 ${end-start>Math.PI?1:0} 1 ${pt(r,end)} L${pt(inner,end)} A${inner},${inner} 0 ${end-start>Math.PI?1:0} 0 ${pt(inner,start)} Z`;
  let angle=-Math.PI/2;
  d.rows.forEach((row,i)=>{
    const next=angle+row.values[0]/total*Math.PI*2,end=angle+row.values[1]/total*Math.PI*2,color=p.categories[i],g=el('g',{},null,svg);
    el('path',{d:arc(angle,next),fill:'none',stroke:p.muted,'stroke-width':1},null,base);
    const band=el('path',{d:arc(angle,end),fill:color},null,g),mid=(angle+end)/2,q=pt((r+inner)/2,mid),target=el('circle',{cx:q[0],cy:q[1],r:2,fill:'transparent',style:'pointer-events:none'},null,g);
    mark(band,{target,valueCount:2,label:`${row.name[lang]}\n${d.years[0]}: ${row.values[0]}\n${d.years[1]}: ${row.values[1]} ${d.unit[lang]}\n${zh?'变化':'Change'}: ${Math.round((row.values[1]/row.values[0]-1)*100)}%`},1000+i*900);
    const y=cy+r+55+i*42;
    el('rect',{x:0,y:y-13,width:13,height:13,fill:color},null,base);
    text(base,23,y,row.name[lang],{class:'small'});
    text(base,w-2,y,`${row.values[0]} → ${row.values[1]}  (${Math.round((row.values[1]/row.values[0]-1)*100)}%)`,{'text-anchor':'end',class:'small'});
    angle=next;
  });
  text(labels,cx,cy-15,String(d.years[1]),{'text-anchor':'middle','font-weight':700});
  text(labels,cx,cy+27,d.rows.reduce((s,r)=>s+r.values[1],0).toFixed(1),{'text-anchor':'middle',class:'serif'});
  text(labels,cx,cy+55,d.unit[lang],{'text-anchor':'middle',class:'small'});
};
