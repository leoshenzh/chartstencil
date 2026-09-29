'use strict';
MBBCharts.templates['concentric-rings']=(a,c,{w,zh,small,base})=>{
  const {svg,palette:p,el,text,mark}=a,d=c.data,lang=zh?0:1,cols=small?1:3,pw=w/cols;
  d.series.forEach((name,j)=>{el('circle',{cx:7,cy:15+j*25,r:5,fill:p.categories[j]},null,base);text(base,22,20+j*25,name[lang],{class:'small'});});
  d.rows.forEach((row,i)=>{
    const cx=(i%cols+.5)*pw,cy=165+Math.floor(i/cols)*265;
    text(base,cx,cy+5,row.name[lang],{'text-anchor':'middle','font-weight':700});
    row.values.forEach((v,j)=>{
      const r=88-j*20,angle=-Math.PI/2+v/100*Math.PI*2,start=[cx,cy-r],end=[cx+r*Math.cos(angle),cy+r*Math.sin(angle)],g=el('g',{},null,svg);
      const path=el('path',{d:`M${start} A${r} ${r} 0 ${v>50?1:0} 1 ${end}`,stroke:p.categories[j],'stroke-width':13,fill:'none',style:'pointer-events:stroke'},null,g);
      text(g,cx,cy+119+j*23,`${d.series[j][lang]} ${v}%`,{'text-anchor':'middle',class:'small'});
      mark(g,{target:path,kind:'ribbon',label:`${row.name[lang]}\n${d.series[j][lang]}: ${v}%`},1000+i*Math.min(450,5000/d.rows.length)+j*150);
    });
  });
};
