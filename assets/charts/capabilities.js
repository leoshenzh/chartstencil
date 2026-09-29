'use strict';
MBBCharts.templates.capabilities = (a, c, {w, H, zh, small, base, labels}) => {
  const {svg, palette: p, el, text, line, mark, step} = a;
  const {rows, groups, techniques, threshold} = c.data;
  const left = small ? 8 : w * .30, right = small ? w - 8 : w * .80, rowHeight = small ? 69 : 38;
  const top = small ? 100 : 70, px = v => left + v / 100 * (right - left);
  const colors = [p.categories[0], p.categories[1], p.muted];
  techniques.forEach((name, i) => {
    const x = small ? 0 : w * .83, y = small ? 12 + i * 24 : 95 + i * 85;
    el('rect', {x, y: y - 10, width: 10, height: 10, fill: colors[i]}, null, base);
    const words = zh ? [name[0]] : name[1].split(' ');
    const t = text(base, x + 17, y, '', {class: 'small'});
    if (small || zh) t.textContent = name[zh ? 0 : 1];
    else words.forEach((s, j) => el('tspan', {x: x + 17, dy: j ? 18 : 0}, s, t));
  });
  rows.forEach((row, i) => {
    const y = top + i * rowHeight, groupStart = i === 0 || rows[i - 1].group !== row.group;
    if (groupStart) {
      line(base, 0, y - (small ? 35 : 19), small ? w : left, y - (small ? 35 : 19));
      MBB.wrapText(base, small ? 0 : 4, y - (small ? 20 : 4), groups[row.group][zh ? 0 : 1], small ? w : 130, {'font-weight': 700, class: small ? 'small' : 'group-label'}, 18);
    }
    const rowLabel = `${row.name[zh ? 0 : 1]}${(row.footnote==null?'':['⁰','¹','²','³','⁴','⁵','⁶','⁷','⁸','⁹'][row.footnote]||'')}`;
    text(base, small ? left : left - 9, y - (small ? 3 : 0), rowLabel, {'text-anchor': small ? 'start' : 'end', class: 'small'});
    let total = 0;
    row.values.forEach((value, j) => {
      if (!value) return;
      const bar = el('rect', {x: px(total), y: y + (small ? 5 : -13), width: value / 100 * (right - left), height: small ? 15 : 21, fill: colors[j]}, null, svg);
      mark(bar, {label: `${row.name[zh ? 0 : 1]} · ${techniques[j][zh ? 0 : 1]}\n${value}%\n${zh ? '数值来自输入数据；单位为百分比' : 'Values from the input dataset; percentage units'}`}, 900 + i * 330 + j * 120);
      total += value;
    });
  });
  const bottom = top + (rows.length - 1) * rowHeight + 35;
  line(labels, px(threshold), top - 25, px(threshold), bottom, {class: 'axis', 'stroke-dasharray': '4 4'});
  text(base, left, bottom + 28, (c.data.lowLabel?.[zh?0:1]||(zh?'低':'Low')), {class: 'small'});
  text(base, right, bottom + 28, (c.data.highLabel?.[zh?0:1]||(zh?'高':'High')), {class: 'small', 'text-anchor': 'end'});
  line(base, left, bottom + 40, right, bottom + 40, {class: 'axis'});
  el('path', {d: `M${right - 7},${bottom + 36} L${right},${bottom + 40} L${right - 7},${bottom + 44}`, fill: 'none', stroke: p.muted}, null, base);
};
