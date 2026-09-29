'use strict';
MBBCharts.templates.venn = (a, c, {w, zh, small, base, labels}) => {
  const {svg, palette: p, el, text, mark} = a;
  const d = c.data, lang = zh ? 0 : 1, size = Math.min(w, 650), ox = (w - size) / 2;
  const circles = [[.35, .32], [.65, .32], [.5, .58]];
  const positions = {1: [.2, .27], 2: [.8, .27], 4: [.5, .75], 3: [.5, .2], 5: [.33, .54], 6: [.67, .54], 7: [.5, .41]};
  const money = v => MBB.number(v,c.lang)+' '+(d.unit?.[lang]||'');
  const defs = el('defs', {}, null, svg);
  circles.forEach(([x, y], i) => {
    const clip = el('clipPath', {id: `set-${i}`}, null, defs);
    el('circle', {cx: ox + x * size, cy: 20 + y * size, r: .29 * size}, null, clip);
  });
  d.rows.forEach((row, i) => {
    const group = el('g', {}, null, svg), mask = el('mask', {id: `region-${i}`, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: w, height: size + 50}, null, defs);
    el('rect', {width: w, height: size + 50, fill: 'white'}, null, mask);
    let parent = group;
    circles.forEach(([x, y], j) => {
      if (row.bits & 1 << j) parent = el('g', {'clip-path': `url(#set-${j})`}, null, parent);
      else el('circle', {cx: ox + x * size, cy: 20 + y * size, r: .29 * size, fill: 'black'}, null, mask);
    });
    const color = row.bits === 7 ? p.accent : p.categories[i % 5];
    el('rect', {width: w, height: size + 50, fill: color, mask: `url(#region-${i})`}, null, parent);
    const [px, py] = positions[row.bits], tx = ox + px * size, ty = 20 + py * size;
    text(group, tx, ty + 4, money(row.value), {'text-anchor': 'middle', class: 'small', 'font-weight': 700, style: `fill:${MBB.ink(color)}`});
    const target = el('circle', {cx: tx, cy: ty, r: 1, fill: 'transparent', 'pointer-events': 'none'}, null, group);
    mark(group, {target, label: `${row.name[lang]}\n${money(row.value)}`}, 1100 + i * 650);
    const y = size * .92 + 56 + i * (small ? 44 : 30);
    MBB.wrapText(base, 0, y, `${row.name[lang]} · ${money(row.value)}`, w, {class: 'small'}, 17);
  });
  circles.forEach(([x, y]) => el('circle', {cx: ox + x * size, cy: 20 + y * size, r: .29 * size, fill: 'none', stroke: p.text, 'stroke-width': 1, 'pointer-events': 'none'}, null, labels));
};
