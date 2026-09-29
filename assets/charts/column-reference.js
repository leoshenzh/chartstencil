'use strict';
MBBCharts.templates['column-reference']=(a,c,{w,zh,small,base,labels})=>{
  const {svg,palette:p,el,text,line,mark,step}=a,d=c.data,lang=zh?0:1,left=38,right=w-25,top=80,bottom=480,pitch=(right-left)/d.rows.length,bw=Math.min(55,pitch*.45),y=v=>bottom-v/d.max*(bottom-top);
  MBB.ticks(0,d.max,4).forEach(v=>{line(base,left,y(v),right,y(v));text(base,left-8,y(v)+4,String(v),{'text-anchor':'end',class:'small','data-axis-tick':'y'});});
  d.rows.forEach((row,i)=>{
    const x=left+(i+.5)*pitch,g=el('g',{},null,svg),color=p.categories[row.group||0];
    const bar=el('rect',{x:x-bw/2,y:y(row.values[1]),width:bw,height:bottom-y(row.values[1]),fill:color},null,g);
    const point=el('circle',{cx:x,cy:y(row.values[0]),r:7,fill:p.background,stroke:p.text,'stroke-width':2},null,g);
    mark(g,{target:bar,valueCount:2,label:`${row.name[lang]}\n${d.years[0]}: ${row.values[0]}\n${d.years[1]}: ${row.values[1]} ${d.unit[lang]}`},1000+i*650);
    text(base,x,bottom+28,String(i+1),{'text-anchor':'middle',class:'small'});
    MBB.wrapText(base,0,560+i*27,`${i+1}. ${row.name[lang]}`,w,{class:'small'},18);
  });
  d.groups.forEach((group,i)=>{
    const ids=d.rows.map((r,j)=>r.group===i?j:-1).filter(j=>j>=0);if(!ids.length)return;
    const x=left+ids[0]*pitch,width=ids.length*pitch;
    line(base,x,35,x+width-5,35);MBB.wrapText(base,x+width/2,20,group[lang],width-8,{'text-anchor':'middle',class:'small'},17);
  });
  const g=el('g',{},null,svg);
  d.references.forEach((ref,i)=>{line(g,left,y(ref.value),right,y(ref.value),{'stroke-dasharray':i?'4 4':'none',stroke:p.text});text(g,right,y(ref.value)-7,ref.name[lang],{'text-anchor':'end',class:'small'});});
  text(base,0,525,`${zh?'空心点':'Open point'}: ${d.years[0]} · ${zh?'柱':'Bar'}: ${d.years[1]}`,{class:'small'});step(g,6800,600);
};
