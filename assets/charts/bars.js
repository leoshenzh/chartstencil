'use strict';
MBBCharts.templates.bars = (a, c, {w, H, zh, small, base, labels}) => {
  const {svg, palette: p, el, text, line, mark, step} = a;
  const d = c.data, lang = zh ? 0 : 1, rowHeight = small ? 76 : 46;
  const left = small ? 0 : c.editorial ? (d.labelWidth || 90) : w * .41, right = w - 42, top = 62;
  const max = d.max || Math.ceil(Math.max(...d.rows.map(r => r.value)) / 10) * 10;
  const min = d.min ?? Math.min(0, Math.floor(Math.min(...d.rows.map(r => r.value)) / 10) * 10);
  const x = value => left + (value - min) / (max - min) * (right - left);
  const bottom = top + rowHeight * d.rows.length - 10;
  for (const [i, value] of MBB.ticks(min, max).entries()) {
    line(base, x(value), top - 17, x(value), bottom, {class: 'grid'});
    text(base, x(value), top - 30, MBB.number(value, c.lang), {'text-anchor': i === 0 && small ? 'start' : 'middle', class: 'small', 'data-axis-tick':'x'});
  }
  if (d.reference != null) {
    line(labels, x(d.reference), top - 18, x(d.reference), bottom + 23, {stroke: p.accent, 'stroke-dasharray': '5 4', 'stroke-width': 2});
    text(base, x(d.reference), bottom + 48, `${d.referenceLabel[lang]} ${d.reference}${d.unit[lang]}`, {'text-anchor': d.reference > max / 2 ? 'end' : 'start', class: 'small'});
  }
  if (min < 0) line(base, x(0), top - 20, x(0), bottom, {stroke: p.text, 'stroke-width': 2});
  d.rows.forEach((row, i) => {
    const y = top + i * rowHeight;
    const group = el('g', {}, null, svg), start = 900 + i * Math.min(350, 5600 / d.rows.length);
    const labelX = small ? 0 : left - 18;
    MBB.wrapText(group, labelX, y + 1, row.name[lang], small ? w - 5 : left - 26,
      {'text-anchor': small ? 'start' : 'end', class: 'small', 'font-weight': i === d.focus ? 700 : 400}, 18);
    const barY = y + (small ? 28 : -12);
    const color = d.groupNames ? p.categories[row.group % p.categories.length] : i === d.focus ? p.accent : p.data;
    if (d.track) el('rect', {x: x(0), y: barY, width: x(max) - x(0), height: 23, fill: 'none', stroke: p.muted, 'stroke-width': 1}, null, group);
    const bar = d.lollipop
      ? el('circle', {cx: x(row.value), cy: barY + 11, r: 6, fill: color}, null, group)
      : el('rect', {x: Math.min(x(0), x(row.value)), y: barY, width: Math.abs(x(row.value) - x(0)), height: 23, fill: color}, null, group);
    if (d.lollipop) line(group, x(0), barY + 11, x(row.value), barY + 11, {stroke: color, 'stroke-width': 3});
    if (row.projected) {
      const id = `projection-${i}`, defs = el('defs', {}, null, group), pattern = el('pattern', {id, width: 8, height: 8, patternUnits: 'userSpaceOnUse'}, null, defs);
      line(pattern, 0, 8, 8, 0, {stroke: p.background, 'stroke-width': 2});
      el('rect', {x: Math.min(x(0), x(row.value)), y: barY, width: Math.abs(x(row.value) - x(0)), height: 23, fill: `url(#${id})`, style: 'pointer-events:none'}, null, group);
    }
    mark(d.lollipop || d.track ? group : bar, {target: bar, label: `${row.name[lang]}\n${row.value}${d.unit[lang]}${d.track ? `\n${zh ? '轨道上限' : 'Track maximum'}: ${max}${d.unit[lang]}` : ''}${d.sample ? `\n${zh ? '样本' : 'Sample'}: ${d.sample}` : ''}`}, start);
    const valueText = text(group, d.valueColumn ? w - 2 : x(row.value) + (row.value < 0 ? -8 : 8), barY + 17, String(row.value), {'text-anchor': d.valueColumn || row.value < 0 ? 'end' : 'start', 'font-weight': 700, class: 'small'});
    if (d.groupNames) {
      const b=valueText.getBBox(), backing=el('rect',{x:b.x-2,y:b.y-1,width:b.width+4,height:b.height+2,fill:p.background},null,group);
      group.insertBefore(backing,valueText);
    }
    step(group, start, 500);
  });
  (d.groupNames || []).forEach((name, i) => {
    el('rect', {x: 0, y: bottom + 30 + i * 30, width: 14, height: 14, fill: p.categories[i]}, null, base);
    text(base, 24, bottom + 42 + i * 30, name[lang], {class: 'small'});
  });
  if (d.note) MBB.wrapText(labels, 0, H - 16, d.note[lang], w, {class: 'small'}, 18);
};
