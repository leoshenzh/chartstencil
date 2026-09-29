'use strict';
MBBCharts.areaColors = theme => theme === 'dark'
    ? ['#d2e8ff', '#abd4ff', '#85c1ff', '#5eadff', '#389aff', '#1286ff']
    : ['#94bde5', '#699ed3', '#4080c0', '#2d6398', '#20476d', '#142c43'];
MBBCharts.templates['stacked-area'] = (a, c, {w, H, zh, small, base, labels}) => {
  const {svg, palette: p, el, text, line, mark, step} = a;
  const d = c.data, lang = zh ? 0 : 1, left = 42, right = small ? w - 30 : w * .72;
  const max = d.max || 100, unit = d.unit?.[lang] || '%', clipId = `area-reveal-${c.kind}`;
  const top = d.intervals || d.periodBracket ? 100 : 35, bottom = small ? 470 : 580;
  const positions = d.positions || d.dates.map((_, i) => i);
  const x = i => left + (positions[i] - positions[0]) / (positions.at(-1) - positions[0]) * (right - left), y = v => bottom - v / max * (bottom - top);
  const colors = d.nominal ? [...p.categories,p.muted,p.text] : MBBCharts.areaColors(c.theme);
  if(d.series.length>colors.length)throw Error('Split series into facets when colors run out.');
  for (const v of MBB.ticks(0, max)) {
    line(base, left, y(v), right, y(v));
    text(base, left - 9, y(v) + 4, `${v}`, {'text-anchor': 'end', class: 'small', 'data-axis-tick':'y'});
  }
  d.dates.forEach((date, i) => {
    const lines = (d.axisDates?.[i]?.[lang] ?? date[lang]).split('\n');
    lines.forEach((label, row) => text(base, x(i), bottom + 27 + row * 16, label,
      {'text-anchor': 'middle', class: 'small', 'font-size': small ? 11 : 14}));
  });
  (d.intervals || []).forEach(interval => {
    el('rect', {x: x(interval.from), y: top, width: x(interval.to) - x(interval.from), height: bottom - top, fill: p.muted, 'fill-opacity': .12}, null, base);
    el('path', {d: `M${x(interval.from)} ${top + 18}v-10H${x(interval.to)}v10`, fill: 'none', stroke: p.text}, null, labels);
    MBB.wrapText(labels, (x(interval.from) + x(interval.to)) / 2, top - 40, interval.name[lang], x(interval.to) - x(interval.from), {'text-anchor': 'middle', style: `font-size:${small ? 13 : 16}px`}, 19);
  });
  (d.eras || []).forEach(era => {
    [era.from, era.to].forEach(index => line(base, x(index), top, x(index), bottom, {'stroke-dasharray': '4 4', stroke: p.muted}));
    el('rect', {x: x(era.from) + 2, y: bottom + 50, width: x(era.to) - x(era.from) - 4, height: 27, fill: p.muted, 'fill-opacity': .2}, null, base);
    text(base, (x(era.from) + x(era.to)) / 2, bottom + 69, era.name[lang], {'text-anchor': 'middle', style: `font-size:${small ? 13 : 16}px`});
  });
  const defs = el('defs', {}, null, svg), clip = el('clipPath', {id: clipId}, null, defs);
  const reveal = el('rect', {x: left, y: top, width: right - left, height: bottom - top}, null, clip);
  const cumulative = Array(d.dates.length).fill(0);
  d.series.forEach((series, k) => {
    const lower = [...cumulative], upper = cumulative.map((v, i) => v + series.values[i]);
    upper.forEach((v, i) => { cumulative[i] = v; });
    const stepped = values => values.flatMap((v,i)=>i ? [[x(i),y(values[i-1])],[x(i),y(v)]] : [[x(i),y(v)]]);
    const path = d.stepped ? stepped(upper).map((v,i)=>`${i?'L':'M'}${v}`).join(' ')+' '+stepped(lower).reverse().map(v=>`L${v}`).join(' ')+' Z' : upper.map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join(' ') + ' ' + lower.map((v, i) => [x(i), y(v)]).reverse().map(v => `L${v}`).join(' ') + ' Z';
    const area = el('path', {d: path, fill: colors[k], stroke: p.text, 'stroke-width': .7, 'clip-path': `url(#${clipId})`}, null, svg);
    step(area, 1000, 4900, progress => reveal.setAttribute('width', progress * (right - left)));
    if (!d.hideLegend) {
    const lx = small ? 0 : right + 30, ly = (small ? 610 : 60) + k * (small ? 28 : 60);
    el('rect', {x: lx, y: ly - 14, width: 16, height: 16, fill: colors[k], stroke: p.text, 'stroke-width': .5}, null, base);
    text(base, lx + 26, ly, series.name[lang], {class: 'small'});
    if(d.cagrYears){
      const first=series.values[0],rate=first>0?((series.values.at(-1)/first)**(1/d.cagrYears)-1)*100:null;
      text(base,small?w-5:lx+26,small?ly:ly+24,`${zh?'年均增长':'CAGR'} ${rate==null?(zh?'无基数':'no baseline'):MBB.number(rate,c.lang)+'%'}`,{class:'small',...(small?{'text-anchor':'end'}:{})});
    }
    if(d.changeTable){
      const delta=series.values.at(-1)-series.values[d.changeFrom??0],percent=series.values[d.changeFrom??0]===0?null:delta/series.values[d.changeFrom??0]*100;
      text(base,small?w-5:lx+26,small?ly:ly+24,`${delta>0?'+':''}${MBB.number(delta,c.lang)} (${percent==null?(zh?'无基数':'no baseline'):MBB.number(percent,c.lang)+'%'})`,{class:'small',...(small?{'text-anchor':'end'}:{})});
    }
    if(d.endChanges)text(base, small?w-5:lx+26, small?ly:ly+24, `${d.endChanges[k]>0?'+':''}${d.endChanges[k]} ${d.changeUnit?.[lang] || ''}`, {class:'small',...(small?{'text-anchor':'end'}:{})});
    }
  });
  if (d.periodBracket) {
    const f=d.periodBracket.from,t=d.periodBracket.to,ratio=cumulative[t]/cumulative[f];
    el('path',{d:`M${x(f)} ${top-8}v-26H${x(t)}v20m-4,-5l4,5l4,-5`,fill:'none',stroke:p.text},null,labels);
    text(labels,(x(f)+x(t))/2,top-49,`${zh?'期末为期初':'End / start'} ${MBB.number(ratio,c.lang)}×`,{'text-anchor':'middle','font-weight':700,class:'small'});
  }
  if (d.overlay) {
    const path = d.overlay.values.map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join(' ');
    const curve = el('path', {d: path, fill: 'none', stroke: p.accent, 'stroke-width': 3, 'clip-path': `url(#${clipId})`}, null, svg);
    step(curve, 1000, 4900);
    const ly = (small ? 610 : 60) + d.series.length * (small ? 28 : 60);
    line(base, small ? 0 : right + 30, ly - 5, small ? 16 : right + 46, ly - 5, {class:'',stroke: p.accent, 'stroke-width': 3});
    text(base, small ? 26 : right + 56, ly, d.overlay.name[lang], {class: 'small'});
  }
  (d.insideLabels || []).forEach(point => {
    const i=point.index,k=point.series,value=d.series[k].values[i],lower=d.series.slice(0,k).reduce((sum,s)=>sum+s.values[i],0);
    const px=x(i),py=y(lower+value/2),tx=px+(point.dx||0),ty=py+(point.dy??(point.leader?0:5)),fill=point.leader?p.text:MBB.ink(colors[k]);
    if(point.leader)line(labels,px,py,tx,ty+6,{class:'',stroke:p.text});
    MBB.wrapText(labels,tx,ty,d.series[k].name[lang],small?100:170,{'text-anchor':'middle',style:`font-size:${small?12:16}px;fill:${fill}`},18);
  });
  (d.keypoints || []).forEach(point => {
    const value = point.series === 'total' ? cumulative[point.index] : d.series[point.series].values[point.index];
    const px = x(point.index), py = y(value), tx = px + (small ? point.dxSmall ?? point.dx ?? 0 : point.dx ?? 0), ty = py + (point.dy ?? -25);
    el('circle', {cx: px, cy: py, r: 4, fill: p.text}, null, labels);
    line(labels, px, py, tx, ty + 6, {class: '', stroke: p.muted});
    MBB.wrapText(labels, tx, ty, `${point.label[lang]} ${MBB.number(value, c.lang)}${unit}${point.extras?.map(j=>` · ${d.extras[j].name[lang]} ${MBB.number(d.extras[j].values[point.index],c.lang)}${d.extras[j].unit[lang]}`).join('')||''}`, small ? 125 : 180, {'text-anchor': point.anchor || 'middle', style: `font-size:${small ? 13 : 17}px;font-weight:700`}, 21);
  });
  d.dates.forEach((date, i) => {
    const x0 = i ? (x(i - 1) + x(i)) / 2 : left, x1 = i === d.dates.length - 1 ? right : (x(i) + x(i + 1)) / 2;
    const band = el('rect', {x: x0, y: top, width: x1 - x0, height: bottom - top, fill: 'transparent', style: 'pointer-events:fill'}, null, svg);
    mark(band, {label: `${date[lang]}\n${d.series.map(s => `${s.name[lang]}: ${s.values[i]}${unit}`).join('\n')}${d.overlay ? `\n${d.overlay.name[lang]}: ${d.overlay.values[i]}${unit}` : ''}${d.extras?.map(extra=>`\n${extra.name[lang]}: ${MBB.number(extra.values[i],c.lang)}${extra.unit[lang]}`).join('')||''}${d.samples ? `\nn=${d.samples[i].toLocaleString('en-US')}` : ''}`, valueCount: d.series.length + (d.overlay ? 1 : 0) + (d.extras?.length||0), crosshair: {x: x(i), y1: top, y2: bottom}}, 1000 + i * Math.min(750,5000/d.dates.length));
  });
};
