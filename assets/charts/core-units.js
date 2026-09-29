"use strict";
for (const type of ["unit-bars", "unit-columns"])
  Core.install(
    type,
    (d, w) => (type === "unit-bars" ? d.rows.length * 76 + 100 : 660),
    (v) => {
      const { a, d, w, p, base, group, label, mark, name, unit } = v,
        horizontal = type === "unit-bars",
        max = Math.max(...d.rows.map((r) => r.value)),
        u = d.unitSize || 1;
      d.rows.forEach((r, i) => {
        const g = group(),
          n = Math.ceil(r.value / u),
          color = p.data;
        let target;
        for (let j = 0; j < n; j++) {
          const fraction = Math.min(1, r.value / u - j),
            gap = horizontal
              ? (w - 75) / Math.ceil(max / u)
              : Math.min(30, 370 / Math.ceil(max / u));
          target = a.el(
            "rect",
            horizontal
              ? {
                  x: 5 + j * gap,
                  y: 55 + i * 76,
                  width: (gap - 2) * fraction,
                  height: 22,
                  fill: color,
                }
              : {
                  x: 22 + (i * (w - 30)) / d.rows.length,
                  y: 440 - (j + 1) * gap,
                  width: Math.min(55, (w - 30) / d.rows.length - 14),
                  height: (gap - 2) * fraction,
                  fill: color,
                },
            null,
            g,
          );
        }
        if (horizontal) {
          label(base, 5, 44 + i * 76, name(r.name));
          label(base, w - 2, 72 + i * 76, String(r.value), {
            "text-anchor": "end",
          });
        } else {
          const columnWidth = (w - 30) / d.rows.length,
            barWidth = Math.min(55, columnWidth - 14);
          MBB.wrapText(
            base,
            22 + i * columnWidth + barWidth / 2,
            473,
            name(r.name),
            columnWidth - 4,
            {
              "text-anchor": "middle",
              style: `font-size:${v.small ? 11 : 16}px`,
            },
            18,
          );
          label(
            base,
            22 + (i * (w - 30)) / d.rows.length,
            422 - n * Math.min(30, 370 / Math.ceil(max / u)),
            String(r.value),
          );
        }
        mark(
          g,
          target,
          `${name(r.name)}\n${r.value} ${unit}\n${v.zh ? "每符号" : "Each symbol"}: ${u} ${unit}`,
          i,
          d.rows.length,
        );
      });
      label(
        base,
        5,
        horizontal ? d.rows.length * 76 + 65 : 540,
        `${v.zh ? "每格" : "Each cell"} = ${u} ${unit}`,
      );
    },
  );
Core.install(
  "unit-composition",
  (d, w) => Math.min(w - 20, 490) + d.rows.length * 30 + 100,
  (v) => {
    const { a, d, w, base, group, mark, color, name, unit } = v,
      gap = Math.min((w - 20) / 10, 78),
      size = gap * 0.7,
      total = d.rows.reduce((s, r) => s + r.value, 0);
    let index = 0;
    d.rows.forEach((r, i) => {
      const g = group();
      let target;
      for (let j = 0; j < r.value; j++, index++)
        target = a.el(
          d.shape === "circle" ? "circle" : "rect",
          d.shape === "circle"
            ? {
                cx: 10 + (index % 10) * gap + size / 2,
                cy: 25 + Math.floor(index / 10) * gap + size / 2,
                r: size / 2,
                fill: color(i),
              }
            : {
                x: 10 + (index % 10) * gap,
                y: 25 + Math.floor(index / 10) * gap,
                width: size,
                height: size,
                fill: color(i),
              },
          null,
          g,
        );
      mark(
        g,
        target,
        `${name(r.name)}\n${r.value}${unit}\n${v.zh ? "分母" : "Denominator"}: ${total}`,
        i,
        d.rows.length,
      );
    });
    Core.legend(v, d.rows, Math.ceil(total / 10) * gap + 65);
  },
);
Core.install(
  "grouped-dot-stacks",
  (d, w) => d.groups.length * 300 + 55,
  (v) => {
    const { a, d, w, group, label, base, mark, name, p } = v;
    d.groups.forEach((g, i) => {
      label(base, 4, 26 + i * 300, name(g.name), { "font-weight": 700 });
      g.values.forEach((value, j) => {
        const node = group(),
          x = ((j + 0.5) * w) / g.values.length,
          y = 250 + i * 300;
        let target;
        for (let k = 0; k < value; k++)
          target = a.el(
            "circle",
            { cx: x, cy: y - k * 23, r: v.small ? 7 : 10.5, fill: p.data },
            null,
            node,
          );
        label(base, x, y + 25, name(d.columns[j]), {
          "font-size": v.small ? 12 : 18,
          "text-anchor": "middle",
        });
        label(base, x, y - value * 23 - 8, String(value), {
          "text-anchor": "middle",
          "font-weight": 700,
        });
        mark(
          node,
          target,
          `${name(g.name)} · ${name(d.columns[j])}\n${value} ${v.unit}`,
          i * g.values.length + j,
          d.groups.length * g.values.length,
        );
      });
    });
  },
);
Core.install("single-progress", 420, (v) => {
  const { a, d, w, base, labels, p, group, label, mark } = v,
    y = 185;
  a.el(
    "rect",
    { x: 10, y, width: w - 20, height: 38, fill: "none", stroke: p.muted },
    null,
    base,
  );
  const g = group(),
    bar = a.el(
      "rect",
      { x: 10, y, width: ((w - 20) * d.value) / 100, height: 38, fill: p.data },
      null,
      g,
    );
  mark(g, bar, `${d.value}%\n${v.zh ? "目标" : "Target"}: 100%`, 0, 1);
  label(labels, w / 2, 130, `${d.value}%`, {
    "font-size": 54,
    "font-weight": 700,
    "text-anchor": "middle",
  });
  label(base, 10, y + 70, "0%");
  label(base, w - 10, y + 70, "100%", { "text-anchor": "end" });
});
Core.install(
  "ticked-donut",
  (d, w) => Math.min(w, 520) + 180,
  (v) => {
    const { a, d, w, base, group, label, mark, color, name } = v,
      r = Math.min(w / 2 - 25, 370),
      cx = w / 2,
      cy = r + 25,
      ri = r * 0.69;
    let ang = -Math.PI / 2;
    const pt = (rad, t) => [cx + rad * Math.cos(t), cy + rad * Math.sin(t)];
    d.rows.forEach((row, i) => {
      const end = ang + (row.value / 100) * Math.PI * 2,
        g = group(),
        mid = (ang + end) / 2;
      const path = a.el(
        "path",
        {
          d: `M${pt(r, ang)} A${r},${r} 0 ${end - ang > Math.PI ? 1 : 0} 1 ${pt(r, end)} L${pt(ri, end)} A${ri},${ri} 0 ${end - ang > Math.PI ? 1 : 0} 0 ${pt(ri, ang)} Z`,
          fill: color(i),
          stroke: v.p.background,
          "stroke-width": 2,
        },
        null,
        g,
      );
      const q = pt((r + ri) / 2, mid),
        target = a.el(
          "circle",
          {
            cx: q[0],
            cy: q[1],
            r: 2,
            fill: "transparent",
            "pointer-events": "none",
          },
          null,
          g,
        );
      mark(g, target, `${name(row.name)}\n${row.value}%`, i, d.rows.length);
      ang = end;
    });
    for (let i = 0; i < 10; i++) {
      const t = -Math.PI / 2 + (i * Math.PI) / 5,
        pt1 = pt(r + 4, t),
        pt2 = pt(r + 10, t);
      v.stroke(base, ...pt1, ...pt2, v.p.muted, 1);
    }
    label(base, cx, cy + 8, "100%", {
      "text-anchor": "middle",
      "font-size": 30,
    });
    Core.legend(v, d.rows, cy + r + 38);
  },
);
