'use strict';
Core.install('profile-facets', 1050, v => {
  const {a,d,w,small,base,labels,name,label,group,mark,color}=v;
  const cols=small?1:d.panels.length,pw=w/cols,ph=d.bars?840:890,top=d.bars?160:100,bottom=580;
  const ageColors=v.c.theme==='dark'?['#267fdf','#62a8ef','#a4d0ff']:['#175794','#4c88bf','#90b9de'];
  const totalMax=Math.max(...d.panels.flatMap(p=>p.series.map(s=>s.total||0)));
  const count=d.panels.reduce((n,p)=>n+d.ages.length+(p.series.filter(s=>s.total!=null).length),0);let index=0;
  d.panels.forEach((panel,k)=>{
    const ox=small?0:k*pw,oy=small?k*ph:0,left=ox+75,right=ox+pw-15,cx=(left+right)/2,room=(right-left)/2;
    const max=panel.max||Math.max(...panel.series.flatMap(s=>[...s.left,...s.right]));
    const yy=i=>oy+top+i*(bottom-top)/(d.ages.length-1),xx=(n,side)=>cx+(side?1:-1)*n/max*room;
    MBB.wrapText(base,ox+pw/2,oy+25,name(panel.name),pw-10,{'text-anchor':'middle',style:'font-size:18px;font-weight:700'},23);
    a.line(base,cx,oy+top-18,cx,oy+bottom+18);
    d.ages.forEach((age,i)=>{
      label(base,left-9,yy(i)+5,name(age),{'text-anchor':'end','font-size':small?12:13});
      a.line(base,left,yy(i),right,yy(i),{'stroke-opacity':.35});
    });
    panel.series.forEach((series,j)=>{
      if(d.bars){
        const rh=(bottom-top)/(d.ages.length-1)*.94;
        d.ages.forEach((_,i)=>{
          const fill=ageColors[panel.levels?.[i]??j];
          a.el('rect',{x:xx(series.left[i],0),y:yy(i)-rh/2,width:xx(series.right[i],1)-xx(series.left[i],0),height:rh,fill},null,base);
          label(base,cx,yy(i)+5,MBB.number(series.left[i]+series.right[i],v.c.lang),{'text-anchor':'middle','font-size':13,style:`fill:${MBB.ink(fill)}`});
        });
      }else{
        const path=series.left.map((n,i)=>`${i?'L':'M'}${xx(n,0)} ${yy(i)}`).join(' ')+' '+series.right.map((n,i)=>[xx(n,1),yy(i)]).reverse().map(p=>`L${p.join(' ')}`).join(' ')+' Z';
        const shape=a.el('path',{d:path,fill:j?'none':color(j),'fill-opacity':.13,stroke:color(j),'stroke-width':1.8},null,base);a.step(shape,900+j*300,600);
      }
      if(series.total!=null){
        const cy=oy+730,r=Math.sqrt(series.total/totalMax)*Math.min(85,room),g=group();
        const path=a.el('path',{d:`M${cx-r} ${cy}a${r} ${r} 0 0 1 ${2*r} 0Z`,fill:j?'none':color(j),'fill-opacity':.15,stroke:color(j),'stroke-width':2},null,g);
        mark(g,path,`${name(panel.name)} · ${name(series.name)}\n${v.c.lang==='zh'?'合计':'Total'}: ${series.total} ${name(d.totalUnit)}`,index++,count, {kind:'ribbon'});
      }
    });
    d.ages.forEach((age,i)=>{
      const g=group(),rh=(bottom-top)/(d.ages.length-1),target=a.el('rect',{x:left,y:yy(i)-rh/2,width:right-left,height:rh,fill:'transparent'},null,g);
      const readings=panel.series.map(s=>`${name(s.name)}: ${d.bars?MBB.number(s.left[i]+s.right[i],v.c.lang):`${s.left[i]} / ${s.right[i]}`} ${name(d.unit)}`).join('\n');
      mark(g,target,`${name(panel.name)} · ${name(age)}\n${readings}`,index++,count);
    });
    if(d.sides)label(base,cx,oy+bottom+54,`${name(d.sides[0])} ← → ${name(d.sides[1])}`,{'text-anchor':'middle','font-size':13});
    if(panel.bracket){
      const bx=right+5,y1=yy(panel.bracket.from),y2=yy(panel.bracket.to);
      a.el('path',{d:`M${bx-8} ${y1}h8V${y2}h-8`,fill:'none',stroke:v.p.text},null,labels);
      MBB.wrapText(labels,cx,oy+bottom+85,name(panel.bracket.name),pw-25,{'text-anchor':'middle',style:'font-size:14px;font-weight:700'},20);
    }
    (d.bars && d.levelNames ? d.levelNames.map(n=>({name:n})) : panel.series).forEach((s,j)=>{
      const y=oy+(d.bars?715:775)+j*29;
      a.el('rect',{x:left,y:y-13,width:13,height:13,fill:d.bars?ageColors[j]:color(j)},null,base);
      label(base,left+22,y,`${name(s.name)}${s.total==null?'':` · ${s.total} ${name(d.totalUnit)}`}`,{'font-size':14});
    });
  });
});
