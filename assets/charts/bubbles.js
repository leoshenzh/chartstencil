'use strict';
MBBCharts.templates.bubbles = (a, c, layout) => {
  const {svg, palette: p, el, text, line, mark, step} = a;
  const {w, H, zh, small, cols, panelHeight, base, labels} = layout;
    const data = c.data, options=c.labels||{}, li=zh?0:1;
    const xDomain=options.xDomain||[0,1],yDomain=options.yDomain||[0,50],sizeMax=options.sizeMax||Math.max(...data.map(d=>d[4]));
    const left = small ? 77 : 200, right = small ? w - 30 : w * .68;
    const top = small ? 50 : 80, bottom = small ? 470 : 560;
    const px = v => left + (v-xDomain[0])/(xDomain[1]-xDomain[0]) * (right - left), py = v => bottom - (v-yDomain[0])/(yDomain[1]-yDomain[0]) * (bottom - top);
    const rm = small ? 31 : 65;
    const defs = el('defs', {}, null, svg);
    const arrow = el('marker', {id: 'arrow', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 5, markerHeight: 5, orient: 'auto-start-reverse'}, null, defs);
    el('path', {d: 'M0 0 L10 5 L0 10 Z', fill: p.muted}, null, arrow);
    for (const v of MBB.ticks(...yDomain,5)) {
      line(base, left, py(v), right, py(v));
      text(base, left - 9, py(v) + 4, String(v), {'text-anchor': 'end', class: 'small', 'data-axis-tick':'y'});
    }
    for (const v of MBB.ticks(...xDomain,5)) text(base, px(v), bottom + 68, v.toFixed(1), {'text-anchor': 'middle', class: 'small'});
    line(base, left - 37, bottom, left - 37, top, {class: 'axis', 'marker-start': 'url(#arrow)', 'marker-end': 'url(#arrow)'});
    text(base, left - 57, top + 45, zh ? '较高' : 'HIGHER', {class: 'small', transform: `rotate(-90 ${left - 57} ${top + 45})`});
    text(base, left - 57, bottom - 4, zh ? '较低' : 'LOWER', {class: 'small', transform: `rotate(-90 ${left - 57} ${bottom - 4})`});
    line(base, left, bottom + 115, right, bottom + 115, {class: 'axis', 'marker-start': 'url(#arrow)', 'marker-end': 'url(#arrow)'});
    text(base, left, bottom + 102, zh ? '较低' : 'LOWER', {class: 'small'});
    text(base, right, bottom + 102, zh ? '较高' : 'HIGHER', {class: 'small', 'text-anchor': 'end'});
    text(base, left, top - 20, (options.yLabel?.[li]||(zh?'指标 Y':'Metric Y')), {class: 'small'});
    text(base, (left + right) / 2, bottom + 137, (options.xLabel?.[li]||(zh?'指标 X':'Metric X')), {class: 'small', 'text-anchor': 'middle'});
    const lx = small ? w * .25 : w * .74;
    text(base, lx, small ? 647 : 588, (options.sizeLabel?.[li]||(zh?'规模':'Size')), {class: 'serif', style: `font-size:${small ? 23 : 27}px`});
    text(base, lx, small ? 674 : 616, (options.sizeUnit?.[li]||''), {class: 'small'});
    const legendX = small ? w * .55 : w * .82, legendY = small ? 800 : 752, lr = small ? 40 : 55;
    [sizeMax,sizeMax/2,sizeMax/4].forEach((v, i) => {
      const r = a.radius(v, sizeMax, lr), ly = small ? 712 + i * 18 : 646 + i * 23;
      el('circle', {cx: legendX, cy: legendY - r, r, fill: 'none', stroke: p.muted, 'stroke-width': 1}, null, base);
      el('path', {d: `M${legendX},${legendY - 2 * r} L${legendX + lr + 5},${ly - 4}`, fill: 'none', stroke: p.muted, 'stroke-width': 1}, null, base);
      text(base, legendX + lr + 8, ly, String(v), {class: 'small'});
    });
    const bubbles = el('g', {}, null, svg), annotations = el('g', {}, null, svg);
    data.forEach((d, i) => {
      const [cn, en, xv, yv, size] = d, x = px(xv), y = py(yv), r = a.radius(size, sizeMax, rm);
      const start = 1000 + i * 310;
      const bubble = el('circle', {cx: x, cy: y, r, fill: p.data, 'fill-opacity': .12, stroke: p.data, 'stroke-width': 2, 'stroke-dasharray': '5 4'}, null, bubbles);
      step(bubble, start, 450);
      const group = el('g', {}, null, annotations);
      const [ax, ay, anchor] = d[5]?.anchor || [xv + .08, yv + 4, 'start'];
      const mobileOffset = d[5]?.mobileOffset || [0, -r - 10];
      const tx = small ? x + mobileOffset[0] : px(ax);
      const ty = small ? y + mobileOffset[1] : py(ay);
      const dx = tx - x, dy = ty - y, distance = Math.hypot(dx, dy);
      const ex = x + dx / distance * Math.min(r, distance), ey = y + dy / distance * Math.min(r, distance);
      el('path', {d: `M${ex},${ey} L${tx},${ty - 5}`, fill: 'none', stroke: p.muted, 'stroke-width': 1}, null, group);
      const label = text(group, tx, ty, small ? String(i + 1) : zh ? cn : en, {
        'text-anchor': small ? 'middle' : anchor,
        class: 'sector-label', style: `font-size:${small ? 12 : 17}px`
      });
      if (!small && !zh && en.length > 23) {
        label.textContent = '';
        const words=en.split(' '), lines=[]; for(const word of words){if(!lines.length || (lines.at(-1)+' '+word).length>23)lines.push(word);else lines[lines.length-1]+=' '+word;}
        lines.forEach((s, n) => el('tspan', {x: tx, dy: n ? 19 : 0}, s, label));
      }
      // Both the bubble and its readable label are part of one focusable data element.
      el('circle', {cx: x, cy: y, r: Math.max(8, r), fill: 'transparent'}, null, group);
      mark(group, {
        label: `${zh ? cn : en}\n${(options.xLabel?.[li]||(zh?'指标 X':'Metric X'))}: ${xv}\n${(options.yLabel?.[li]||(zh?'指标 Y':'Metric Y'))}: ${yv} ${options.yUnit?.[li]||''}\n${(options.sizeLabel?.[li]||(zh?'规模':'Size'))}: ${size} ${(options.sizeUnit?.[li]||'')}\n${zh ? '数值来自输入数据' : 'Values from the input dataset'}`,
        target: label
      }, start);
    });
};
