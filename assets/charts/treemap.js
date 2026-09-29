'use strict';
MBBCharts.templates.treemap = (a, c, {w, H, zh, small, base, labels}) => {
  const {svg, palette: p, el, text, mark, step} = a;
  const lang = zh ? 0 : 1, rows = c.data.rows, total = rows.reduce((sum, r) => sum + r.value, 0);
  const numbered = new Set(), side=w*.9/Math.sqrt(2);
  const point=(x,y)=>[w/2+(x-y)/Math.sqrt(2),60+w*.45+(x+y-side)/Math.sqrt(2)];
  const money = value => MBB.number(value,c.lang)+' '+(c.data.unit?.[lang]||'');
  text(base, 0, 32, `${zh ? '合计' : 'Total'} ${money(total)}`, {class: 'serif'});
  // Balanced binary partition preserves each rectangle's area, with no invented coordinates.
  function layout(items, x, y, width, height) {
    if (items.length === 1) {
      const row = items[0], i = rows.indexOf(row), color = row.role === 'muted' ? p.muted : p.categories[row.color ?? i % 6];
      const group = el('g', {}, null, svg);
      const cell = el(c.data.diamond?'polygon':'rect', {...(c.data.diamond?{points:[[x,y],[x+width,y],[x+width,y+height],[x,y+height]].map(q=>point(...q).join(',')).join(' ')}:{x,y,width,height}), fill: color, stroke: p.background, 'stroke-width': 2}, null, group);
      const ink = MBB.ink(color), tiny = c.data.diamond || width < 65 || height < 50, name = tiny ? String(i + 1) : small || width < 220 ? row.short[lang] : row.name[lang];
      if (tiny) numbered.add(i);
      const center=c.data.diamond?point(x+width/2,y+height/2):[x+width/2,y+height/2-14];
      MBB.wrapText(group, ...center, name, width - 16, {'text-anchor': 'middle', 'font-weight': 700, style: `fill:${ink}`}, 20);
      if (!c.data.diamond && width > 130 && height > 110) text(group, x + width / 2, y + height / 2 + 30, money(row.value), {'text-anchor': 'middle', class: 'small', style: `fill:${ink}`});
      mark(group, {target: cell, label: `${row.name[lang]}\n${money(row.value)}\n${zh ? '占合计' : 'Share of total'}: ${(row.value / total * 100).toFixed(1)}%`}, 1200 + i * 900);
      return;
    }
    const sum = items.reduce((s, r) => s + r.value, 0);
    let cut = 1, subtotal = items[0].value;
    while (cut < items.length - 1 && Math.abs(subtotal + items[cut].value - sum / 2) < Math.abs(subtotal - sum / 2)) subtotal += items[cut++].value;
    const share = subtotal / sum;
    if (width >= height) {
      layout(items.slice(0, cut), x, y, width * share, height);
      layout(items.slice(cut), x + width * share, y, width * (1 - share), height);
    } else {
      layout(items.slice(0, cut), x, y, width, height * share);
      layout(items.slice(cut), x, y + height * share, width, height * (1 - share));
    }
  }
  layout(rows, 0, c.data.diamond?0:60, c.data.diamond?side:w, c.data.diamond?side:small?530:560);
  rows.forEach((row, i) => MBB.wrapText(labels, small ? 0 : i % 2 * w / 2, (c.data.diamond?w*.9+110:small?632:660) + (small ? i : Math.floor(i / 2)) * 46, `${numbered.has(i) ? i + 1 : row.short[lang]} · ${row.name[lang]} · ${money(row.value)}`, small ? w : w / 2 - 16, {class: 'small'}, 17));
};
