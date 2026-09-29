"use strict";
for (const type of ["petal-counts", "radial-share-intensity"])
  Core.install(
    type,
    (d, w) => Math.min(w, 660) + d.rows.length * 30 + 120,
    (v) => {
      const { a, d, w, p, base, group, label, mark } = v,
        r = Math.min(w / 2 - 28, 400),
        cx = w / 2,
        cy = r + 35,
        total = d.rows.reduce((s, r) => s + r.value, 0),
        max = Math.max(
          ...d.rows.map((row) =>
            type === "petal-counts" ? row.value : row.intensity,
          ),
        );
      let angle = -Math.PI / 2;
      const pt = (rad, t) => [cx + rad * Math.cos(t), cy + rad * Math.sin(t)];
      for (let k = 1; k <= 3; k++)
        a.el(
          "circle",
          {
            cx,
            cy,
            r: (r * k) / 3,
            fill: "none",
            stroke: p.grid,
            "stroke-width": 0.7,
          },
          null,
          base,
        );
      d.rows.forEach((row, i) => {
        const span =
            (type === "petal-counts" ? 1 / d.rows.length : row.value / total) *
            Math.PI *
            2,
          end = angle + span - 0.018,
          radius =
            type === "petal-counts"
              ? Math.sqrt(row.value / max) * r
              : (row.intensity / max) * r,
          g = group(),
          color = d.rows.length > 6 ? p.data : v.color(i);
        const petal =
          type === "petal-counts"
            ? `M${cx},${cy} Q${pt(radius * 0.8, angle)} ${pt(radius, (angle + end) / 2)} Q${pt(radius * 0.8, end)} ${cx},${cy} Z`
            : null;
        a.el(
          "path",
          {
            d:
              petal ||
              `M${cx},${cy} L${pt(radius, angle)} A${radius},${radius} 0 ${span > Math.PI ? 1 : 0} 1 ${pt(radius, end)} Z`,
            fill: color,
            stroke: p.background,
            "stroke-width": 2,
          },
          null,
          g,
        );
        const mid = (angle + end) / 2,
          q = pt(radius * 0.68, mid),
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
        if (d.rows.length > 6)
          label(g, q[0], q[1] + 4, String(i + 1), {
            "text-anchor": "middle",
            "font-size": 12,
            style: `fill:${MBB.ink(color)}`,
          });
        mark(
          g,
          target,
          `${v.name(row.name)}\n${row.value} ${v.unit}${row.intensity == null ? "" : `\n${v.zh ? "强度" : "Intensity"}: ${row.intensity}`}`,
          i,
          d.rows.length,
          { valueCount: row.intensity == null ? 1 : 2 },
        );
        angle += span;
      });
      d.rows.forEach((row, i) => {
        const ly = cy + r + 45 + i * 30,
          color = d.rows.length > 6 ? p.data : v.color(i);
        a.el(
          "rect",
          { x: 4, y: ly - 13, width: 13, height: 13, fill: color },
          null,
          base,
        );
        const detail =
          type === "petal-counts"
            ? `${row.value} ${v.unit}`
            : `${row.value}% · ${v.zh ? "强度" : "Intensity"} ${row.intensity}`;
        label(
          base,
          27,
          ly,
          `${d.rows.length > 6 ? `${i + 1}. ` : ""}${v.name(row.name)} · ${detail}`,
        );
      });
      label(
        base,
        4,
        cy + r + 78 + d.rows.length * 30,
        type === "petal-counts"
          ? v.zh
            ? "花瓣面积 ∝ 数量"
            : "Petal area ∝ count"
          : v.zh
            ? "角度＝份额；半径＝强度，面积不是份额"
            : "Angle = share; radius = intensity; area is not share",
        { "font-size": v.small ? 12 : 17 },
      );
    },
  );
Core.install(
  "launch-fan",
  (d, w) => (w < 720 ? 660 : 640),
  (v) => {
    const { a, d, w, p, base, group, label, mark } = v,
      r = (w - (v.small ? 65 : 115)) / 2,
      cx = w / 2,
      cy = r + 70;
    const min = Math.min(...d.rows.map((row) => row.born)),
      max = Math.max(...d.rows.map((row) => row.born)),
      size = Math.max(...d.rows.map((row) => row.value));
    for (let k = 1; k <= 3; k++)
      a.el(
        "path",
        {
          d: `M${cx - (r * k) / 3},${cy} A${(r * k) / 3},${(r * k) / 3} 0 0 1 ${cx + (r * k) / 3},${cy}`,
          fill: "none",
          stroke: p.grid,
          "stroke-width": 0.6,
        },
        null,
        base,
      );
    d.rows.forEach((row, i) => {
      const angle =
        Math.PI + (0.08 + (0.84 * (row.born - min)) / (max - min)) * Math.PI;
      const x = cx + r * Math.cos(angle),
        y = cy + r * Math.sin(angle),
        g = group(),
        rad = Math.sqrt(row.value / size) * (v.small ? 12 : 32);
      v.stroke(g, cx, cy, x, y, p.data, v.small ? 1.2 : 2);
      const dot = a.el(
        "circle",
        {
          cx: x,
          cy: y,
          r: rad,
          fill: row.value === size ? p.accent : p.data,
          stroke: p.background,
          "stroke-width": 2,
        },
        null,
        g,
      );
      mark(
        g,
        dot,
        `${v.name(row.name)}\n${v.name(d.periodLabel ?? "")}: ${row.born}\n${row.value} ${v.unit}`,
        i,
        d.rows.length,
        { valueCount: 2 },
      );
      if (!v.small) {
        const yy = y - rad - 14;
        label(base, x, yy, v.name(row.name), {
          "text-anchor": "middle",
          "font-size": 18,
          "font-weight": 600,
        });
        label(g, x, y + 6, String(row.value), {
          "text-anchor": "middle",
          "font-size": 18,
          style: `fill:${MBB.ink(row.value === size ? p.accent : p.data)}`,
        });
      }
      const cols = v.small ? 2 : 4,
        xx = ((i % cols) * w) / cols,
        yy = cy + 65 + Math.floor(i / cols) * 52;
      label(base, xx, yy, `${row.born} · ${v.name(row.name)}`, {
        "font-size": v.small ? 11 : 16,
      });
      label(base, xx, yy + 22, `${row.value} ${v.unit}`, {
        "font-size": v.small ? 11 : 16,
      });
    });
    label(
      base,
      cx,
      cy + 28,
      v.name(d.note ?? ""),
      { "text-anchor": "middle", "font-size": v.small ? 13 : 18 },
    );
  },
);
Core.install(
  "event-clock",
  (d, w) => Math.min(w, 760) + 130,
  (v) => {
    const { a, d, w, p, base, group, label, mark } = v,
      r = Math.min(w / 2 - 36, 325),
      cx = w / 2,
      cy = r + 40,
      max = Math.max(...d.rows.map((r) => r.value));
    MBB.ticks(0, max, 3).filter(q => q > 0).forEach(q => {
      a.el('circle', {cx,cy,r:r*q/max,fill:'none',stroke:p.grid,'stroke-width':.6}, null, base);
      label(base, cx+14, cy-r*q/max-5, MBB.number(q,v.c.lang), {
        'font-size':v.small?12:16, 'data-axis-tick':'radius'
      });
    });
    [0, 6, 12, 18].forEach((hour) => {
      const angle = (hour / 24) * Math.PI * 2 - Math.PI / 2;
      label(
        base,
        cx + (r + 20) * Math.cos(angle),
        cy + (r + 20) * Math.sin(angle) + 5,
        String(hour),
        { "text-anchor": "middle" },
      );
    });
    [...new Set(d.rows.map((row) => row.hour))].forEach((hour, i, hours) => {
      const events = d.rows.filter((row) => row.hour === hour),
        angle = (hour / 24) * Math.PI * 2 - Math.PI / 2,
        radius = (Math.max(...events.map((row) => row.value)) / max) * r;
      const ray = a.el(
        "path",
        {
          d: `M${cx},${cy} L${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`,
          fill: "none",
          stroke: "transparent",
          "stroke-width": 9,
          style: "pointer-events:stroke",
        },
        null,
        a.svg,
      );
      mark(
        ray,
        ray,
        `${hour}:00\n${events.map((row) => `${v.name(row.name)}: ${row.value} ${v.unit}`).join("\n")}`,
        i,
        hours.length,
        { kind: "ribbon", valueCount: events.length },
      );
    });
    d.rows.forEach((row, i) => {
      const angle = (row.hour / 24) * Math.PI * 2 - Math.PI / 2,
        radius = (row.value / max) * r,
        x = cx + radius * Math.cos(angle),
        y = cy + radius * Math.sin(angle),
        g = group();
      const path = a.el(
        "path",
        {
          d: `M${cx},${cy} L${x},${y}`,
          fill: "none",
          stroke: p.data,
          "stroke-opacity": 0.3,
          "stroke-width": 7,
        },
        null,
        base,
      );
      const dot = a.el(
        "circle",
        {
          cx: x,
          cy: y,
          r: 3.5,
          fill: p.data,
          stroke: "transparent",
          "stroke-width": 4,
        },
        null,
        g,
      );
      mark(
        g,
        dot,
        `${v.name(row.name)}\n${row.hour}:00\n${row.value} ${v.unit}`,
        i,
        d.rows.length,
        { valueCount: 2 },
      );
    });
    label(
      base,
      4,
      2 * r + 107,
      v.zh
        ? "半径＝规模；叠线越深＝事件越密集"
        : "Radius = magnitude; darker overlaps = denser events",
      { "font-size": v.small ? 12 : 17 },
    );
  },
);
Core.install(
  "stage-funnel",
  (d, w) => d.rows.length * 105 + 120,
  (v) => {
    const { a, d, w, p, base, group, label, mark } = v,
      max = d.rows[0].value,
      cx = w / 2,
      maxWidth = w - 55;
    d.rows.forEach((row, i) => {
      const width = (row.value / max) * maxWidth,
        y = 45 + i * 105,
        next = d.rows[i + 1],
        g = group();
      const rect = a.el(
        "rect",
        { x: cx - width / 2, y, width, height: 43, fill: p.data },
        null,
        g,
      );
      label(g, cx, y + 27, `${row.value} ${v.unit}`, {
        "text-anchor": "middle",
        style: `fill:${MBB.ink(p.data)}`,
      });
      mark(
        g,
        rect,
        `${v.name(row.name)}\n${row.value} ${v.unit}\n${v.zh ? "相对最大值" : "Relative to maximum"}: ${((row.value / max) * 100).toFixed(1)}%`,
        i,
        d.rows.length,
      );
      if (next) {
        const nw = (next.value / max) * maxWidth;
        a.el(
          "path",
          {
            d: `M${cx - width / 2},${y + 46} L${cx + width / 2},${y + 46} L${cx + nw / 2},${y + 102} L${cx - nw / 2},${y + 102} Z`,
            fill: p.data,
            "fill-opacity": 0.15,
          },
          null,
          base,
        );
      }
      label(base, 4, y + 75, `${i + 1}. ${v.name(row.name)}`, {
        "font-size": v.small ? 13 : 17,
      });
    });
  },
);
