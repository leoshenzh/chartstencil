'use strict';
MBBCharts.templates.waffle = (a, c, {w, H, zh, small, base, labels}) => {
  const {svg, palette: p, el, text, mark, step} = a;
  const lang = zh ? 0 : 1, cols = small ? 1 : 3, panelWidth = w / cols, panelHeight = 290;
  c.data.rows.forEach((row, i) => {
    const x = i % cols * panelWidth, y = Math.floor(i / cols) * panelHeight;
    const group = el('g', {}, null, svg);
    const color = row.focus ? p.accent : p.data;
    text(group, x + panelWidth / 2, y + 25, row.group[lang], {'text-anchor': 'middle', class: 'small', 'font-weight': 700, ...(c.editorial && small ? {style:'font-size:12px'} : {})});
    MBB.wrapText(group, x + panelWidth / 2, y + 53, row.name[lang], panelWidth - 22, {'text-anchor': 'middle'}, 19);
    text(group, x + panelWidth / 2, y + 100, `${row.value}%`, {'text-anchor': 'middle', class: 'serif'});
    const gap = 15, startX = x + (panelWidth - 9 * gap) / 2, startY = y + 132;
    const positions=Array.from({length:100},(_,j)=>({x:Math.sqrt((j+.5)/100)*70*Math.cos(j*2.39996323),y:Math.sqrt((j+.5)/100)*70*Math.sin(j*2.39996323)})).sort((a,b)=>b.y-a.y);
    for (let j = 0; j < 100; j++) el('circle', {cx: c.data.circle ? x+panelWidth/2+positions[j].x : startX + j % 10 * gap, cy: c.data.circle ? y+200+positions[j].y : startY + Math.floor(j / 10) * gap,
      r: 4.8, fill: j < row.value ? color : p.grid}, null, group);
    const hot = el('rect', {x: x + 5, y: y + 110, width: panelWidth - 10, height: 169, fill: 'transparent', style: 'pointer-events:all'}, null, group);
    mark(group, {target: hot, label: `${row.name[lang]}\n${row.group[lang]}\n${row.value}%\n${zh ? '每点代表 1 个百分点；未选择' : 'Each dot is 1 percentage point; not selected'}: ${100 - row.value}%`}, 900 + i * 500);
  });
};
