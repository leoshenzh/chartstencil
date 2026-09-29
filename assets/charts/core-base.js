/* Original data-shape library. Shared primitives only; each shape keeps its own encoding. */
"use strict";
const Core = {
  heights: {},
  format(value, lang) {
    return String(value).replace(
      /\d{4}-\d{2}(?:-\d{2})?|\d{2}[-:]\d{2}|[+-]?\d+(?:\.\d+)?/g,
      (token) => {
        if (/^\d{2,4}[-:]\d{2}/.test(token) || /^0\d/.test(token)) return token;
        const n = Number(token);
        return (
          (token.startsWith("+") ? "+" : "") +
          new Intl.NumberFormat(lang === "zh" ? "zh-CN" : "en-US", {
            maximumFractionDigits: 2,
            useGrouping: Math.abs(n) >= 10000,
          }).format(n)
        );
      },
    );
  },
  editorial(a, c, H) {
    let pad = a.width < 720 ? 115 : 85;
    const drawing = a.el(
      "g",
      { "data-data-region": "", transform: `translate(0 ${pad})` },
      null,
      a.svg,
    );
    [...a.svg.children]
      .filter(
        (n) => n !== drawing && !["title", "desc", "defs"].includes(n.tagName),
      )
      .forEach((n) => drawing.append(n));
    for (const rec of a.records)
      if (rec.crosshair) {
        rec.crosshair.y1 += pad;
        rec.crosshair.y2 += pad;
      }
    const note = a.el("g", { "data-insight": "" }, null, a.svg);
    a.el(
      "rect",
      { x: 0, y: 3, width: 4, height: pad - 25, fill: a.palette.accent },
      null,
      note,
    );
    MBB.wrapText(
      note,
      18,
      24,
      this.format(c.annotation, c.lang),
      a.width - 24,
      { style: `font-size:${a.width < 720 ? 15 : 20}px;font-weight:600` },
      a.width < 720 ? 23 : 29,
    );
    const textBox = note.querySelector("text").getBBox();
    const measuredPad = Math.ceil(textBox.y + textBox.height + 25);
    note.querySelector("rect").setAttribute("height", measuredPad - 22);
    drawing.setAttribute("transform", `translate(0 ${measuredPad})`);
    for (const rec of a.records)
      if (rec.crosshair) {
        rec.crosshair.y1 += measuredPad - pad;
        rec.crosshair.y2 += measuredPad - pad;
      }
    pad = measuredPad;
    a.step(note, 6900, 600);
    a.seek(a.duration);
    const b = drawing.getBBox();
    const height = Math.ceil(b.y + b.height + pad + 18);
    a.svg.style.height = height + "px";
    a.svg.setAttribute("viewBox", `0 0 ${a.width} ${height}`);
  },
  install(name, height, draw) {
    this.heights[name] = height;
    MBBCharts.templates[name] = (a, c, ctx) => {
      const lang = c.lang === "zh" ? 0 : 1,
        p = a.palette;
      const v = {
        ...ctx,
        a,
        c,
        d: c.data,
        p,
        lang,
        name: (x) => (Array.isArray(x) ? x[lang] : String(x ?? "")),
        label: (g, x, y, s, attrs = {}) =>
          a.text(g, x, y, s, {
            ...attrs,
            style: `font-size:${attrs["font-size"] || (ctx.small ? 14 : 18)}px;${attrs.style || ""}`,
          }),
        group: () => a.el("g", {}, null, a.svg),
        color: (i) => p.categories[i % p.categories.length],
        mark: (g, target, label, i, n, more = {}) => {
          for (const path of [g, ...g.querySelectorAll("path,line")])
            if (
              (path.tagName === "path" &&
                path.getAttribute("fill") === "none") ||
              path.tagName === "line"
            )
              path.style.pointerEvents = "stroke";
          return a.mark(
            g,
            { target, label, ...more },
            950 + (i * 5000) / Math.max(n, 1),
          );
        },
        stroke: (g, x1, y1, x2, y2, color = p.data, width = 2) =>
          a.line(g, x1, y1, x2, y2, {
            class: "",
            stroke: color,
            "stroke-width": width,
          }),
        unit: c.data.unit?.[lang] || "",
      };
      draw(v);
    };
  },
  height(name, d, w) {
    const h = this.heights[name];
    return typeof h === "function" ? h(d, w) : h;
  },
  legend(v, rows, y) {
    rows.forEach((r, i) => {
      v.a.el(
        "rect",
        { x: 4, y: y + i * 30 - 13, width: 13, height: 13, fill: v.color(i) },
        null,
        v.base,
      );
      v.label(
        v.base,
        27,
        y + i * 30,
        `${v.name(r.name)}${r.value == null ? "" : ` · ${r.value} ${v.unit}`}`,
      );
    });
  },
  axes(
    v,
    max = 100,
    bottom = 460,
    left = 46,
    right = v.w - 18,
    top = 45,
    min = 0,
  ) {
    const x = (i, n) => left + (i / Math.max(1, n - 1)) * (right - left),
      y = (q) => bottom - ((q - min) / (max - min)) * (bottom - top);
    for (const value of MBB.ticks(min, max, 4)) {
      v.a.line(v.base, left, y(value), right, y(value));
      v.label(v.base, left - 8, y(value) + 5, MBB.number(value, v.c.lang), {
        "data-axis-tick": "y",
        "text-anchor": "end",
      });
    }
    return { left, right, top, bottom, x, y };
  },
  path: (points) =>
    points.map((p, i) => (i ? "L" : "M") + p.join(",")).join(" "),
  extent(values, domain) {
    if (domain) return domain;
    const lo = Math.floor(Math.min(...values) / 10) * 10,
      hi = Math.ceil(Math.max(...values) / 10) * 10;
    return [lo, hi === lo ? lo + 10 : hi];
  },
  median(values) {
    const x = [...values].sort((a, b) => a - b),
      m = Math.floor(x.length / 2);
    return x.length % 2 ? x[m] : (x[m - 1] + x[m]) / 2;
  },
};
