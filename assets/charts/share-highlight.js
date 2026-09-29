'use strict';
Core.install('share-highlight', (d, w) => 150 + d.categories.length * (w < 720 ? d.periods.length * 95 + 45 : 65), v => {
  const {a,d,w,small,base,labels,name,label,group,mark,unit}=v;
  const left=small?0:170,right=w-(small?0:100),cols=small?1:d.periods.length,pw=(right-left)/cols;
  const totals=d.periods.map(row=>row.values.reduce((s,n)=>s+n,0));
  const rowH=small?d.periods.length*95+45:65;
  if(!small)d.periods.forEach((period,k)=>label(base,left+(k+.5)*pw,27,name(period.name),{'text-anchor':'middle','font-weight':700}));
  d.categories.forEach((category,i)=>{
    const yy=70+i*rowH;
    MBB.wrapText(base,small?0:left-14,yy+(small?0:18),name(category),small?w:left-20,{'text-anchor':small?'start':'end',style:'font-size:15px;font-weight:600'},20);
    d.periods.forEach((period,k)=>{
      const x=small?0:left+k*pw,y=yy+(small?27+k*95:0),width=pw-(small?70:75),total=totals[k],g=group();
      if(small)label(base,x,y+2,name(period.name),{'font-size':13});
      const by=y+(small?14:0);let offset=0;
      period.values.forEach((value,j)=>{
        const fill=j===i?v.p.categories[(d.colorGroups?.[i]??i)%v.p.categories.length]:v.p.muted;
        a.el('rect',{x:x+offset/total*width,y:by,width:value/total*width,height:30,fill,'fill-opacity':j===i?1:.18,stroke:v.p.background,'stroke-width':.6},null,g);offset+=value;
      });
      const target=a.el('rect',{x,y:by,width,height:30,fill:'transparent'},null,g);
      label(g,x+width+9,by+21,`${MBB.number(period.values[i]/total*100,v.c.lang)}%`,{'font-size':14});
      mark(g,target,`${name(category)} · ${name(period.name)}\n${period.values[i]} ${unit}\n${v.c.lang==='zh'?'全部类别合计':'Total'}: ${total} ${unit}\n${MBB.number(period.values[i]/total*100,v.c.lang)}%`,i*d.periods.length+k,d.categories.length*d.periods.length);
    });
    if(!small&&d.years){const rate=((d.periods.at(-1).values[i]/d.periods[0].values[i])**(1/d.years)-1)*100;label(base,w-3,yy+21,`${MBB.number(rate,v.c.lang)}%`,{'text-anchor':'end','font-size':15});}
  });
  const last=70+d.categories.length*rowH;
  MBB.wrapText(labels,0,last+25,d.note[v.lang],w,{'font-weight':600,style:'font-size:15px'},22);
  if(!small&&d.years)label(base,w-3,27,'CAGR',{'text-anchor':'end','font-size':14,'font-weight':700});
});
