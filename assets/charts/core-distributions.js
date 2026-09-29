"use strict";
for (const type of ["record-strips", "record-beeswarm"])
  Core.install(
    type,
    (d, w) => d.groups.length * (type === "record-beeswarm" ? 260 : 220) + 100,
    (v) => {
      const { a, d, w, p, base, group, label, mark } = v,
        rowH = type === "record-beeswarm" ? 260 : 220,
        left = 20,
        right = w - 20,
        domain = Core.extent(
          d.groups.flatMap((g) => g.values),
          d.domain,
        ),
        x = (q) =>
          left + ((q - domain[0]) / (domain[1] - domain[0])) * (right - left),
        total = d.groups.reduce((s, g) => s + g.values.length, 0);
      let index = 0;
      d.groups.forEach((row, i) => {
        const mid = 110 + i * rowH + (type === "record-beeswarm" ? 20 : 0),
          placed = [];
        label(
          base,
          4,
          25 + i * rowH,
          `${v.name(row.name)} · n=${row.values.length}`,
          {
            "font-weight": 700,
          },
        );
        v.stroke(base, left, mid, right, mid, p.grid, 1);
        const items = row.values
          .map((value, j) => ({ value, j }))
          .sort((a, b) => a.value - b.value);
        items.forEach(({ value, j }) => {
          const xx = x(value),
            r = v.small ? 4.5 : 7,
            offsets =
              type === "record-beeswarm"
                ? Array.from(
                    { length: 75 },
                    (_, k) =>
                      Math.ceil(k / 2) * (k % 2 ? 1 : -1) * (v.small ? 10 : 15),
                  )
                : Array.from(
                    { length: 26 },
                    (_, k) => (((k + j * 7) % 26) - 12.5) * 6.5,
                  );
          const offset =
              offsets.find((off) =>
                placed.every(
                  (pt) =>
                    Math.hypot(xx - pt.x, mid + off - pt.y) >=
                    (v.small ? 10 : 15),
                ),
              ) ?? offsets.at(-1),
            yy = mid + offset;
          placed.push({ x: xx, y: yy });
          const point = a.el(
            "circle",
            {
              cx: xx,
              cy: yy,
              r,
              fill: p.data,
              stroke: "transparent",
              "stroke-width": 3.8,
              "pointer-events": "all",
            },
            null,
            a.svg,
          );
          mark(
            point,
            point,
            `${v.name(row.name)} · #${j + 1}\n${value} ${v.unit}`,
            index++,
            total,
          );
        });
        MBB.ticks(domain[0], domain[1], 4).forEach((q, j, ticks) =>
          label(base, x(q), rowH * (i + 1) - 5, MBB.number(q, v.c.lang), {
            "data-axis-tick": "x",
            "text-anchor": j === 0 ? "start" : j === ticks.length - 1 ? "end" : "middle",
          }),
        );
      });
      label(
        base,
        4,
        d.groups.length * rowH + 55,
        v.zh
          ? "每点一条记录；纵向排布只用于避让"
          : "One dot per record; vertical position only prevents overlap",
        { "font-size": v.small ? 12 : 17 },
      );
    },
  );
for (const type of ["group-violins", "density-ridges"])
  Core.install(
    type,
    (d, w) => d.groups.length * 190 + 105,
    (v) => {
      const { a, d, w, p, base, group, label, mark } = v,
        left = 20,
        right = w - 20,
        domain = Core.extent(
          d.groups.flatMap((g) => g.values),
          d.domain,
        ),
        binWidth = (domain[1] - domain[0]) / 10,
        x = (q) =>
          left + ((q - domain[0]) / (domain[1] - domain[0])) * (right - left),
        bins = d.groups.map((g) =>
          Array.from(
            { length: 10 },
            (_, j) =>
              g.values.filter(
                (q) =>
                  q >= domain[0] + j * binWidth &&
                  (j === 9
                    ? q <= domain[1]
                    : q < domain[0] + (j + 1) * binWidth),
              ).length,
          ),
        ),
        densities = bins.map((values, i) =>
          values.map((count) => count / d.groups[i].values.length / binWidth),
        ),
        max = Math.max(...densities.flat());
      d.groups.forEach((row, i) => {
        const g = group(),
          mid = 110 + i * 190,
          upper = [],
          lower = [];
        bins[i].forEach((count, j) => {
          const xx = x(domain[0] + (j + 0.5) * binWidth),
            amp = (densities[i][j] / max) * 55;
          upper.push([xx, mid - amp]);
          lower.push([xx, mid + (type === "group-violins" ? amp : 0)]);
        });
        const path =
          Core.path([[left, mid], ...upper, [right, mid], ...lower.reverse()]) +
          " Z";
        const area = a.el(
            "path",
            {
              d: path,
              fill: p.data,
              "fill-opacity": 0.35,
              stroke: p.data,
              "stroke-width": 2,
            },
            null,
            g,
          ),
          median = Core.median(row.values);
        v.stroke(g, x(median), mid - 58, x(median), mid + 58, p.accent, 2);
        const hot = a.el(
          "rect",
          {
            x: left,
            y: mid - 60,
            width: right - left,
            height: 120,
            fill: "transparent",
            "pointer-events": "all",
          },
          null,
          g,
        );
        mark(
          g,
          hot,
          `${v.name(row.name)}\nn=${row.values.length}; ${v.zh ? "中位数" : "Median"} ${median} ${v.unit}\n${v.zh ? `每${binWidth}单位分箱频数` : `${binWidth}-unit bin counts`}: ${bins[i].join(", ")}`,
          i,
          d.groups.length,
          { valueCount: 11 },
        );
        label(
          base,
          left,
          30 + i * 190,
          `${v.name(row.name)} · ${v.zh ? "中位数" : "Median"} ${median}`,
        );
        MBB.ticks(domain[0], domain[1], 4).forEach((q, j, ticks) =>
          label(base, x(q), 185 + i * 190, MBB.number(q, v.c.lang), {
            "data-axis-tick": "x",
            "text-anchor": j === 0 ? "start" : j === ticks.length - 1 ? "end" : "middle",
          }),
        );
      });
      MBB.wrapText(
        base,
        4,
        d.groups.length * 190 + 50,
        v.zh
          ? `密度以等宽 ${binWidth} 单位分箱估计，并按各组样本量归一化；连接分箱中心，共用尺度。`
          : `Density uses equal ${binWidth}-unit bins, normalized by group size, joining bin centres on one scale.`,
        w - 8,
        { "font-size": v.small ? 13 : 17 },
        20,
      );
    },
  );
Core.install(
  "daily-barcode",
  (d, w) => Math.ceil(d.values.length / 30) * 240 + 70,
  (v) => {
    const { a, d, w, p, base, group, label, mark } = v,
      left = 14,
      span = (w - 28) / 30,
      max = Math.max(...d.values);
    d.values.forEach((value, i) => {
      const panel = Math.floor(i / 30),
        x = left + ((i % 30) + 0.5) * span,
        bottom = 195 + panel * 240,
        y = bottom - (value / max) * 140,
        g = group();
      v.stroke(g, x, bottom, x, y, p.data, Math.max(1.2, span * 0.24));
      const dot = a.el(
        "circle",
        { cx: x, cy: y, r: Math.min(3, span * 0.28), fill: p.data },
        null,
        g,
      );
      const hit = a.el(
        "rect",
        {
          x: x - span * 0.43,
          y: y - 5,
          width: span * 0.86,
          height: bottom - y + 10,
          fill: "transparent",
          "pointer-events": "all",
        },
        null,
        g,
      );
      mark(g, hit, `${d.dates[i]}\n${value} ${v.unit}`, i, d.values.length);
      if (i % 30 === 0) {
        label(
          base,
          4,
          25 + panel * 240,
          `${d.dates[i]} → ${d.dates[Math.min(i + 29, d.values.length - 1)]}`,
        );
        label(base, 4, bottom + 30, "0");
        label(
          base,
          w - 4,
          bottom + 30,
          v.name(d.metricLabel ?? ""),
          {
            "text-anchor": "end",
          },
        );
      }
    });
  },
);
Core.install(
  "category-wave",
  (d, w) => Math.ceil(d.rows.length / (w < 720 ? 4 : 8)) * 230 + 80,
  (v) => {
    const { a, d, w, p, base, group, label, mark } = v,
      cols = v.small ? 4 : 8,
      span = (w - 20) / cols,
      max = Math.max(...d.rows.map((r) => r.value));
    d.rows.forEach((r, i) => {
      const panel = Math.floor(i / cols),
        xx = 10 + ((i % cols) + 0.5) * span,
        mid = 85 + panel * 230,
        end = mid + (((i % 2 ? 1 : -1) * r.value) / max) * 64,
        g = group();
      v.stroke(g, xx, mid, xx, end, p.data, Math.min(30, span * 0.4));
      const point = a.el(
        "circle",
        { cx: xx, cy: end, r: Math.min(15, span * 0.2), fill: p.data },
        null,
        g,
      );
      const hot = a.el(
        "rect",
        {
          x: xx - span * 0.42,
          y: Math.min(mid, end) - 5,
          width: span * 0.84,
          height: Math.abs(mid - end) + 10,
          fill: "transparent",
          "pointer-events": "all",
        },
        null,
        g,
      );
      mark(
        g,
        hot,
        `${v.name(r.name)}\n${r.value} ${v.unit}\n${v.zh ? "上下交错不表示正负" : "Alternating direction does not encode sign"}`,
        i,
        d.rows.length,
      );
      MBB.wrapText(
        base,
        xx,
        190 + panel * 230,
        v.name(r.name),
        span - 5,
        { "text-anchor": "middle", style: `font-size:${v.small ? 12 : 18}px` },
        22,
      );
    });
    label(
      base,
      4,
      Math.ceil(d.rows.length / cols) * 230 + 40,
      v.zh
        ? "上、下交错只为排版；长度均为正值"
        : "Alternation is layout only; every length is positive",
      { "font-size": v.small ? 12 : 17 },
    );
  },
);
