'use strict';
MBBCharts.templates['panel-series'] = (a, c, {w, zh, small, base, labels}) => {
  const {svg, palette: p, el, text, line, mark, step} = a;
  const d = c.data, lang = zh ? 0 : 1, cols = small ? 1 : Math.min(3, d.panels.length), pw = w / cols, ph = 420 + (Math.max(...d.panels.map(p => p.series.length)) - 1) * 23;
  d.panels.forEach((panel, k) => {
    let panelWidth = pw, ox = k % cols * pw;
    if (!small && d.widths) {
      const weights = d.widths.slice(Math.floor(k / cols) * cols, Math.floor(k / cols) * cols + cols), sum = weights.reduce((s, v) => s + v, 0);
      panelWidth = w * weights[k % cols] / sum;
      ox = w * weights.slice(0, k % cols).reduce((s, v) => s + v, 0) / sum;
    }
    const oy = Math.floor(k / cols) * ph, dates = panel.dates || d.dates;
    const left = ox + 40, right = ox + panelWidth - 22, top = oy + 90, bottom = oy + 340;
    const max = d.max ?? Math.ceil(Math.max(...panel.series.flatMap(s => s.values)) / 5) * 5;
    const positions=panel.positions||d.positions||dates.map((_,i)=>i);
    const x = i => left + (positions[i]-positions[0]) / (positions.at(-1)-positions[0]) * (right - left), y = v => bottom - v / max * (bottom - top);
    MBB.wrapText(base, ox + panelWidth / 2, oy + 25, panel.name[lang], panelWidth - 24, {'text-anchor': 'middle', 'font-weight': 700}, 20);
    MBB.ticks(0, max, 4).forEach(v => {
      line(base, left, y(v), right, y(v));
      text(base, left - 7, y(v) + 4, MBB.number(v, c.lang), {'text-anchor': 'end', class: 'small', 'data-axis-tick':'y'});
    });
    const shownDates = MBB.categoryIndices(dates.length);
    const labelRoom = (right - left) / Math.max(1, shownDates.length - 1) - 6;
    shownDates.forEach(i => MBB.wrapText(base, x(i), bottom + 28, dates[i][lang], labelRoom,
      {'text-anchor': i === 0 ? 'start' : i === dates.length - 1 ? 'end' : 'middle', class:'small', 'data-category-tick':i}, 16));
    if (panel.event) {
      el('rect', {x: x(panel.event.from), y: top, width: x(panel.event.to) - x(panel.event.from), height: bottom - top, fill: p.grid, 'fill-opacity': .2}, null, base);
      text(base, (x(panel.event.from) + x(panel.event.to)) / 2, top - 17, panel.event.name[lang], {'text-anchor': 'middle', class: 'small'});
    }
    if (d.forecastFrom != null) {
      line(base, x(d.forecastFrom), top - 8, x(d.forecastFrom), bottom, {'stroke-dasharray': '4 4'});
      text(base, left + 4, top - 17, zh ? '预测／目标期 →' : 'Projection / target →', {class: 'small'});
    }
    (d.guides || []).forEach(guide => {
      line(base, x(guide.index), top, x(guide.index), bottom, {'stroke-dasharray': '3 4'});
      text(base, x(guide.index), bottom + 50, guide.name[lang], {'text-anchor': 'middle', class: 'small'});
    });
    if(panel.difference){
      const A=panel.series[0].values,B=panel.series[1].values;
      for(let i=1;i<A.length;i++){
        const d0=A[i-1]-B[i-1],d1=A[i]-B[i],cross=d0*d1<0?Math.abs(d0)/(Math.abs(d0)+Math.abs(d1)):null,parts=cross==null?[[0,1]]:[[0,cross],[cross,1]];
        for(const [u,v] of parts){
          const px=t=>x(i-1)+t*(x(i)-x(i-1)),va=t=>A[i-1]+t*(A[i]-A[i-1]),vb=t=>B[i-1]+t*(B[i]-B[i-1]);
          const area=el('polygon',{points:[[px(u),y(va(u))],[px(v),y(va(v))],[px(v),y(vb(v))],[px(u),y(vb(u))]].map(q=>q.join(',')).join(' '),fill:p.categories[va((u+v)/2)>vb((u+v)/2)?0:2],'fill-opacity':.25},null,svg);step(area,1000,2300);
        }
      }
    }
    if (panel.band) {
      const upper = panel.band.high.map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join(' ');
      const lower = panel.band.low.map((v, i) => [x(i), y(v)]).reverse().map(q => `L${q}`).join(' ');
      const band = el('path', {d: `${upper} ${lower} Z`, fill: p.data, 'fill-opacity': .3}, null, svg);
      step(band, 1000 + k * 500, 2200);
    }
    panel.series.forEach((series, j) => {
      const color = p.categories[j % 6], start = 1000 + k * 500;
      const path = series.values.map((v, i) => i ? (d.mode === 'step' ? `H${x(i)} V${y(v)}` : `L${x(i)},${y(v)}`) : `M${x(i)},${y(v)}`).join(' ');
      if (d.mode === 'baseline-area') {
        const defs = el('defs', {}, null, svg), id = `${c.kind}-baseline-${k}-${j}`, shape = `${path} L${right},${y(d.reference)} L${left},${y(d.reference)} Z`;
        for (const above of [true, false]) {
          const clip = el('clipPath', {id: id + above}, null, defs);
          el('rect', {x: left, y: above ? top : y(d.reference), width: right - left, height: above ? y(d.reference) - top : bottom - y(d.reference)}, null, clip);
          const area = el('path', {d: shape, fill: above ? p.data : p.categories[2], 'clip-path': `url(#${id + above})`}, null, svg);
          step(area, start, 2200);
        }
      }
      if (d.mode === 'area') {
        const area = el('path', {d: `${path} L${right},${bottom} L${left},${bottom} Z`, fill: color, 'fill-opacity': .25}, null, svg);
        step(area, start, 2800);
      }
      const curve = el('path', {d: path, fill: 'none', stroke: color, 'stroke-width': 2.5, ...(d.forecastFrom != null ? {'stroke-dasharray': '6 4'} : {})}, null, svg);
      if(d.forecastFrom!=null){
        const n=series.values.length-1,xx=x(n),yy=y(series.values[n]),angle=Math.atan2(yy-y(series.values[n-1]),xx-x(n-1));
        const head=el('path',{d:'M0 0 L-12 -5 L-12 5 Z',fill:color,transform:`translate(${xx},${yy}) rotate(${angle*180/Math.PI})`},null,svg);step(head,6000,450);
      }
      // Opacity reveal preserves a forecast dash pattern rather than replacing it.
      step(curve, start, 2200);
      if (panel.series.length > 1) {
        line(base, ox + 5, oy + 390 + j * 20, ox + 23, oy + 390 + j * 20, {class:'',stroke: color, 'stroke-width': 3});
        text(base, ox + 30, oy + 395 + j * 20, series.name[lang], {class: 'small'});
      }
      series.values.forEach((value, i) => {
        const dot = el('circle', {cx: x(i), cy: y(value), r: 4.5, fill: color}, null, svg);
        step(dot, start + i * 420, 450);
        if (panel.series.length === 1) {
          const label = text(svg, x(i), y(value) - 12, `${value}${d.unit[lang] === '×' ? '×' : ''}`, {'text-anchor': i === 0 ? 'start' : i === dates.length - 1 ? 'end' : 'middle', class: 'small', 'data-value-label':''});
          step(label, start + i * 420, 450);
        }
      });
    });
    dates.forEach((date, i) => {
      const x0 = i ? (x(i - 1) + x(i)) / 2 : left, x1 = i === dates.length - 1 ? right : (x(i) + x(i + 1)) / 2;
      const hot = el('rect', {x: x0, y: top, width: x1 - x0, height: bottom - top, fill: 'transparent'}, null, svg);
      mark(hot, {label: `${panel.name[lang]} · ${date[lang]}\n${panel.series.map(series => `${series.name[lang]}: ${series.values[i]} ${d.unit[lang]}`).join('\n')}${d.samples?`\nn=${d.samples[i].toLocaleString('en-US')}`:''}`, valueCount: panel.series.length, crosshair: {x: x(i), y1: top, y2: bottom}}, 1000 + k * 500 + i * 420);
    });
    if (d.reference != null) {
      const reference = el('g', {style: 'pointer-events:none'}, null, svg), rx = (left + right) / 2;
      line(reference, left, y(d.reference), right, y(d.reference), {stroke: p.text, 'stroke-dasharray': '4 3'});
      el('rect', {x: rx - 46, y: y(d.reference) - 25, width: 92, height: 21, fill: p.background}, null, reference);
      text(reference, rx, y(d.reference) - 9, d.referenceLabel[lang], {'text-anchor': 'middle', class: 'small'});
      step(reference, 6900, 450);
    }
    if (panel.gap) {
      const gapLayer=el('g',{},null,svg);step(gapLayer,6900,600);
      const values = panel.series.map(s => s.values.at(-1)), upper = y(Math.max(...values)), lower = y(Math.min(...values)), gx = right - 7;
      line(gapLayer, gx, upper, gx, lower, {stroke: p.accent, 'stroke-width': 2});
      line(gapLayer, gx - 5, upper, gx + 5, upper, {stroke: p.accent});
      line(gapLayer, gx - 5, lower, gx + 5, lower, {stroke: p.accent});
      text(gapLayer, gx - 12, (upper + lower) / 2, panel.gap[lang], {'text-anchor': 'end', class: 'small', 'font-weight': 700});
    }
    if (panel.note) MBB.wrapText(labels, ox, oy + 398, panel.note[lang], panelWidth - 18, {class: 'small'}, 17);
  });
};
