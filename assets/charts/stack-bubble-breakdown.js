'use strict';
MBBCharts.templates['stack-bubble-breakdown'] = (a, c, {w, zh, small, base, labels}) => {
  const {svg, palette:p, el, text, line, mark, step} = a, d=c.data, lang=zh?0:1;
  const bw=small?54:65, bx=small?w-85:230, top=60, height=440;
  let sum=0;
  d.rows.forEach((row,i)=>{
    const y=top+sum/100*height, h=row.value/100*height; sum+=row.value;
    const g=el('g',{},null,svg),color=p.categories[i%p.categories.length];
    const bar=el('rect',{x:bx,y,width:bw,height:h,fill:color,stroke:p.background},null,g);
    text(g,bx+bw/2,y+h/2+4,String(row.value),{'text-anchor':'middle',class:'small',style:`fill:${MBB.ink(color)}`});
    MBB.wrapText(g,bx-12,y+h/2+4,row.name[lang],bx-15,{'text-anchor':'end',class:'small'},17);
    mark(g,{target:bar,label:`${row.name[lang]}: ${row.value}%`},900+i*230);
  });
  const selected=d.rows.slice(0,d.selected).reduce((s,r)=>s+r.value,0), ex=bx+bw+10;
  el('path',{d:`M${ex} ${top}h7v${selected/100*height}h-7`,fill:'none',stroke:p.text},null,labels);
  const startY=small?615:95, startX=small?0:355, cols=small?2:3, pw=(w-startX)/cols, pitch=180;
  MBB.wrapText(base,startX,small?560:28,d.detailTitle[lang],w-startX,{'font-weight':700},22);
  const positions=d.factors.map((r,i)=>{const row=Math.floor(i/cols),col=row%2?cols-1-i%cols:i%cols;return {x:startX+(col+.5)*pw,y:startY+row*pitch};});
  positions.forEach((pt,i)=>{if(!i)return;const prev=positions[i-1];line(base,prev.x,prev.y,pt.x,pt.y,{stroke:p.muted});});
  d.factors.forEach((row,i)=>{
    const pt=positions[i],r=Math.sqrt(row.value/d.max)*Math.min(58,pw*.32),g=el('g',{},null,svg);
    const circle=el('circle',{cx:pt.x,cy:pt.y,r,fill:p.categories[0]},null,g);
    text(g,pt.x,pt.y+5,String(row.value),{'text-anchor':'middle','font-weight':700,style:`fill:${MBB.ink(p.categories[0])}`});
    MBB.wrapText(g,pt.x,pt.y+72,row.name[lang],pw-14,{'text-anchor':'middle',class:'small'},18);
    mark(g,{target:circle,label:`${row.name[lang]}: ${row.value} ${d.unit?.[lang] || ''}`},2100+i*260);
  });
};
