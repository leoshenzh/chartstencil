'use strict';
// Each metric owns its scale and unit; column widths never encode a value.
Core.install('metric-grid', 900, v => {
  const {a, d, w, small, base, labels, name, label, group, mark, color} = v;
  const columns = small ? 1 : d.columns.length, pitch = w / columns, rowHeight = small ? pitch + 50 : 215;
  const count = d.metrics.reduce((n, metric) => n + metric.values.length, 0);
  let index = 0;
  d.columns.forEach((column, k) => {
    const left = small ? 0 : k * pitch, top = small ? k * (90 + d.metrics.length * rowHeight) : 0;
    MBB.wrapText(base, left + pitch / 2, top + 24, name(column), pitch - 16, {'text-anchor': 'middle', style: 'font-size:18px;font-weight:700'}, 23);
    d.metrics.forEach((metric, j) => {
      const datum = metric.values[k], value = datum == null ? null : typeof datum === 'number' ? datum : datum.value;
      const max = metric.max || Math.max(...metric.values.filter(x => x != null).map(x => typeof x === 'number' ? x : x.value));
      if (metric.kind !== 'number' && (value < 0 || value > max)) throw Error('Metric-grid values must be within their nonnegative scale.');
      const cx = left + pitch / 2, topY = top + 60 + j * rowHeight, bottom = topY + (small ? pitch - 10 : 160), side = Math.min(small ? pitch - 40 : 115, pitch - 40), fill = color(j), g = group();
      MBB.wrapText(base, cx, topY + 2, `${name(metric.name)} · ${name(metric.unit)}`, pitch - 16, {'text-anchor': 'middle', style: 'font-size:14px;font-weight:600'}, 19);
      let target;
      if (value == null || metric.kind === 'number') {
        target = a.el('rect', {x:cx-side/2,y:bottom-side,width:side,height:side,fill:'transparent'}, null, g);
        label(g,cx,bottom-side/2+7,value==null?(v.c.lang==='zh'?'未提供':'N/A'):MBB.number(value,v.c.lang),{'text-anchor':'middle','font-size':22,'font-weight':700});
      } else if (metric.kind === 'waffle') {
        const units = metric.units || 100, cols = 10, gap = 2, cell = (side - gap * (cols - 1)) / cols, active = Math.round(value / max * units);
        for (let n = 0; n < units; n++) a.el('rect', {x: cx - side / 2 + n % cols * (cell + gap), y: bottom - side + Math.floor(n / cols) * (cell + gap), width: cell, height: cell, fill: n < active ? fill : v.p.muted, 'fill-opacity': n < active ? 1 : .16}, null, g);
        target = g;
      } else if (metric.kind === 'circle') {
        target = a.el('circle', {cx, cy: bottom - side / 2, r: side / 2 * Math.sqrt(value / max), fill}, null, g);
      } else if (metric.kind === 'square') {
        const size = side * Math.sqrt(value / max), x = cx - side / 2, y = bottom - size;
        if (metric.frame) a.el('rect', {x, y: bottom - side, width: side, height: side, fill: v.p.muted, 'fill-opacity': .1, stroke: v.p.muted}, null, g);
        target = a.el('rect', {x, y, width: size, height: size, fill}, null, g);
        if (metric.previous && k) {
          const previous = typeof metric.values[k - 1] === 'number' ? metric.values[k - 1] : metric.values[k - 1].value, prior = side * Math.sqrt(previous / max);
          a.el('rect', {x, y: bottom - prior, width: prior, height: prior, fill: 'none', stroke: v.p.text, 'stroke-dasharray': '3 3'}, null, g);
        }
      } else {
        if (metric.frame) a.el('rect', {x: cx - side / 2, y: bottom - 58, width: side, height: 48, fill: 'none', stroke: v.p.muted}, null, g);
        target = a.el('rect', {x: cx - side / 2, y: bottom - 58, width: side * value / max, height: 48, fill}, null, g);
        if (metric.reference != null) {
          const xx = cx - side / 2 + side * metric.reference / max;
          a.line(g, xx, bottom - 72, xx, bottom - 3, {class: '', stroke: v.p.text, 'stroke-dasharray': '3 3'});
        }
      }
      if (value != null && metric.kind !== 'number') label(g, cx, bottom + 25, MBB.number(value, v.c.lang), {'text-anchor': 'middle', 'font-size': 22, 'font-weight': 700});
      mark(g, target, `${name(column)} · ${name(metric.name)}\n${value == null ? (v.c.lang==='zh'?'未提供':'Not provided') : `${MBB.number(value, v.c.lang)} ${name(metric.unit)}`}${metric.reference != null ? `\n${v.c.lang === 'zh' ? '参照值' : 'Reference'}: ${metric.reference}` : ''}`, index++, count);
      if (metric.arrow && !small && k < d.columns.length - 1) a.el('path', {d: `M${cx + side / 2 + 3} ${bottom - side / 2}h${pitch - side - 10}m-5,-4l5,4l-5,4`, fill: 'none', stroke: v.p.text}, null, labels);
    });
  });
});
