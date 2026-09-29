'use strict';
Core.install('unit-ledger', (d,w)=>160+d.rows.length*(w<720?d.stages.length*76+95:85),v=>{
  const {a,d,w,small,base,labels,name,label,group,mark}=v;
  const left=small?0:170,right=w-(small?0:90),cw=(right-left)/(small?1:d.stages.length),rh=small?d.stages.length*76+95:85;
  if(!small)d.stages.forEach((stage,j)=>MBB.wrapText(base,left+(j+.5)*cw,24,name(stage),cw-12,{'text-anchor':'middle',style:'font-size:14px;font-weight:600'},19));
  if(!small)label(base,w-3,24,v.c.lang==='zh'?'平均阶段':'Mean stage',{'text-anchor':'end','font-size':14});
  d.rows.forEach((row,i)=>{
    const top=75+i*rh,total=row.counts.reduce((s,n)=>s+n,0);
    if(row.counts.some(n=>!Number.isInteger(n)||n<0)||!total)throw Error('Unit counts must be nonnegative integers with a positive total.');
    const average=row.counts.reduce((s,n,j)=>s+n*d.scores[j],0)/total;
    MBB.wrapText(base,small?0:left-14,top+(small?0:19),name(row.name),small?w:left-24,{'text-anchor':small?'start':'end',style:'font-size:15px;font-weight:600'},20);
    row.counts.forEach((count,j)=>{
      const x=small?0:left+j*cw,y=top+(small?28+j*76:0),g=group(),width=cw-8,cell=width/total;
      if(small)label(base,x,y+2,name(d.stages[j]),{'font-size':14});
      const by=y+(small?14:0);
      for(let n=0;n<total;n++)a.el('rect',{x:x+n*cell,y:by,width:Math.max(.1,cell-.8),height:27,fill:n<count?v.p.data:v.p.background,stroke:v.p.muted,'stroke-width':.4},null,g);
      const target=a.el('rect',{x,y:by,width,height:27,fill:'transparent'},null,g);
      mark(g,target,`${name(row.name)} · ${name(d.stages[j])}\n${count} ${name(d.unit)}\n${v.c.lang==='zh'?'组内总数':'Group total'}: ${total}\n${v.c.lang==='zh'?'加权平均阶段':'Weighted mean stage'}: ${MBB.number(average,v.c.lang)}`,i*d.stages.length+j,d.rows.length*d.stages.length);
    });
    label(base,small?0:w-3,small?top+rh-25:top+20,`${small?(v.c.lang==='zh'?'平均阶段 ':'Mean stage '):''}${MBB.number(average,v.c.lang)}`,{'text-anchor':small?'start':'end','font-size':16,'font-weight':700});
  });
  MBB.wrapText(labels,0,95+d.rows.length*rh,`${v.c.lang==='zh'?'每格代表1':'Each cell represents 1'} ${name(d.unit)}; ${v.c.lang==='zh'?'平均值按阶段序数加权':'means are weighted by stage order'}`,w,{style:'font-size:14px'},20);
});
