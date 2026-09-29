'use strict';
MBBCharts.templates['icon-circles']=(a,c,{w,zh,small,base})=>{
  const {svg,palette:p,el,text,mark}=a,d=c.data,lang=zh?0:1,cols=small?1:d.rows.length,pw=w/cols,max=Math.max(...d.rows.map(r=>r.value));
  d.rows.forEach((row,i)=>{
    const cx=(i%cols+.5)*pw,cy=200+Math.floor(i/cols)*440,r=Math.min(pw/2-25,175)*Math.sqrt(row.value/max),g=el('g',{},null,svg),count=Math.round(row.value/d.perIcon);
    for(let j=0;j<count;j++){
      const radius=r*Math.sqrt((j+.5)/count),angle=j*2.39996323,x=cx+radius*Math.cos(angle),y=cy+radius*Math.sin(angle);
      el('path',{d:`M${x-3},${y-5}v-3h6v3l2,3v9h-10v-9Z`,fill:'none',stroke:p.categories[i%6],'stroke-width':1.5},null,g);
    }
    el('rect',{x:cx-35,y:cy-22,width:70,height:41,fill:p.background},null,g);
    text(g,cx,cy+9,String(row.value),{'text-anchor':'middle',class:'serif'});
    const target=el('circle',{cx,cy,r,fill:'transparent'},null,g);
    mark(g,{target,label:`${row.name[lang]}: ${row.value} ${d.unit[lang]}\n${zh?'每个图标':'Each icon'}: ${d.perIcon} ${d.unit[lang]}`},1100+i*1700);
    MBB.wrapText(base,cx,cy+205,row.name[lang],pw-20,{'text-anchor':'middle','font-weight':700},21);
  });
};
