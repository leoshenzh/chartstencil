"use strict";
Core.install("daily-ranges", 560, (v) => {
  const { a, d, w, base, group, label, mark, p } = v,
    { x, y, top, bottom } = Core.axes(
      v,
      Math.max(10, Math.ceil(Math.max(...d.rows.map((r) => r.high)) / 10) * 10),
      460,
      d.rows.some((r) => r.low < 0) ? 70 : 46,
      w - 18,
      45,
      Math.min(0, Math.floor(Math.min(...d.rows.map((r) => r.low)) / 10) * 10),
    );
  d.rows.forEach((r, i) => {
    const xx = x(i, d.rows.length),
      g = group();
    v.stroke(g, xx, y(r.low), xx, y(r.high), p.data, 6);
    for (const q of [r.low, r.high])
      v.stroke(g, xx - 5, y(q), xx + 5, y(q), p.data, 2);
    const hit = a.el(
      "rect",
      {
        x: xx - 7,
        y: y(r.high) - 3,
        width: 14,
        height: y(r.low) - y(r.high) + 6,
        fill: "transparent",
        "pointer-events": "all",
      },
      null,
      g,
    );
    mark(
      g,
      hit,
      `${d.dates[i]}\n${v.zh ? "最低" : "Minimum"}: ${r.low} ${v.unit}\n${v.zh ? "最高" : "Maximum"}: ${r.high} ${v.unit}`,
      i,
      d.rows.length,
      { valueCount: 2 },
    );
    if (
      i === 0 ||
      i === d.rows.length - 1 ||
      (v.small ? i === Math.floor(d.rows.length / 2) : i % 3 === 0)
    )
      label(base, xx, bottom + 30, d.dates[i], {
        "text-anchor":
          i === 0 ? "start" : i === d.rows.length - 1 ? "end" : "middle",
      });
  });
});
Core.install(
  "paired-series",
  (d, w) => 610 + d.series.length * 30,
  (v) => {
    const { a, d, base, labels, group, label, mark, color, name } = v,
      n = d.dates.length,
      max = Math.ceil(Math.max(...d.series.flatMap((s) => s.values)) / 10) * 10,
      { x, y, left, right, top, bottom } = Core.axes(v, max);
    d.series.forEach((s, j) => {
      const points = s.values.map((value, i) => [x(i, n), y(value)]),
        path = Core.path(points),
        g = group();
      if (d.area)
        a.el(
          "path",
          {
            d: `${path} L${right},${bottom} L${left},${bottom} Z`,
            fill: color(j),
            "fill-opacity": 0.24,
          },
          null,
          g,
        );
      a.el(
        "path",
        { d: path, fill: "none", stroke: color(j), "stroke-width": 2 },
        null,
        g,
      );
      const defs = a.el("defs", {}, null, g),
        clip = a.el("clipPath", { id: `series-clip-${j}` }, null, defs),
        rect = a.el(
          "rect",
          {
            x: left - 2,
            y: top - 8,
            width: right - left + 4,
            height: bottom - top + 16,
          },
          null,
          clip,
        );
      g.setAttribute("clip-path", `url(#series-clip-${j})`);
      a.step(g, 900, 5100, (t) =>
        rect.setAttribute("width", (right - left + 4) * t),
      );
    });
    d.dates.forEach((date, i) => {
      const xx = x(i, n),
        x0 = i ? (xx + x(i - 1, n)) / 2 : left - 5,
        x1 = i < n - 1 ? (xx + x(i + 1, n)) / 2 : right + 5;
      const hot = a.el(
        "rect",
        {
          x: x0,
          y: top,
          width: x1 - x0,
          height: bottom - top,
          fill: "transparent",
          "pointer-events": "all",
        },
        null,
        a.svg,
      );
      mark(
        hot,
        hot,
        `${date}\n${d.series.map((s) => `${name(s.name)}: ${s.values[i]} ${v.unit}`).join("\n")}`,
        i,
        n,
        {
          crosshair: { x: xx, y1: top, y2: bottom },
          valueCount: d.series.length,
        },
      );
      if (i === 0 || i === n - 1 || i === Math.floor(n / 2))
        label(base, xx, bottom + 30, date, {
          "text-anchor": i === 0 ? "start" : i === n - 1 ? "end" : "middle",
        });
    });
    Core.legend(
      v,
      d.series.map((s) => ({ ...s, value: s.values.at(-1) })),
      540,
    );
    if (d.note)
      MBB.wrapText(
        labels,
        0,
        590 + d.series.length * 30,
        name(d.note),
        v.w,
        { "font-size": v.small ? 14 : 18 },
        21,
      );
  },
);
Core.install("drop-scatter", 575, (v) => {
  const { a, d, base, group, mark, p, label, name } = v,
    xDomain = d.xDomain || [0, 100], yDomain = d.yDomain || [0, 100],
    { y, bottom, left, right } = Core.axes(v, yDomain[1], 460, 46, v.w - 18, 45, yDomain[0]),
    x = q => left + (q - xDomain[0]) / (xDomain[1] - xDomain[0]) * (right - left);
  d.rows.forEach((r, i) => {
    const xx = x(r.x),
      yy = y(r.y),
      g = group();
    v.stroke(g, xx, bottom, xx, yy, p.grid, 1);
    const point = a.el(
      "circle",
      {
        cx: xx,
        cy: yy,
        r: 6,
        fill: p.data,
        stroke: "transparent",
        "stroke-width": 6,
        "pointer-events": "all",
      },
      null,
      g,
    );
    mark(
      g,
      point,
      `${name(r.name)}\n${name(d.xLabel || "X")}: ${r.x} ${name(d.xUnit ?? "")}\n${name(d.yLabel || "Y")}: ${r.y} ${name(d.yUnit ?? "")}`,
      i,
      d.rows.length,
      {
        valueCount: 2,
      },
    );
  });
  label(base, left, 22, name(d.yLabel ?? ""));
  label(
    base,
    (left + right) / 2,
    bottom + 58,
    name(d.xLabel ?? ""),
    { "text-anchor": "middle" },
  );
  label(base, left, bottom + 30, String(xDomain[0]));
  label(base, right, bottom + 30, String(xDomain[1]), { "text-anchor": "end" });
});
Core.install("change-waterfall", 600, (v) => {
  const { a, d, w, group, label, base, mark, p } = v,
    { y, bottom, left, right } = Core.axes(v, 90),
    span = (right - left) / d.rows.length,
    bw = span * 0.62;
  let acc = 0;
  d.rows.forEach((r, i) => {
    const total = d.totalIndices.includes(i),
      start = total ? 0 : acc,
      end = total ? r.value : acc + r.value,
      x = left + i * span + span * 0.15,
      g = group();
    const bar = a.el(
      "rect",
      {
        x,
        y: y(Math.max(start, end)),
        width: bw,
        height: Math.abs(y(start) - y(end)),
        fill: total ? p.data : r.value < 0 ? p.accent : p.categories[4],
      },
      null,
      g,
    );
    label(
      g,
      x + bw / 2,
      y(Math.max(start, end)) - 12,
      `${!total && r.value > 0 ? "+" : ""}${r.value}`,
      { "text-anchor": "middle" },
    );
    mark(
      g,
      bar,
      `${v.name(r.name)}\n${total ? (v.zh ? "总量" : "Total") : v.zh ? "变化" : "Change"}: ${r.value} ${v.unit}\n${v.zh ? "累计" : "Running total"}: ${end}`,
      i,
      d.rows.length,
    );
    if (i < d.rows.length - 1)
      v.stroke(base, x + bw, y(end), x + span, y(end), p.muted, 1);
    MBB.wrapText(
      base,
      x + bw / 2,
      bottom + 28,
      v.name(r.name),
      span - 6,
      { "text-anchor": "middle", style: `font-size:${v.small ? 11 : 18}px` },
      20,
    );
    acc = end;
  });
});
Core.install(
  "beaded-change",
  (d, w) => 130 + d.rows.length * 90,
  (v) => {
    const { a, d, w, group, base, label, mark, p } = v,
      max = Math.max(...d.rows.flatMap((r) => r.values)),
      min = Math.min(...d.rows.flatMap((r) => r.values)) - 1,
      left = 38,
      right = w - 45,
      x = (q) => left + ((q - min) / (max - min)) * (right - left);
    d.rows.forEach((r, i) => {
      const yy = 70 + i * 90,
        g = group(),
        [before, after] = r.values;
      label(base, left, yy - 22, v.name(r.name));
      v.stroke(g, x(before), yy, x(after), yy, p.muted, 2);
      for (
        let q = Math.min(before, after) + d.unitSize / 2;
        q < Math.max(before, after);
        q += d.unitSize
      )
        a.el("circle", { cx: x(q), cy: yy, r: 3, fill: p.data }, null, g);
      a.el(
        "circle",
        {
          cx: x(before),
          cy: yy,
          r: 7,
          fill: p.background,
          stroke: p.data,
          "stroke-width": 2,
        },
        null,
        g,
      );
      const point = a.el(
        "circle",
        { cx: x(after), cy: yy, r: 7, fill: p.data },
        null,
        g,
      );
      label(base, x(before) - 12, yy + 5, String(before), {
        "text-anchor": "end",
      });
      label(base, x(after) + 12, yy + 5, String(after));
      mark(
        g,
        point,
        `${v.name(r.name)}\n${v.zh ? "此前" : "Before"}: ${before}\n${v.zh ? "现在" : "After"}: ${after}\n${v.zh ? "每颗小珠" : "Each small bead"} = ${d.unitSize} ${v.unit}`,
        i,
        d.rows.length,
        { valueCount: 2 },
      );
    });
    label(
      base,
      10,
      105 + d.rows.length * 90,
      `${v.zh ? "空心：此前；实心：现在" : "Hollow: before; solid: after"}`,
    );
  },
);
Core.install(
  "bipolar-comparison",
  (d, w) => 180 + d.rows.length * 90,
  (v) => {
    const { a, d, w, base, group, label, mark, p } = v,
      left = 20,
      right = w - 20,
      x = (q) => left + ((q + 100) / 200) * (right - left);
    label(base, left, 22, v.name(d.ends[0]));
    label(base, right, 22, v.name(d.ends[1]), { "text-anchor": "end" });
    label(base, left, 52, "−100");
    label(base, x(0), 52, "0", { "text-anchor": "middle" });
    label(base, right, 52, "100", { "text-anchor": "end" });
    d.rows.forEach((r, i) => {
      const yy = 125 + i * 110;
      label(base, 4, yy - 46, v.name(r.name));
      v.stroke(base, left, yy, right, yy, p.grid, 1);
      v.stroke(
        base,
        x(r.values[0]),
        yy,
        x(r.values[1]),
        yy,
        p.data,
        v.small ? 6 : 12,
      );
      r.values.forEach((q, j) => {
        const g = group(),
          yy1 = yy,
          point = a.el(
            j ? "rect" : "circle",
            j
              ? {
                  x: x(q) - (v.small ? 6 : 10),
                  y: yy1 - (v.small ? 6 : 10),
                  width: v.small ? 12 : 20,
                  height: v.small ? 12 : 20,
                  fill: v.color(j),
                }
              : { cx: x(q), cy: yy1, r: v.small ? 7 : 11, fill: v.color(j) },
            null,
            g,
          );
        label(g, x(q), yy1 + (j ? 32 : -20), String(q), {
          "text-anchor": "middle",
          "font-size": v.small ? 13 : 18,
          "font-weight": 600,
        });
        mark(
          g,
          point,
          `${v.name(r.name)}\n${v.name(d.series[j])}: ${q} ${v.unit}`,
          i * 2 + j,
          d.rows.length * 2,
        );
      });
    });
    d.series.forEach((s, j) =>
      label(
        base,
        4,
        125 + d.rows.length * 110 + j * 28,
        `${j ? "■" : "●"} ${v.name(s)}`,
      ),
    );
  },
);
Core.install("meaningful-bins", 600, (v) => {
  const { a, d, base, group, label, mark, p } = v,
    density = d.counts.map((q, i) => q / (d.edges[i + 1] - d.edges[i])),
    max = Math.ceil(Math.max(...density)),
    { y, left, right, bottom } = Core.axes(v, max),
    x = (q) => left + (q / d.edges.at(-1)) * (right - left);
  d.counts.forEach((count, i) => {
    const g = group(),
      bar = a.el(
        "rect",
        {
          x: x(d.edges[i]) + 1,
          y: y(density[i]),
          width: x(d.edges[i + 1]) - x(d.edges[i]) - 2,
          height: bottom - y(density[i]),
          fill: p.data,
        },
        null,
        g,
      );
    mark(
      g,
      bar,
      `${d.edges[i]}–${d.edges[i + 1]} ${v.name(d.binUnit ?? "")}\n${count} ${v.name(d.countUnit ?? "")}\n${v.zh ? "频数密度" : "Frequency density"}: ${density[i]}`,
      i,
      d.counts.length,
    );
    label(
      g,
      (x(d.edges[i]) + x(d.edges[i + 1])) / 2,
      y(density[i]) - 12,
      String(count),
      {
        "text-anchor": "middle",
      },
    );
  });
  d.edges.forEach((q) =>
    label(base, x(q), bottom + 30, String(q), { "text-anchor": "middle" }),
  );
  label(
    base,
    left,
    550,
    v.zh
      ? "柱面积＝频数；柱高＝频数密度"
      : "Area = count; height = frequency density",
    { "font-size": v.small ? 12 : 18 },
  );
});
Core.install(
  "group-boxes",
  (d, w) => d.rows.length * 105 + 150,
  (v) => {
    const { a, d, w, base, group, label, mark, p } = v,
      left = 20,
      right = w - 30,
      x = (q) => left + (q / 100) * (right - left);
    [0, 25, 50, 75, 100].forEach((q) =>
      label(base, x(q), 32, String(q), { "text-anchor": "middle" }),
    );
    d.rows.forEach((r, i) => {
      const yy = 90 + i * 105,
        g = group();
      label(base, left, yy - 27, v.name(r.name));
      v.stroke(g, x(r.min), yy, x(r.max), yy, p.data, 2);
      const box = a.el(
        "rect",
        {
          x: x(r.q1),
          y: yy - 14,
          width: x(r.q3) - x(r.q1),
          height: 28,
          fill: p.data,
          "fill-opacity": 0.35,
          stroke: p.data,
          "stroke-width": 2,
        },
        null,
        g,
      );
      [r.min, r.median, r.max].forEach((q) =>
        v.stroke(g, x(q), yy - 14, x(q), yy + 14, p.text, 2),
      );
      mark(
        g,
        box,
        `${v.name(r.name)}\nMin ${r.min}; Q1 ${r.q1}; Median ${r.median}; Q3 ${r.q3}; Max ${r.max} ${v.unit}`,
        i,
        d.rows.length,
        { valueCount: 5 },
      );
      r.outliers.forEach((q, j) => {
        const dot = a.el(
          "circle",
          { cx: x(q), cy: yy, r: 5, fill: p.accent },
          null,
          a.svg,
        );
        mark(
          dot,
          dot,
          `${v.name(r.name)}\n${v.zh ? "异常值" : "Outlier"}: ${q} ${v.unit}`,
          i,
          d.rows.length,
        );
      });
    });
  },
);
Core.install("ohlc-candles", 580, (v) => {
  const { a, d, base, group, label, mark, p } = v,
    { x, y, bottom } = Core.axes(
      v,
      Math.ceil(Math.max(...d.rows.map((r) => r.high)) / 10) * 10,
    ),
    bw = Math.min(32, ((v.w - 75) / d.rows.length) * 0.55);
  d.rows.forEach((r, i) => {
    const g = group(),
      xx = 46 + ((i + 0.5) / d.rows.length) * (v.w - 64),
      up = r.close >= r.open;
    v.stroke(g, xx, y(r.low), xx, y(r.high), p.data, 2);
    const body = a.el(
      "rect",
      {
        x: xx - bw / 2,
        y: y(Math.max(r.open, r.close)),
        width: bw,
        height: Math.max(1, Math.abs(y(r.open) - y(r.close))),
        fill: up ? p.background : p.data,
        stroke: p.data,
        "stroke-width": 2,
      },
      null,
      g,
    );
    mark(
      g,
      body,
      `${d.dates[i]}\nO ${r.open}; H ${r.high}; L ${r.low}; C ${r.close} ${v.unit}`,
      i,
      d.rows.length,
      { valueCount: 4 },
    );
    if (i % 3 === 0 || i === d.rows.length - 1)
      label(base, xx, bottom + 28, d.dates[i], { "text-anchor": "middle" });
  });
  label(
    base,
    5,
    540,
    v.zh
      ? "空心：收盘上涨；实心：收盘下跌"
      : "Hollow: close up; solid: close down",
    { "font-size": v.small ? 13 : 18 },
  );
});
