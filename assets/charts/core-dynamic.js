"use strict";
for (const type of ["metric-carousel", "rank-race"])
  Core.install(
    type,
    (d, w) => 200 + d.rows.length * 75,
    (v) => {
      const { a, d, w, p, base, group, label, mark } = v,
        left = v.small ? 82 : 130,
        right = w - 48,
        max = Math.ceil(Math.max(...d.rows.flatMap((r) => r.values)) / 10) * 10,
        n = d.rows.length,
        periods = d.rows[0].values.length,
        period = label(base, 4, 32, "", { "font-weight": 700 }),
        items = [];
      d.rows.forEach((row, i) => {
        const g = group(),
          rect = a.el(
            "rect",
            {
              x: left,
              y: 0,
              width: 1,
              height: 30,
              fill: n <= 6 ? v.color(i) : p.data,
            },
            null,
            g,
          );
        label(g, left - 12, 21, v.name(row.name), {
          "text-anchor": "end",
          "font-size": v.small ? 12 : 18,
        });
        const value = label(g, left + 10, 21, "");
        a.mark(g, { target: rect, label: "" }, 900 + i * 100);
        items.push({ g, rect, value, record: a.records.at(-1), row });
      });
      const driver = group();
      a.step(driver, 0, 8000, (t) => {
        driver.style.opacity = 1;
        const position = Math.min(
            periods - 1,
            Math.max(0, (t * 8000 - 1800) / 5600) * (periods - 1),
          ),
          from = Math.floor(position),
          to = Math.min(periods - 1, from + 1),
          mix = Math.max(0, (position - from - 0.55) / 0.45);
        const values = d.rows.map(
            (row) => row.values[from] * (1 - mix) + row.values[to] * mix,
          ),
          rankAt = (k) =>
            d.rows
              .map((row, i) => ({ i, v: row.values[k] }))
              .sort((a, b) => b.v - a.v || a.i - b.i)
              .map((r) => r.i),
          fromRanks = rankAt(from),
          toRanks = rankAt(to);
        period.textContent =
          type === "metric-carousel"
            ? `${v.name(d.metrics[from])}${mix > 0 && to !== from ? ` → ${v.name(d.metrics[to])}` : ""}`
            : `${d.dates[from]}${mix > 0 && to !== from ? ` → ${d.dates[to]}` : ""}`;
        items.forEach((item, i) => {
          const y =
              85 +
              (type === "rank-race"
                ? fromRanks.indexOf(i) * (1 - mix) + toRanks.indexOf(i) * mix
                : i) *
                75,
            width = (values[i] / max) * (right - left),
            q = +values[i].toFixed(1);
          item.g.setAttribute("transform", `translate(0 ${y})`);
          item.rect.setAttribute("width", width);
          item.value.setAttribute("x", left + width + 8);
          item.value.textContent = Core.format(q, v.c.lang);
          item.record.label = `${v.name(item.row.name)}\n${period.textContent}\n${q} ${v.unit}${mix ? `\n${v.zh ? "过渡插值" : "Interpolated transition"}` : ""}`;
          item.record.label = Core.format(item.record.label, v.c.lang);
          item.g.setAttribute("aria-label", item.record.label);
        });
      });
      label(
        base,
        4,
        135 + n * 75,
        v.zh
          ? "重播查看变化；暂停可检查当前时刻"
          : "Replay changes; pause to inspect the current instant",
        { "font-size": v.small ? 12 : 17 },
      );
    },
  );
Core.install("rolling-window", 600, (v) => {
  const { a, d, w, p, base, group, label, mark } = v,
    axis = Core.axes(
      v,
      Math.max(10, Math.ceil(Math.max(...d.values) / 10) * 10),
    ),
    { x, y, left, right, top, bottom } = axis,
    n = d.window,
    count = d.values.length,
    g = group(),
    path = a.el(
      "path",
      { fill: "none", stroke: p.data, "stroke-width": 2.5 },
      null,
      g,
    ),
    period = label(base, 4, 545, ""),
    items = [];
  for (let i = 0; i < n; i++) {
    const xx = x(i, n),
      hot = a.el(
        "rect",
        {
          x: Math.max(left, xx - (right - left) / (n - 1) / 2),
          y: top,
          width: (right - left) / (n - 1),
          height: bottom - top,
          fill: "transparent",
          "pointer-events": "all",
        },
        null,
        a.svg,
      );
    a.mark(
      hot,
      { target: hot, label: "", crosshair: { x: xx, y1: top, y2: bottom } },
      950,
    );
    items.push({ hot, record: a.records.at(-1) });
  }
  a.step(g, 900, 400);
  const driver = group();
  a.step(driver, 0, 8000, (t) => {
    driver.style.opacity = 1;
    const end = Math.min(
        count,
        Math.floor(
          n + Math.min(1, Math.max(0, (t * 8000 - 1800) / 5600)) * (count - n),
        ),
      ),
      start = end - n,
      values = d.values.slice(start, end);
    path.setAttribute(
      "d",
      Core.path(values.map((value, i) => [x(i, n), y(value)])),
    );
    period.textContent = `${start * d.sampleSeconds}–${(end - 1) * d.sampleSeconds} ${v.zh ? "秒" : "seconds"} · ${v.zh ? "窗口" : "window"} ${d.windowSeconds}s`;
    items.forEach((item, i) => {
      item.record.label = `t=${(start + i) * d.sampleSeconds}s\n${values[i]} ${v.unit}`;
      item.record.label = Core.format(item.record.label, v.c.lang);
      item.hot.setAttribute("aria-label", item.record.label);
    });
  });
  a.appendSample = (value) => {
    if (!Number.isFinite(value)) throw Error("Sample must be finite");
    const next = { ...v.c, data: { ...d, values: [...d.values, value] } };
    MBBCharts.render(next).seek(8000);
  };
});
Core.install("cumulative-growth", 650, (v) => {
  const { a, d, w, p, base, group, label, mark } = v,
    max = Math.ceil(d.values.at(-1) / 10) * 10,
    { x, y, left, right, top, bottom } = Core.axes(v, max),
    n = d.values.length,
    g = group(),
    area = a.el("path", { fill: p.data, "fill-opacity": 0.45 }, null, g),
    path = a.el(
      "path",
      { fill: "none", stroke: p.data, "stroke-width": 2.5 },
      null,
      g,
    ),
    kpi = label(base, w - 10, 545, "", {
      "text-anchor": "end",
      "font-size": 46,
      "font-weight": 700,
    });
  d.values.forEach((value, i) => {
    const xx = x(i, n),
      hot = a.el(
        "rect",
        {
          x: Math.max(left, xx - (right - left) / (n - 1) / 2),
          y: top,
          width: (right - left) / (n - 1),
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
      `${v.zh ? "时期" : "Period"} ${i + 1}\n${value} ${v.unit}`,
      i,
      n,
      {
        crosshair: { x: xx, y1: top, y2: bottom },
      },
    );
  });
  a.step(g, 900, 5100, (t) => {
    g.style.opacity = t > 0 ? 1 : 0;
    const last = Math.floor(t * (n - 1));
    const points = d.values.slice(0, last + 1).map((q, i) => [x(i, n), y(q)]);
    path.setAttribute("d", Core.path(points));
    area.setAttribute(
      "d",
      `${Core.path(points)} L${x(last, n)},${bottom} L${left},${bottom} Z`,
    );
    kpi.textContent = `${d.values[last]} ${v.unit}`;
  });
  label(
    base,
    4,
    600,
    v.zh
      ? "大数与曲线使用同一累计序列"
      : "The number and line use the same cumulative series",
    { "font-size": v.small ? 12 : 17 },
  );
});
