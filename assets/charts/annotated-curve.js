'use strict';
Core.install('annotated-curve', (d, w) => (w < 720 ? 700 : 740) + d.series.length * 35, v => {
  const {a, d, w, small, base, labels, name, label, color, group, mark, unit} = v;
  const left = 55, right = w - (small ? 50 : 100), top = 55, bottom = small ? 515 : 575;
  const x = n => left + (n - d.xDomain[0]) / (d.xDomain[1] - d.xDomain[0]) * (right - left);
  const y = n => bottom - (n - d.yDomain[0]) / (d.yDomain[1] - d.yDomain[0]) * (bottom - top);
  MBB.ticks(...d.yDomain).forEach(n => {
    a.line(base, left, y(n), right, y(n));
    label(base, left - 10, y(n) + 5, MBB.number(n, v.c.lang), {'text-anchor': 'end', 'data-axis-tick': 'y', 'font-size': small ? 13 : 16});
  });
  (d.xTicks || MBB.ticks(...d.xDomain)).forEach(n => label(base, x(n), bottom + 26, MBB.number(n, v.c.lang), {'text-anchor': 'middle', 'data-axis-tick': 'x', 'font-size': small ? 13 : 16}));
  label(base, left, 25, name(d.yLabel), {'font-weight': 700, 'font-size': small ? 14 : 18});
  label(base, (left + right) / 2, bottom + 60, name(d.xLabel), {'text-anchor': 'middle', 'font-weight': 700});
  (d.guides || []).forEach(guide => {
    a.line(base, x(guide.x), top, x(guide.x), bottom, {'stroke-dasharray': '4 4', stroke: a.palette.muted});
    label(base, x(guide.x), top - 8, name(guide.label), {'text-anchor': 'middle', 'font-size': small ? 13 : 16});
  });
  if (d.between) {
    const upper=d.series[d.between[0]].points,lower=d.series[d.between[1]].points;
    if (upper.length!==lower.length || upper.some((p,i)=>p.x!==lower[i].x || p.y<lower[i].y)) throw Error('Difference bands need matching x positions and ordered values.');
    const band=group();
    a.el('path',{d:upper.map((p,i)=>`${i?'L':'M'}${x(p.x)} ${y(p.y)}`).join(' ')+' '+[...lower].reverse().map(p=>`L${x(p.x)} ${y(p.y)}`).join(' ')+' Z',fill:color(d.between[1]),'fill-opacity':.13},null,band);
    a.step(band,950,600);
    const high=upper.at(-1).y,low=lower.at(-1).y,bx=right+16;
    if (high>0) {
      a.el('path',{d:`M${right+4} ${y(high)}H${bx}V${y(low)}H${right+4}`,fill:'none',stroke:v.p.text,'stroke-dasharray':'3 3'},null,labels);
      label(labels,small?right-8:bx+4,(y(high)+y(low))/2,`${MBB.number((high-low)/high*100,v.c.lang)}%`,{'font-size':small?13:16,'font-weight':700,...(small?{'text-anchor':'end'}:{})});
    }
  }
  const maximum = Math.max(...d.series.flatMap(s => s.points.map(pt => pt.size || 0)));
  const shared = new Map();
  const key = point => `${point.x}|${point.y}|${point.size||0}`;
  d.series.forEach(series=>series.points.forEach(point=>{
    const entries=shared.get(key(point))||[];entries.push({series,point});shared.set(key(point),entries);
  }));
  const records = shared.size;
  let index = 0;
  d.series.forEach((series, k) => {
    const lineGroup = group();
    a.el('path', {d: series.points.map((pt, i) => `${i ? 'L' : 'M'}${x(pt.x)} ${y(pt.y)}`).join(' '), fill: 'none', stroke: color(k), 'stroke-width': 2, 'pointer-events': 'none'}, null, lineGroup);
    a.step(lineGroup, 950, 600);
    series.points.forEach((pt, j) => {
      const peers=shared.get(key(pt));
      if(peers[0].point!==pt)return;
      const g = group(), radius = pt.size ? Math.sqrt(pt.size / maximum) * (small ? 32 : 52) : 5;
      const dot = a.el('circle', {cx: x(pt.x), cy: y(pt.y), r: radius, fill: pt.open ? a.palette.background : color(k), stroke: pt.open ? color(k) : a.palette.background, 'stroke-width': 1}, null, g);
      mark(g, dot, `${name(d.xLabel)}: ${pt.x}\n${peers.map(({series,point})=>`${name(series.name)}: ${point.y} ${unit}${point.name?' · '+name(point.name):''}`).join('\n')}`, index++, records, {valueCount: peers.length});
      if (pt.name || j === series.points.length - 1) {
        const tx = x(pt.x) + (small ? pt.dxSmall ?? pt.dx ?? 0 : pt.dx ?? 0);
        const ty = y(pt.y) + (small ? pt.dySmall ?? pt.dy ?? -18 : pt.dy ?? -18);
        const text = pt.name ? name(pt.name) : `${pt.y} ${unit}`;
        a.line(labels, x(pt.x), y(pt.y), tx, ty + 7, {stroke: a.palette.muted});
        MBB.wrapText(labels, tx, ty, text, small ? 110 : 165, {'text-anchor': pt.anchor || 'middle', style: `font-size:${small ? 13 : 16}px`}, 19);
      }
    });
    const ly = bottom + 108 + k * 35;
    a.line(base, 0, ly - 5, 22, ly - 5, {class: '', stroke: color(k), 'stroke-width': 3});
    label(base, 31, ly, name(series.name), {'font-size': small ? 14 : 17});
  });
  if (maximum) MBB.wrapText(base, 0, bottom + 128 + d.series.length * 35, name(d.sizeLabel), w, {style: 'font-size:14px'}, 20);
});
