"use strict";
for (const type of [
  "numeric-matrix",
  "arc-matrix",
  "weekly-heatmap",
  "weekly-dots",
])
  Core.install(
    type,
    (d, w) => 150 + d.y.length * (type === "weekly-dots" ? 95 : 65),
    (v) => {
      const { a, d, w, base, group, label, mark, name, p } = v,
        left = v.small ? (v.zh ? 44 : 70) : 105,
        cw = (w - left - 5) / d.x.length,
        rh = type === "weekly-dots" ? 95 : 65,
        top = 65,
        max = Math.max(...d.cells.map((c) => c.value));
      d.x.forEach((n, i) =>
        label(
          base,
          left + (i + 0.5) * cw,
          v.small && !v.zh ? (i % 2 ? 27 : 48) : 29,
          name(n),
          {
            "text-anchor": "middle",
            "font-size": v.small ? 11 : 17,
          },
        ),
      );
      d.y.forEach((n, i) =>
        label(base, left - 10, top + i * rh + rh / 2, name(n), {
          "text-anchor": "end",
          "font-size": v.small ? 12 : 18,
        }),
      );
      d.cells.forEach((cell, i) => {
        const g = group(),
          x = left + cell.x * cw,
          y = top + cell.y * rh,
          value = cell.value;
        const hot = a.el(
          "rect",
          {
            x: x + 2,
            y: y + 2,
            width: cw - 4,
            height: rh - 5,
            fill:
              type === "weekly-heatmap" || type === "numeric-matrix"
                ? p.data
                : "transparent",
            "fill-opacity":
              type === "weekly-heatmap" || type === "numeric-matrix"
                ? 0.2 + (0.8 * value) / max
                : 1,
            stroke: d.highlight && value === max ? p.accent : p.grid,
            "stroke-width": d.highlight && value === max ? 3 : 0.5,
            "pointer-events": "all",
          },
          null,
          g,
        );
        if (type === "arc-matrix") {
          const radius = Math.min(cw * 0.34, 16),
            angle = (value / max) * Math.PI * 1.7,
            xx = x + cw / 2,
            yy = y + rh * 0.36;
          a.el(
            "path",
            {
              d: `M${xx},${yy - radius} A${radius},${radius} 0 ${angle > Math.PI ? 1 : 0} 1 ${xx + Math.sin(angle) * radius},${yy - Math.cos(angle) * radius}`,
              fill: "none",
              stroke: p.data,
              "stroke-width": 4,
            },
            null,
            g,
          );
          label(g, xx, y + rh - 10, String(value), {
            "text-anchor": "middle",
            "font-size": 12,
          });
        } else if (type === "weekly-dots") {
          const gap = v.small ? 7 : 16,
            cols = Math.max(2, Math.floor((cw - 10) / gap));
          for (let j = 0; j < value; j++)
            a.el(
              "circle",
              {
                cx: x + 7 + (j % cols) * gap,
                cy: y + 10 + Math.floor(j / cols) * gap,
                r: v.small ? 2.2 : 4.5,
                fill: p.data,
              },
              null,
              g,
            );
        } else {
          // Opaque label backing avoids text contrast changing with the heat value.
          a.el(
            "rect",
            {
              x: x + cw / 2 - 12,
              y: y + rh / 2 - 12,
              width: 24,
              height: 23,
              fill: p.background,
            },
            null,
            g,
          );
          label(g, x + cw / 2, y + rh / 2 + 5, String(value), {
            "text-anchor": "middle",
            "font-size": v.small ? 12 : 17,
          });
        }
        mark(
          g,
          hot,
          `${name(d.y[cell.y])} · ${name(d.x[cell.x])}\n${value} ${v.unit}`,
          i,
          d.cells.length,
        );
      });
      label(
        base,
        4,
        top + d.y.length * rh + 37,
        type === "arc-matrix"
          ? v.zh
            ? "弧长越大＝数值越大；标签为输入数值"
            : "Longer arcs mean higher values; labels show input values"
          : type === "weekly-dots"
            ? v.zh
              ? `每点＝1 ${v.unit}`
              : `Each dot = 1 ${v.unit}`
            : v.zh
              ? "颜色由浅到深＝数值从低到高"
              : "Lighter to darker color = lower to higher value",
        { "font-size": v.small ? 12 : 18 },
      );
    },
  );
Core.install(
  "annual-calendar",
  (d, w) => (w < 720 ? 1070 : 440),
  (v) => {
    const { a, d, w, base, group, label, mark, p } = v,
      small = v.small;
    const columns = small ? 14 : 53,
      left = small ? 36 : 56,
      cw = (w - left - 2) / columns;
    const rh = small ? 23 : 36,
      blockH = small ? 245 : 350,
      blocks = small ? 4 : 1,
      top = 50;
    const start = (new Date(Date.UTC(d.year, 0, 1)).getUTCDay() + 6) % 7;
    const max = Math.max(...d.values),
      weekdays = v.zh
        ? ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
        : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    for (let block = 0; block < blocks; block++) {
      weekdays.forEach((name, j) =>
        label(base, left - 9, top + block * blockH + j * rh + rh * 0.68, name, {
          "text-anchor": "end",
          "font-size": small ? 12 : 18,
        }),
      );
    }
    for (let month = 0; month < 12; month++) {
      const day =
        Math.round(
          (Date.UTC(d.year, month, 1) - Date.UTC(d.year, 0, 1)) / 86400000,
        ) + start;
      const week = Math.floor(day / 7),
        block = Math.floor(week / columns),
        x = left + (week % columns) * cw;
      label(
        base,
        x,
        top - 18 + block * blockH,
        v.zh
          ? `${month + 1}月`
          : new Date(Date.UTC(d.year, month, 1)).toLocaleString("en-US", {
              month: "short",
              timeZone: "UTC",
            }),
        { "font-size": small ? 12 : 18 },
      );
      if (month)
        v.stroke(
          base,
          x - 2,
          top + block * blockH - 4,
          x - 2,
          top + block * blockH + 7 * rh,
          p.muted,
          0.6,
        );
    }
    d.values.forEach((value, i) => {
      const day = i + start,
        week = Math.floor(day / 7),
        block = Math.floor(week / columns),
        g = group();
      const cell = a.el(
        "rect",
        {
          x: left + (week % columns) * cw,
          y: top + block * blockH + (day % 7) * rh,
          width: cw - 2,
          height: rh - 2,
          fill: p.data,
          "fill-opacity": 0.15 + (0.85 * value) / max,
        },
        null,
        g,
      );
      const date = new Date(Date.UTC(d.year, 0, i + 1))
        .toISOString()
        .slice(0, 10);
      mark(g, cell, `${date}\n${value} ${v.unit}`, i, d.values.length);
    });
    const ly = small ? 4 * blockH + 25 : 365,
      sw = small ? 25 : 38;
    label(base, 0, ly, v.name(d.metricLabel ?? ""), {
      "font-size": small ? 13 : 18,
    });
    for (let i = 0; i < 5; i++)
      a.el(
        "rect",
        {
          x: (small ? 90 : 130) + i * sw,
          y: ly - 18,
          width: sw - 3,
          height: 21,
          fill: p.data,
          "fill-opacity": 0.15 + (0.85 * i) / 4,
        },
        null,
        base,
      );
    label(base, small ? 90 : 130, ly + 25, "0", {
      "font-size": small ? 12 : 16,
    });
    label(base, (small ? 90 : 130) + 5 * sw - 3, ly + 25, String(max), {
      "text-anchor": "end",
      "font-size": small ? 12 : 16,
    });
  },
);
Core.install(
  "status-yearbook",
  (d, w) => d.rows.length * (w < 720 ? 220 : 190) + 100,
  (v) => {
    const { a, d, w, base, group, label, mark, p } = v,
      rowH = v.small ? 220 : 190,
      cw = (w - 12) / d.years.length,
      status = d.statusLabels || [["状态 1", "State 1"], ["状态 2", "State 2"], ["状态 3", "State 3"]];
    d.rows.forEach((r, i) => {
      const top = 35 + i * rowH;
      label(base, 4, top, v.name(r.name), { "font-weight": 700 });
      r.values.forEach((q, j) => {
        const g = group(),
          x = 4 + j * cw,
          y = top + 30,
          radius = Math.sqrt(q.value / 20) * Math.min(cw * 0.34, 20);
        const dot = a.el(
          "circle",
          { cx: x + cw / 2, cy: y + 25, r: radius, fill: p.data },
          null,
          g,
        );
        label(base, x + cw / 2, top + 23, String(q.value), {
          "text-anchor": "middle",
          "font-size": v.small ? 12 : 16,
        });
        label(g, x + cw / 2, y + 65, ["●", "○", "×"][q.status], {
          "text-anchor": "middle",
          "font-size": 14,
        });
        if (j % 2 === 0)
          label(base, x + cw / 2, y + 90, d.years[j].slice(2), {
            "text-anchor": "middle",
            "font-size": 12,
          });
        mark(
          g,
          dot,
          `${v.name(r.name)} · ${d.years[j]}\n${q.value} ${v.unit}\n${v.name(status[q.status])}`,
          i * d.years.length + j,
          d.rows.length * d.years.length,
        );
      });
      MBB.wrapText(
        base,
        4,
        top + (v.small ? 165 : 158),
        v.name(r.note),
        w - 8,
        { "font-size": v.small ? 13 : 16 },
        19,
      );
    });
    label(
      base,
      4,
      d.rows.length * rowH + 65,
      status.map((s, i) => ["●", "○", "×"][i] + " " + v.name(s)).join("   "),
      { "font-size": v.small ? 13 : 17 },
    );
  },
);
Core.install(
  "lifecycle-history",
  (d, w) => d.rows.length * 90 + 150,
  (v) => {
    const { a, d, w, base, group, label, mark, p } = v,
      left = 25,
      right = w - 20,
      x = (i) => left + (i / (d.years.length - 1)) * (right - left),
      states = d.stateLabels || [["状态 1", "State 1"], ["状态 2", "State 2"], ["状态 3", "State 3"], ["状态 4", "State 4"]];
    d.years.forEach((date, i) =>
      label(base, x(i), 25, date.slice(2), { "text-anchor": "middle" }),
    );
    d.rows.forEach((r, i) => {
      const yy = 90 + i * 90;
      label(base, 4, yy - 20, v.name(r.name));
      v.stroke(base, left, yy, right, yy, p.grid, 1);
      r.states.forEach((s, j) => {
        const g = group(),
          q = a.el(
            "circle",
            {
              cx: x(j),
              cy: yy,
              r: 9,
              fill: s === 2 ? p.background : p.data,
              stroke: p.data,
              "stroke-width": 2,
            },
            null,
            g,
          );
        if (s === 1)
          v.stroke(g, x(j) - 5, yy - 5, x(j) + 5, yy + 5, p.background, 2);
        if (s === 3)
          a.el(
            "circle",
            { cx: x(j), cy: yy, r: 3, fill: p.background },
            null,
            g,
          );
        mark(
          g,
          q,
          `${v.name(r.name)} · ${d.years[j]}\n${v.name(states[s])}`,
          i * d.years.length + j,
          d.rows.length * d.years.length,
        );
      });
    });
    label(
      base,
      4,
      d.rows.length * 90 + 60,
      states.map((s, i) => (v.zh ? ["实点", "斜线", "空心", "环点"] : ["Solid", "Slash", "Hollow", "Ring"])[i] + ": " + v.name(s)).join("; "),
      { "font-size": v.small ? 11 : 16 },
    );
  },
);
