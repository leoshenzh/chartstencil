'use strict';
Core.install('scenario-columns', 810, v => {
  const {a, d, w, small, base, labels, name, label, group, mark, unit} = v;
  const left = 48, right = w - (small ? 8 : 230), top = 100, bottom = 580;
  const maximum = Math.max(...d.rows.map(r => r.actual ?? Math.max(...r.scenarios))), max = MBB.ticks(0, maximum * 1.2).at(-1);
  const y = n => bottom - n / max * (bottom - top), pitch = (right - left) / d.rows.length;
  const colors = v.c.theme === 'dark' ? ['#167fe5', '#4a9ded', '#8fc7ff'] : ['#0755a2', '#387fc5', '#7cb1e6'];
  MBB.ticks(0, max).forEach(n => {a.line(base,left,y(n),right,y(n));label(base,left-9,y(n)+5,String(n),{'text-anchor':'end','data-axis-tick':'y','font-size':small?12:15});});
  d.rows.forEach((row, i) => {
    const values = row.actual != null ? [row.actual] : row.scenarios;
    if (values.some((n, j) => n < 0 || j && n < values[j - 1])) throw Error('Scenario levels must be nonnegative and ordered.');
    const g = group();
    values.forEach((value, j) => a.el('rect', {x:left+i*pitch, y:y(value), width:pitch, height:y(j?values[j-1]:0)-y(value), fill:row.actual!=null?v.p.muted:colors[j],stroke:v.p.background,'stroke-width':.6}, null, g));
    const target = a.el('rect', {x:left+i*pitch,y:y(values.at(-1)),width:pitch,height:bottom-y(values.at(-1)),fill:'transparent'}, null, g);
    mark(g,target,`${name(row.name)}\n${row.actual!=null?`${v.c.lang==='zh'?'实际':'Actual'}: ${row.actual} ${unit}`:d.scenarios.map((s,j)=>`${name(s)}: ${values[j]} ${unit}`).join('\n')}`,i,d.rows.length);
    label(base,left+(i+.5)*pitch,bottom+27,name(row.name),{'text-anchor':'middle','font-size':small?11:15});
  });
  const first = d.rows.findIndex(r=>r.actual==null), boundary = left+first*pitch;
  a.line(base,boundary,top,boundary,bottom,{'stroke-dasharray':'3 3',stroke:v.p.text});
  label(base,(left+boundary)/2,bottom+62,v.c.lang==='zh'?'历史实际':'Historical',{'text-anchor':'middle','font-size':small?13:17});
  label(base,(boundary+right)/2,bottom+62,v.c.lang==='zh'?'预测情景':'Scenarios',{'text-anchor':'middle','font-size':small?13:17});
  const from=d.rows[d.growth.from].actual??d.rows[d.growth.from].scenarios[d.growth.scenario],to=d.rows[d.growth.to].actual??d.rows[d.growth.to].scenarios[d.growth.scenario],rate=((to/from)**(1/d.growth.years)-1)*100;
  const x1=left+(d.growth.from+.5)*pitch,x2=left+(d.growth.to+.5)*pitch;
  a.el('path',{d:`M${x1} ${top-12}v-30H${x2}v24m-4,-5l4,5l4,-5`,fill:'none',stroke:v.p.text},null,labels);
  label(labels,(x1+x2)/2,top-55,`${v.c.lang==='zh'?'年均增长':'CAGR'} ${MBB.number(rate,v.c.lang)}%`,{'text-anchor':'middle','font-size':small?15:20,'font-weight':700});
  d.scenarios.forEach((scenario,j)=>{
    const yy=small?bottom+110+j*32:y(d.rows.at(-1).scenarios[j])-10;
    if(!small)a.line(base,right,yy+5,right+15,yy+5,{class:'',stroke:colors[j]});
    else a.el('rect',{x:0,y:yy-12,width:13,height:13,fill:colors[j]},null,base);
    label(base,small?23:right+22,yy+5,name(scenario),{'font-size':small?14:16});
  });
});
