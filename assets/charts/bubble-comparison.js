'use strict';
MBBCharts.templates['bubble-comparison'] = (a, c, {w, zh, small, base, labels}) => {
  const {svg, palette: p, el, text, mark, step} = a;
  const d = c.data, lang = zh ? 0 : 1, cols = small ? 1 : d.rows.length;
  const cell = w / cols, max = Math.max(...d.rows.flatMap(r => r.values));
  const radius = v => Math.sqrt(v / max) * Math.min(130, cell / 2 - (d.arrow ? 40 : 24));
  d.rows.forEach((row, i) => {
    const cx = (i % cols + .5) * cell, top = Math.floor(i / cols) * 390;
    text(base, cx, top + 25, row.name[lang], {'text-anchor': 'middle', 'font-weight': 700});
    // Nested circles share a baseline and encode values by area.
    row.values.map((value, j) => ({value, j})).sort((x, y) => y.value - x.value).forEach(({value, j}, order) => {
      const r = radius(value), group = el('g', {}, null, svg);
      const circle = el('circle', {cx, cy: top + 300 - r, r, fill: p.categories[j], stroke: p.text, 'stroke-width': 1}, null, group);
      const hit = el('circle', {cx, cy: top + 300 - r * 1.8, r: 1, fill: 'transparent', 'pointer-events': 'none'}, null, group);
      mark(group, {target: hit, label: `${row.name[lang]}\n${d.series[j][lang]}: ${value}%`}, 1100 + i * 1300 + order * 450);
    });
    if(d.arrow){
      const R=radius(Math.max(...row.values)),g=el('g',{},null,svg),endX=cx+R*.5,endY=top+65;
      el('path',{d:`M${cx-R-15},${top+260} Q${cx-R-30},${top+80} ${endX},${endY}`,fill:'none',stroke:p.text,'stroke-width':1.5},null,g);
      el('path',{d:`M${endX},${endY}l-10,-4l1,9Z`,fill:p.text},null,g);step(g,6700,500);
    }
    row.values.forEach((v, j) => text(base, cx, top + 329 + j * 21, `${d.series[j][lang]} ${v}%`, {'text-anchor': 'middle', class: 'small'}));
    text(labels, cx, top + 375, `${zh ? '第二项 / 第一项' : 'Second / first'} ${(row.values[1] / row.values[0]).toFixed(1)}×`, {'text-anchor': 'middle', class: 'small', 'font-weight': 700});
  });
};
