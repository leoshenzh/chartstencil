'use strict';
MBBCharts.templates.mekko = (a, c, {w, zh, small, base, labels}) => {
  const {svg, palette: p, el, text, line, mark} = a;
  const d = c.data, lang = zh ? 0 : 1, growth = d.mode === 'growth';
  const total = d.columns.reduce((s, col) => s + (growth ? col.width : col.values.reduce((s, v) => s + v, 0)), 0);
  const gap = d.connect ? (small ? 20 : 45) : 8, available = w - gap * (d.columns.length - 1);
  const top = 50, bottom = 550;
  const low = growth ? Math.min(0, ...d.columns.map(col => col.growth)) - 10 : 0;
  const high = growth ? Math.max(0, d.reference, ...d.columns.map(col => col.upperGrowth ?? col.growth)) * 1.1 : 100;
  const y = v => bottom - (v - low) / (high - low) * (bottom - top);
  if (d.connect && !growth) {
    let previous = null, offset = 0;
    d.columns.forEach((column, i) => {
      const sum = column.values.reduce((s, n) => s + n, 0), width = sum / total * available;
      const fractions = column.values.map(value => value / sum * 100);
      if (previous) {
        let before = 0, after = 0;
        fractions.forEach((value, j) => {
          const group = el('g', {}, null, svg);
          const path = el('path', {d: `M${previous.right} ${y(before)}L${offset} ${y(after)}L${offset} ${y(after + value)}L${previous.right} ${y(before + previous.fractions[j])}Z`, fill: p.categories[j % p.categories.length], 'fill-opacity': .25}, null, group);
          mark(group, {target: path, label: `${d.series[j][lang]}\n${d.columns[i - 1].name[lang]}: ${MBB.number(previous.fractions[j], c.lang)}%\n${column.name[lang]}: ${MBB.number(value, c.lang)}%`}, 1000 + i * 450 + j * 250);
          before += previous.fractions[j]; after += value;
        });
      }
      previous = {right: offset + width, fractions}; offset += width + gap;
    });
  }
  let x = 0;
  d.columns.forEach((column, i) => {
    const value = growth ? column.width : column.values.reduce((s, v) => s + v, 0), width = value / total * available;
    const values = growth ? [column.growth] : column.values;
    let cumulative = 0;
    values.forEach((v, j) => {
      const start = growth ? 0 : cumulative / value * 100;
      cumulative += v;
      const end = growth ? v : cumulative / value * 100, group = el('g', {}, null, svg), color = p.categories[(growth ? column.group ?? i : j) % 6];
      const rect = el('rect', {x, y: Math.min(y(start), y(end)), width, height: Math.abs(y(end) - y(start)), fill: color, stroke: p.background}, null, group);
      if (!growth && width > 45) {
        if (!d.shareOnly) text(group, x + width / 2, (y(start) + y(end)) / 2 - 3, String(v), {'text-anchor': 'middle', 'font-weight': 700, style: `fill:${MBB.ink(color)}`});
        text(group, x + width / 2, (y(start) + y(end)) / 2 + 20, column.shareRanges?.[j] ? `${column.shareRanges[j][0]}–${column.shareRanges[j][1]}%` : `${(v / value * 100).toFixed(1)}%`, {'text-anchor': 'middle', class: 'small', style: `fill:${MBB.ink(color)}`});
      }
      if(growth && column.upperGrowth!=null){
        el('rect',{x,y:y(column.upperGrowth),width,height:y(v)-y(column.upperGrowth),fill:'none',stroke:color,'stroke-width':1.5,'stroke-dasharray':'4 3'},null,group);
        const cy=y(column.upperGrowth)-25;
        line(labels,x+width/2,cy+7,x+width/2,y(column.upperGrowth)-4,{class:'',stroke:p.text});
        text(labels,x+width/2,cy,`${column.upperGrowth}%`,{'text-anchor':'middle',class:'small'});
      }
      const target = growth && v === 0 ? el('circle', {cx: x + width / 2, cy: y(0), r: 4, fill: p.background, stroke: color, 'stroke-width': 2}, null, group) : rect;
      mark(group, {target, label: growth ? `${column.name[lang]}\n${zh ? '基期规模' : 'Baseline'}: ${column.width} ${d.unit[lang]}\n${zh ? '累计变化' : 'Cumulative change'}: ${v.toFixed(1)}%${column.upperGrowth==null?'':`\n${zh?'含附加因素':'Including extra factor'}: ${column.upperGrowth}%`}` : `${column.name[lang]} · ${d.series[j][lang]}\n${v} ${d.unit[lang]}\n${zh ? '期内份额' : 'Within-period share'}: ${(v / value * 100).toFixed(1)}%\n${column.shareRanges?.[j] ? `份额区间 / Share range: ${column.shareRanges[j][0]}–${column.shareRanges[j][1]}%\n` : ''}${zh ? '期内总量' : 'Period total'}: ${Number(value.toFixed(2))} ${d.unit[lang]}`}, 1000 + i * Math.min(1100, 4800 / d.columns.length) + j * 450);
    });
    text(base, x + width / 2, 585, growth && small ? String(i + 1) : column.name[lang], {'text-anchor': 'middle', class: 'small', 'font-weight': 700});
    if (!growth) text(base, x + width / 2, 615, `${zh ? '总量' : 'Total'} ${Number(value.toFixed(2))}`, {'text-anchor': 'middle', class: 'small'});
    if (column.range) {
      const yy = 635;
      el('path', {d: `M${x} ${yy - 8}v8H${x + width}v-8`, fill: 'none', stroke: p.text}, null, base);
      text(base, x + width / 2, yy + 23, `${column.range[0]}–${column.range[1]}`, {'text-anchor': 'middle', class: 'small'});
    }
    x += width + gap;
  });
  if (growth) {
    line(base, 0, y(0), w, y(0), {stroke: p.text, 'stroke-width': 1.5});
    line(base, 0, y(d.reference), w, y(d.reference), {'stroke-dasharray': '6 4', stroke: p.text});
    text(labels, 0, 630, `${d.referenceName[lang]}: ${d.reference.toFixed(1)}%`, {'font-weight': 700, class: 'small'});
    (d.groupNames||[]).forEach((name,i)=>{el('rect',{x:0,y:670+d.columns.length*(small?44:28)+i*29,width:13,height:13,fill:p.categories[i]},null,base);text(base,23,681+d.columns.length*(small?44:28)+i*29,name[lang],{class:'small'});});
    d.columns.forEach((col, i) => MBB.wrapText(base, 0, 670 + i * (small ? 44 : 28), `${i + 1} · ${col.name[lang]} · ${col.width} ${d.unit[lang]} · ${col.growth > 0 ? '+' : ''}${col.growth.toFixed(1)}%`, w, {class: 'small'}, 17));
  } else {
    d.series.forEach((name, i) => {
      const extra = d.columns.some(column => column.range) ? 50 : 0;
      el('rect', {x: 0, y: 652 + extra + i * 30, width: 16, height: 16, fill: p.categories[i]}, null, base);
      text(base, 25, 665 + extra + i * 30, name[lang], {class: 'small'});
    });
  }
};
