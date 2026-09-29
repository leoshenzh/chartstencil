'use strict';
MBBCharts.templates['cross-glyph'] = (a,c,{w,zh,small,base})=>{
  const {svg,palette:p,el,text,mark}=a,d=c.data,lang=zh?0:1,cols=small?1:3,pw=w/cols;
  d.series.forEach((name,j)=>{const x=small?0:j%3*w/3,y=18+Math.floor(j/(small?1:3))*27;el('rect',{x,y:y-12,width:12,height:12,fill:p.categories[j]},null,base);text(base,x+21,y,name[lang],{class:'small'});});
  const top=small?175:95,unit=1.05;
  d.rows.forEach((row,i)=>{
    const cx=(i%cols+.5)*pw,cy=top+Math.floor(i/cols)*270+105,half=22;
    text(base,cx,cy-95,row.name[lang],{'text-anchor':'middle','font-weight':700});
    row.values.forEach((v,j)=>{
      let x=cx-half,y=cy-half,width=half*2,height=half*2;
      if(j===1){y-=v*unit;height=v*unit;}if(j===2){x-=v*unit;width=v*unit;}if(j===3){x+=half*2;width=v*unit;}if(j===4){y+=half*2;height=v*unit;}
      const g=el('g',{},null,svg),color=p.categories[j],r=el('rect',{x,y,width,height,fill:color,stroke:p.background},null,g);
      text(g,x+width/2,y+height/2+4,String(v),{'text-anchor':'middle',class:'small',style:`fill:${MBB.ink(color)}`});
      mark(g,{target:r,label:`${row.name[lang]}\n${d.series[j][lang]}: ${v}%`},1000+i*500+j*160);
    });
  });
};
