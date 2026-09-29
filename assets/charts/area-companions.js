'use strict';
// Costs and secondary quantities use separate, explicitly labelled area scales.
Core.install('area-companions', 1000, v => {
  const {a,d,w,small,base,labels,name,label,group,mark,color}=v;
  const columns=small?1:d.groups.length,pitch=w/columns,sideMax=Math.min(280,pitch-36),totals=d.groups.map(g=>g.parts.reduce((s,r)=>s+r.value,0)),max=Math.max(...totals);
  const maxSecondary=d.secondaryMax||Math.max(...d.groups.flatMap(g=>g.parts.map(r=>r.secondary??0)));
  const rowH=sideMax+190+Math.max(...d.groups.map(g=>g.parts.length))*105;
  const records=d.groups.reduce((n,g)=>n+g.parts.length+g.parts.filter(r=>r.secondary!=null).length,0);let index=0;
  d.groups.forEach((category,k)=>{
    const ox=small?0:k*pitch,oy=small?k*rowH:0,cx=ox+pitch/2,side=sideMax*Math.sqrt(totals[k]/max),bottom=oy+sideMax+75;
    MBB.wrapText(base,cx,oy+24,name(category.name),pitch-12,{'text-anchor':'middle',style:'font-size:19px;font-weight:700'},24);
    label(base,cx,oy+52,`${name(d.primaryName)} · ${name(d.primaryUnit)}`,{'text-anchor':'middle','font-size':14});
    let offset=0;const centers=[];
    category.parts.forEach((part,j)=>{
      const width=side*part.value/totals[k],x=cx-side/2+offset,fill=color(j),g=group();offset+=width;
      centers.push(x+width/2);
      const rect=a.el('rect',{x,y:bottom-side,width,height:side,fill,stroke:v.p.background},null,g);
      if(width>35)label(g,x+width/2,bottom-side/2+5,MBB.number(part.value,v.c.lang),{'text-anchor':'middle','font-size':small?14:18,style:`fill:${MBB.ink(fill)}`});
      mark(g,rect,`${name(category.name)} · ${name(part.name)}\n${name(d.primaryName)}: ${part.value} ${name(d.primaryUnit)}`,index++,records);
    });
    label(labels,cx,bottom+31,`${v.c.lang==='zh'?'合计':'Total'} ${MBB.number(totals[k],v.c.lang)}`,{'text-anchor':'middle','font-weight':700});
    MBB.wrapText(base,cx,bottom+79,`${name(d.secondaryName)} · ${name(d.secondaryUnit)}`,pitch-16,{'text-anchor':'middle',style:'font-size:15px;font-weight:700'},20);
    category.parts.forEach((part,j)=>{
      const y=bottom+140+j*105,g=group(),r=part.secondary==null?0:31*Math.sqrt(part.secondary/maxSecondary),circleX=ox+45;
      if(d.connect && part.secondary!=null){
        const elbow=ox+8+j*5;
        a.el('path',{d:`M${centers[j]} ${bottom+4}V${bottom+42+j*7}H${elbow}V${y}H${circleX-34}`,fill:'none',stroke:v.p.muted,'stroke-width':.8,'pointer-events':'none'},null,base);
      }
      if(part.secondary!=null){
        if(d.secondaryMax)a.el('circle',{cx:circleX,cy:y,r:31,fill:v.p.muted,'fill-opacity':.16,stroke:v.p.muted},null,g);
        const circle=a.el('circle',{cx:circleX,cy:y,r,fill:color(j)},null,g);
        mark(g,circle,`${name(category.name)} · ${name(part.name)}\n${name(d.secondaryName)}: ${part.secondary} ${name(d.secondaryUnit)}`,index++,records);
      }
      MBB.wrapText(base,ox+90,y-6,name(part.name),pitch-98,{style:'font-size:15px'},20);
      label(base,ox+90,y+22,part.secondary==null?(v.c.lang==='zh'?'未提供':'Not provided'):`${MBB.number(part.secondary,v.c.lang)} ${name(d.secondaryUnit)}`,{'font-size':14,'font-weight':700});
    });
  });
});
