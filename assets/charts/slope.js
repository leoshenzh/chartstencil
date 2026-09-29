'use strict';
MBBCharts.templates.slope = (a, c, {w, H, zh, small, base, labels}) => {
  const {svg, palette: p, el, text, line, mark, step} = a;
  const d = c.data, lang = zh ? 0 : 1, left = small ? 85 : 210, right = w - left;
  const unit = d.unit?.[lang] || "", deltaUnit = d.deltaUnit?.[lang] || (unit === "%" ? (zh ? "个百分点" : "percentage points") : unit);
  const top = 75, bottom = H - 85, max = d.max || Math.max(...d.rows.flatMap(r => r.values));
  const y = value => bottom - value / max * (bottom - top);
  line(base, left, top, left, bottom); line(base, right, top, right, bottom);
  text(base, left, 32, String(d.years[0]), {'text-anchor': 'middle', class: 'serif'});
  text(base, right, 32, String(d.years[1]), {'text-anchor': 'middle', class: 'serif'});
  const labelYs = [0, 1].map(j => {
    const ordered = d.rows.map((row, i) => ({i, y: y(row.values[j])})).sort((a, b) => a.y - b.y);
    ordered.forEach((entry, k) => { if (k) entry.y = Math.max(entry.y, ordered[k - 1].y + (small ? 18 : 23)); });
    const overflow = Math.max(0, ordered.at(-1).y - bottom);
    const positions = [];
    ordered.forEach(entry => { positions[entry.i] = entry.y - overflow; });
    return positions;
  });
  d.rows.forEach((row, i) => {
    const color = p.categories[i], group = el('g', {}, null, svg), start = 1200 + i * 850;
    const path = el('path', {d: `M${left} ${y(row.values[0])} L${right} ${y(row.values[1])}`, stroke: color, 'stroke-width': 4, fill: 'none'}, null, group);
    const delta = row.values[1] - row.values[0];
    mark(path, {kind: 'ribbon', label: `${row.name[lang]}\n${d.years[0]}: ${row.values[0]} ${unit}\n${d.years[1]}: ${row.values[1]} ${unit}\n${zh ? '变化' : 'Change'}: ${delta > 0 ? '+' : ''}${delta} ${deltaUnit}`}, start);
    row.values.forEach((value, j) => {
      const x = j ? right : left;
      el('circle', {cx: x, cy: y(value), r: 5, fill: color}, null, group);
      const ly = labelYs[j][i];
      if (Math.abs(ly - y(value)) > 1) line(group, x + (j ? 5 : -5), y(value), x + (j ? 10 : -10), ly, {stroke: p.muted, 'stroke-width': 1});
      text(group, x + (j ? 12 : -12), ly + 4, `${row.name[lang]} ${value}`, {'text-anchor': j ? 'start' : 'end', class: 'small'});
    });
    step(group, start, 500);
  });
};
