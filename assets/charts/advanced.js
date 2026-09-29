/* Generic relationship, distribution and planning templates. D3: ISC. */
"use strict";
function networkInteraction(v, elements, adjacency, resetLayout) {
  const { a, zh } = v;
  const status = document.createElement("div");
  status.className = "interaction-status";
  status.setAttribute("role", "status");
  const idle = zh
    ? "悬停或聚焦查看关联；点击节点重播。"
    : "Hover or focus to inspect connections; click a node to replay.";
  status.textContent = idle;
  a.card.append(status);
  function focus(key) {
    const selected = new Set(adjacency.get(key) || [key]);
    selected.add(key);
    elements.forEach((e) =>
      e.node.classList.toggle(
        "interaction-muted",
        !(e.keys.length === 1 ? selected.has(e.keys[0]) : e.keys.includes(key)),
      ),
    );
    status.textContent =
      (zh ? "当前关联：" : "Connected entities: ") + selected.size;
    a.interaction = { key, count: selected.size };
  }
  function clear() {
    elements.forEach((e) => e.node.classList.remove("interaction-muted"));
    status.textContent = idle;
    a.interaction = null;
  }
  for (const e of elements) {
    e.node.addEventListener("pointerenter", () => focus(e.keys[0]), {
      signal: a.signal,
    });
    e.node.addEventListener("focus", () => focus(e.keys[0]), {
      signal: a.signal,
    });
    e.node.addEventListener("blur", clear, { signal: a.signal });
    e.node.addEventListener("pointerleave", clear, { signal: a.signal });
    e.node.addEventListener(
      "click",
      () => {
        if (a.suppressClick) {
          a.suppressClick = false;
          return;
        }
        if (e.keys.length !== 1) return;
        clear();
        resetLayout?.();
        a.replay();
      },
      { signal: a.signal },
    );
  }
  a.resetInteraction = () => {
    clear();
    resetLayout?.();
  };
}
Core.install(
  "orbit-network",
  (d, w) => Math.min(w, 960) + 95,
  (v) => {
    const { a, d, w, p, base, label, mark, name } = v,
      radius = w / 2 - (v.small ? 24 : 48),
      cx = w / 2,
      cy = radius + 30;
    const nodes = d.nodes.map((r, i) => ({
      ...r,
      x:
        cx +
        radius * Math.cos((i / d.nodes.length) * 2 * Math.PI - Math.PI / 2),
      y:
        cy +
        radius * Math.sin((i / d.nodes.length) * 2 * Math.PI - Math.PI / 2),
    }));
    const elements = [],
      adj = new Map(nodes.map((r) => [r.id, []])),
      layer = a.el("g", {}, null, a.svg);
    a.step(layer, 1000, 5000);
    d.links.forEach((r, i) => {
      const s = nodes[r.source],
        t = nodes[r.target];
      adj.get(s.id).push(t.id);
      adj.get(t.id).push(s.id);
      const path = a.el(
        "path",
        {
          d: `M${s.x},${s.y} Q${cx},${cy} ${t.x},${t.y}`,
          fill: "none",
          stroke: p.data,
          "stroke-width": v.small ? 2 : 2.5,
          style: "pointer-events:stroke",
        },
        null,
        layer,
      );
      a.mark(
        path,
        {
          kind: "ribbon",
          label: `${name(s.name)} → ${name(t.name)}\n${r.value} ${v.unit}`,
        },
        1000,
        false,
      );
      path.style.opacity = 1;
      elements.push({ node: path, keys: [s.id, t.id] });
    });
    nodes.forEach((r, i) => {
      const dot = a.el(
        "circle",
        {
          cx: r.x,
          cy: r.y,
          r: v.small ? 4.5 : 7,
          fill: i < 10 ? p.accent : p.data,
          stroke: p.background,
          "stroke-width": 1,
        },
        null,
        layer,
      );
      a.mark(
        dot,
        {
          label: `${name(r.name)}\n${adj.get(r.id).length} ${v.zh ? "条连接" : "links"}`,
        },
        1000,
        false,
      );
      dot.style.opacity = 1;
      elements.push({ node: dot, keys: [r.id] });
    });
    label(
      base,
      4,
      2 * radius + 86,
      v.zh
        ? `${d.links.length}条连线 · 圆点等大，不编码规模`
        : `${d.links.length} links · equal-size nodes`,
      { "font-size": v.small ? 12 : 18 },
    );
    networkInteraction(v, elements, adj);
  },
);
Core.install(
  "spring-network",
  (d, w) => (w < 720 ? 1080 : 840),
  (v) => {
    const { a, d, w, p, base, label, name } = v,
      top = 35,
      bottom = v.small ? 920 : 690;
    const nodes = d.nodes.map((r, i) => ({
      ...r,
      x:
        (((Math.floor(i / 30) % (v.small ? 2 : 3)) + 0.5) * w) /
          (v.small ? 2 : 3) +
        ((i % 5) - 2) * 14,
      y:
        top +
        ((Math.floor(i / 30 / (v.small ? 2 : 3)) + 0.5) * (bottom - top)) /
          (v.small ? 3 : 2) +
        ((i % 6) - 2.5) * 14,
    }));
    const links = d.links.map((r) => ({ ...r }));
    const simulation = d3
      .forceSimulation(nodes)
      .stop()
      .randomSource(d3.randomLcg(0.42))
      .force(
        "link",
        d3
          .forceLink(links)
          .distance(v.small ? 40 : 70)
          .strength(0.18),
      )
      .force("charge", d3.forceManyBody().strength(-80))
      .force(
        "x",
        d3
          .forceX(
            (r, i) =>
              (((Math.floor(i / 30) % (v.small ? 2 : 3)) + 0.5) * w) /
                (v.small ? 2 : 3) +
              ((i % 5) - 2) * 14,
          )
          .strength(0.1),
      )
      .force(
        "y",
        d3
          .forceY(
            (r, i) =>
              top +
              ((Math.floor(i / 30 / (v.small ? 2 : 3)) + 0.5) *
                (bottom - top)) /
                (v.small ? 3 : 2) +
              ((i % 6) - 2.5) * 14,
          )
          .strength(0.1),
      )
      .force("collide", d3.forceCollide(v.small ? 14 : 24));
    simulation.tick(220);
    const xs = d3.extent(nodes, (r) => r.x),
      ys = d3.extent(nodes, (r) => r.y);
    nodes.forEach((r) => {
      r.x = 15 + ((r.x - xs[0]) / (xs[1] - xs[0])) * (w - 30);
      r.y = top + ((r.y - ys[0]) / (ys[1] - ys[0])) * (bottom - top);
      r.home = [r.x, r.y];
    });
    const layer = a.el("g", {}, null, a.svg);
    a.step(layer, 1000, 5000);
    const elements = [],
      adj = new Map(nodes.map((r) => [r.id, []]));
    links.forEach((r, i) => {
      adj.get(r.source.id).push(r.target.id);
      adj.get(r.target.id).push(r.source.id);
      r.path = a.el(
        "path",
        {
          fill: "none",
          stroke: p.data,
          "stroke-width": v.small ? 2 : 2.5,
          style: "pointer-events:stroke",
        },
        null,
        layer,
      );
      a.mark(
        r.path,
        {
          kind: "ribbon",
          label: `${name(r.source.name)} → ${name(r.target.name)}\n${r.value} ${v.unit}`,
        },
        1000,
        false,
      );
      r.path.style.opacity = 1;
      elements.push({ node: r.path, keys: [r.source.id, r.target.id] });
    });
    nodes.forEach((r, i) => {
      r.dot = a.el(
        "circle",
        {
          r: v.small ? 5 : 8,
          fill: i < 30 ? p.accent : p.data,
          stroke: p.background,
          "stroke-width": 1,
          style: "touch-action:none",
        },
        null,
        layer,
      );
      a.mark(
        r.dot,
        {
          label: `${name(r.name)}\n${adj.get(r.id).length} ${v.zh ? "条连接" : "links"}`,
        },
        1000,
        false,
      );
      r.dot.style.opacity = 1;
      elements.push({ node: r.dot, keys: [r.id] });
    });
    function draw() {
      nodes.forEach((r) => {
        r.dot.setAttribute("cx", r.x);
        r.dot.setAttribute("cy", r.y);
      });
      links.forEach((r, i) => {
        const dx = r.target.x - r.source.x,
          dy = r.target.y - r.source.y,
          len = Math.hypot(dx, dy) || 1,
          bend = Math.sin(i * 2.399963) * 32;
        r.path.setAttribute(
          "d",
          `M${r.source.x},${r.source.y} Q${Math.max(12, Math.min(w - 12, (r.source.x + r.target.x) / 2 - (dy / len) * bend))},${Math.max(top, Math.min(bottom, (r.source.y + r.target.y) / 2 + (dx / len) * bend))} ${r.target.x},${r.target.y}`,
        );
      });
    }
    let spring = 0;
    function reset() {
      cancelAnimationFrame(spring);
      nodes.forEach((r) => {
        [r.x, r.y] = r.home;
      });
      draw();
      a.dragging = false;
    }
    nodes.forEach((r) => {
      r.dot.addEventListener(
        "pointerdown",
        (e) => {
          if (a.exporting) return;
          e.preventDefault();
          a.pause();
          cancelAnimationFrame(spring);
          a.dragging = true;
          r.dot.setPointerCapture(e.pointerId);
        },
        { signal: a.signal },
      );
      r.dot.addEventListener(
        "pointermove",
        (e) => {
          if (!r.dot.hasPointerCapture(e.pointerId)) return;
          const q = new DOMPoint(e.clientX, e.clientY).matrixTransform(
            layer.getScreenCTM().inverse(),
          );
          r.x = Math.max(10, Math.min(w - 10, q.x));
          r.y = Math.max(top, Math.min(bottom, q.y));
          draw();
        },
        { signal: a.signal },
      );
      const release = (e) => {
        if (!r.dot.hasPointerCapture(e.pointerId)) return;
        r.dot.releasePointerCapture(e.pointerId);
        a.dragging = false;
        a.suppressClick = Math.hypot(r.x - r.home[0], r.y - r.home[1]) > 2;
        const start = performance.now(),
          from = [r.x, r.y];
        function tick(now) {
          const t = Math.min(1, (now - start) / 650),
            q = (1 - t) ** 3;
          r.x = r.home[0] + (from[0] - r.home[0]) * q;
          r.y = r.home[1] + (from[1] - r.home[1]) * q;
          draw();
          if (t < 1) spring = requestAnimationFrame(tick);
        }
        spring = requestAnimationFrame(tick);
      };
      r.dot.addEventListener("pointerup", release, { signal: a.signal });
      r.dot.addEventListener("pointercancel", release, { signal: a.signal });
    });
    draw();
    a.signal.addEventListener("abort", () => cancelAnimationFrame(spring));
    label(
      base,
      4,
      bottom + 45,
      v.zh
        ? `${d.nodes.length} 个节点 · 拖动后回弹至稳定布局`
        : `${d.nodes.length} nodes · drag and release to spring back`,
      { "font-size": v.small ? 12 : 18 },
    );
    networkInteraction(v, elements, adj, reset);
  },
);
Core.install(
  "route-threads",
  (d, w) => (w < 720 ? 1030 : 880),
  (v) => {
    const { a, d, w, p, base, label, name } = v,
      left = v.small ? 61 : 115,
      right = w - 9,
      top = 70,
      bottom = v.small ? 910 : 760,
      n = d.rows.length;
    d.bundles.forEach((bundle, i) =>
      MBB.wrapText(
        base,
        0,
        top + ((i + 0.5) / d.bundles.length) * (bottom - top),
        name(bundle),
        left - 8,
        { style: `font-size:${v.small ? 12 : 18}px;font-weight:700` },
        17,
      ),
    );
    const stageX = d.stages.map(
      (_, i) => left + (i * (right - left)) / (d.stages.length - 1),
    );
    d.stages.forEach((s, i) =>
      label(base, stageX[i], 28, name(s), {
        "text-anchor":
          i === 0 ? "start" : i === d.stages.length - 1 ? "end" : "middle",
        "font-size": v.small ? 12 : 18,
        "font-weight": 700,
      }),
    );
    const layer = a.el("g", {}, null, a.svg);
    const bundles = d.bundles.map((_, i) => {
      const g = a.el("g", {}, null, layer);
      a.step(g, 1000 + i * 700, 600);
      return g;
    });
    const paths = [];
    d.rows.forEach((r, i) => {
      const points = r.positions.map((position, j) => [
        stageX[j],
        top + ((position + 0.5) / n) * (bottom - top),
      ]);
      const curve = d3.line().curve(d3.curveMonotoneX)(points);
      const path = a.el(
        "path",
        {
          d: curve,
          fill: "none",
          stroke: p.categories[r.bundle % p.categories.length],
          "stroke-width": v.small ? 2 : 2.5,
          style: "pointer-events:stroke",
        },
        null,
        bundles[r.bundle],
      );
      a.mark(
        path,
        {
          kind: "ribbon",
          label: `${name(r.name)}\n${name(d.bundles[r.bundle])} · ${r.value} ${v.unit}\n${v.zh ? "点击钉住，再点解除" : "Click to pin; click again to release"}`,
        },
        1000,
        false,
      );
      path.style.opacity = 1;
      paths.push(path);
    });
    const status = document.createElement("div");
    status.className = "interaction-status";
    status.setAttribute("role", "status");
    a.card.append(status);
    const idle = v.zh
      ? `${n}条路径 · 点击可钉住一条路径`
      : `${n} paths · click to pin a path`;
    let pinned = null;
    function pin(i) {
      pinned = i;
      a.pinned = i;
      if (i == null) clear();
      else focus([i], (v.zh ? "已钉住：" : "Pinned: ") + name(d.rows[i].name));
    }
    a.pin = pin;
    function focus(indices, message) {
      paths.forEach((p, i) =>
        p.classList.toggle("interaction-muted", !indices.includes(i)),
      );
      status.textContent = message;
    }
    function clear() {
      if (pinned != null) return;
      paths.forEach((p) => p.classList.remove("interaction-muted"));
      status.textContent = idle;
    }
    paths.forEach((path, i) => {
      const show = () => {
        if (pinned == null)
          focus([i], a.records[i].label.replaceAll("\n", " · "));
      };
      path.addEventListener("pointerenter", show, { signal: a.signal });
      path.addEventListener("focus", show, { signal: a.signal });
      path.addEventListener("pointerleave", clear, { signal: a.signal });
      path.addEventListener("blur", clear, { signal: a.signal });
      path.addEventListener(
        "click",
        () => pin(pinned === i ? null : i),
        { signal: a.signal },
      );
    });
    const controls = document.createElement("div");
    controls.className = "bundle-controls toolbar";
    d.bundles.forEach((bundle, j) => {
      const button = document.createElement("button");
      button.textContent = name(bundle);
      const select = () => {
        pinned = null;
        a.pinned = null;
        focus(
          d.rows.flatMap((r, i) => (r.bundle === j ? [i] : [])),
          name(bundle) + " · " + d.rows.filter((r) => r.bundle === j).length,
        );
        a.bundle = j;
      };
      button.addEventListener("pointerenter", select);
      button.addEventListener("focus", select);
      button.addEventListener("click", select);
      button.addEventListener("pointerleave", clear);
      button.addEventListener("blur", clear);
      controls.append(button);
    });
    const reset = document.createElement("button");
    reset.textContent = v.zh ? "解除钉住 / 显示全部" : "Unpin / show all";
    reset.onclick = () => {
      pinned = null;
      a.pinned = null;
      clear();
    };
    controls.append(reset);
    const toolbar = document.querySelector(".toolbar");
    if (toolbar) toolbar.after(controls);
    else document.querySelector("svg.plot").before(controls);
    a.resetInteraction = () => {
      pinned = null;
      a.pinned = null;
      clear();
    };
    clear();
    label(
      base,
      4,
      bottom + 42,
      v.zh
        ? "路径位置用于区分记录；等宽线条不编码数值"
        : "Positions separate records; equal widths do not encode value",
      { "font-size": v.small ? 12 : 18 },
    );
  },
);

Core.install(
  "target-tracks",
  (d, w) => d.rows.length * (w < 720 ? 125 : 100) + 115,
  (v) => {
    const { a, d, w, base, labels, p, label, name, mark, group } = v,
      left = v.small ? 8 : 150,
      right = w - 40,
      max = d.max;
    d.rows.forEach((r, i) => {
      const y = 70 + i * (v.small ? 125 : 100),
        x = (q) => left + (q / max) * (right - left),
        g = group();
      label(
        base,
        v.small ? 8 : left - 15,
        v.small ? y - 25 : y + 8,
        name(r.name),
        { "text-anchor": v.small ? "start" : "end" },
      );
      a.line(base, left, y + 28, right, y + 28, {
        class: "axis",
        "shape-rendering": "crispEdges",
      });
      const bar = a.el(
        "rect",
        { x: left, y, width: x(r.value) - left, height: 20, fill: p.data },
        null,
        g,
      );
      v.stroke(
        g,
        x(r.target),
        y - 9,
        x(r.target),
        y + 29,
        p.accent,
        3,
      ).setAttribute("shape-rendering", "crispEdges");
      label(g, x(r.value), y + 53, String(r.value), {
        "text-anchor": "middle",
        "font-weight": 700,
      });
      label(g, x(r.target), y - 16, `${v.zh ? "目标" : "Target"} ${r.target}`, {
        "text-anchor": r.target > max * 0.7 ? "end" : "start",
        "font-size": v.small ? 12 : 16,
      });
      mark(
        g,
        bar,
        `${name(r.name)}\n${v.zh ? "实际" : "Actual"} ${r.value} ${v.unit}\n${v.zh ? "目标" : "Target"} ${r.target} ${v.unit}`,
        i,
        d.rows.length,
      );
    });
    label(base, left, 20, "0");
    label(base, right, 20, String(max), { "text-anchor": "end" });
  },
);
Core.install("contribution-pareto", 700, (v) => {
  const { a, d, w, base, labels, label, group, mark, p, name } = v,
    total = d.rows.reduce((s, r) => s + r.value, 0),
    max = Math.max(...d.rows.map((r) => r.value)),
    left = 65,
    right = w - 15,
    step = (right - left) / d.rows.length;
  let cumulative = 0;
  const pts = [];
  MBB.ticks(0, max, 3).forEach(q => {
    const t = q / max;
    a.line(base, left, 300 - t * 240, right, 300 - t * 240);
    label(base, left - 7, 305 - t * 240, MBB.number(q, v.c.lang), {
      "data-axis-tick":"y",
      "text-anchor": "end",
      "font-size": v.small ? 12 : 17,
    });
  });
  [0, .5, 1].forEach(t => {
    a.line(base, left, 600 - t * 175, right, 600 - t * 175);
    label(base, left - 7, 605 - t * 175, `${t * 100}%`, {
      "text-anchor": "end",
      "font-size": v.small ? 12 : 17,
    });
  });
  d.rows.forEach((r, i) => {
    cumulative += r.value;
    const x = left + (i + 0.5) * step,
      g = group(),
      bar = a.el(
        "rect",
        {
          x: x - step * 0.32,
          y: 300 - (r.value / max) * 240,
          width: step * 0.64,
          height: (r.value / max) * 240,
          fill: i < 2 ? p.accent : p.data,
        },
        null,
        g,
      );
    label(g, x, 290 - (r.value / max) * 240, String(r.value), {
      "text-anchor": "middle",
      "font-weight": 700,
    });
    MBB.wrapText(
      base,
      x,
      330,
      name(r.name),
      step - 5,
      { "text-anchor": "middle", style: `font-size:${v.small ? 12 : 17}px` },
      19,
    );
    const y = 600 - (cumulative / total) * 175;
    pts.push([x, y]);
    const dot = a.el("circle", { cx: x, cy: y, r: 6, fill: p.data }, null, g);
    label(g, x, y - 14, `${+((cumulative / total) * 100).toFixed(1)}%`, {
      "text-anchor": "middle",
      "font-size": v.small ? 12 : 17,
    });
    mark(
      g,
      bar,
      `${name(r.name)}\n${r.value} ${v.unit}\n${v.zh ? "累计" : "Cumulative"} ${((cumulative / total) * 100).toFixed(1)}%`,
      i,
      d.rows.length,
    );
  });
  const line = a.el(
    "path",
    { d: d3.line()(pts), fill: "none", stroke: p.data, "stroke-width": 3 },
    null,
    a.svg,
  );
  a.step(line, 1000, 5000);
  label(
    base,
    left,
    395,
    v.zh
      ? "累计占比（与上方分类同序）"
      : "Cumulative share, in the same category order",
    { "font-size": v.small ? 12 : 18, "font-weight": 700 },
  );
});
Core.install("cumulative-distribution", 630, (v) => {
  const { a, d, w, p, base, labels, label, mark } = v,
    values = [...d.values].sort((a, b) => a - b),
    left = v.small ? 48 : 68,
    right = w - 18,
    top = 45,
    bottom = 480,
    max = d.max,
    x = (q) => left + (q / max) * (right - left),
    y = (q) => bottom - q * (bottom - top);
  [0, 0.25, 0.5, 0.75, 1].forEach((q) => {
    a.line(base, left, y(q), right, y(q));
    label(base, left - 9, y(q) + 5, `${q * 100}%`, { "text-anchor": "end" });
  });
  MBB.ticks(0, max, 4).forEach((q) =>
    label(base, x(q), bottom + 32, MBB.number(q, v.c.lang), { "text-anchor": "middle", "data-axis-tick":"x" }),
  );
  const layer = a.el("g", {}, null, a.svg);
  a.step(layer, 1000, 5000);
  const points = [
    [0, 0],
    ...values.map((value, i) => [value, (i + 1) / values.length]),
    [max, 1],
  ];
  a.el(
    "path",
    {
      d: d3
        .line()
        .x((r) => x(r[0]))
        .y((r) => y(r[1]))
        .curve(d3.curveStepAfter)(points),
      fill: "none",
      stroke: p.data,
      "stroke-width": 3,
    },
    null,
    layer,
  );
  values.forEach((value, i) => {
    const dot = a.el(
      "circle",
      {
        cx: x(value),
        cy: y((i + 1) / values.length),
        r: v.small ? 3.5 : 5,
        fill: p.data,
      },
      null,
      layer,
    );
    a.mark(
      dot,
      {
        label: `≤${value} ${v.unit}\n${(((i + 1) / values.length) * 100).toFixed(1)}% · ${i + 1}/${values.length}`,
      },
      1000,
      false,
    );
    dot.style.opacity = 1;
  });
  v.stroke(
    labels,
    x(d.threshold),
    top,
    x(d.threshold),
    bottom,
    p.accent,
    2,
  ).setAttribute("stroke-dasharray", "5 4");
  label(labels, x(d.threshold) - 8, top + 20, `${d.threshold}${v.unit}`, {
    "text-anchor": "end",
    "font-weight": 700,
  });
  label(
    base,
    left,
    bottom + 77,
    v.zh
      ? `已提供数值：${values.length}`
      : `Provided values: ${values.length}`,
    { "font-size": v.small ? 12 : 18 },
  );
});
Core.install(
  "retention-cohorts",
  (d, w) => d.rows.length * 86 + 140,
  (v) => {
    const { a, d, w, base, p, label, name, mark } = v,
      left = v.small ? 86 : 170,
      span = (w - left) / d.periods.length;
    d.periods.forEach((s, i) =>
      label(base, left + (i + 0.5) * span, 27, name(s), {
        "text-anchor": "middle",
        "font-size": v.small ? 12 : 18,
      }),
    );
    d.rows.forEach((r, i) => {
      const y = 60 + i * 86;
      label(base, 0, y + 22, name(r.name), { "font-weight": 700 });
      label(base, 0, y + 46, `n=${r.n}`, { "font-size": v.small ? 12 : 16 });
      r.values.forEach((value, j) => {
        if (value == null) return;
        const fill =
            p.ordinal[
              Math.min(
                p.ordinal.length - 1,
                Math.floor((value / 100) * p.ordinal.length),
              )
            ],
          g = a.el("g", {}, null, a.svg),
          cell = a.el(
            "rect",
            { x: left + j * span + 2, y, width: span - 5, height: 62, fill },
            null,
            g,
          );
        label(g, left + (j + 0.5) * span, y + 37, `${value}%`, {
          style: `fill:${MBB.ink(fill)}`,
          "text-anchor": "middle",
          "font-size": v.small ? 12 : 19,
        });
        mark(
          g,
          cell,
          `${name(r.name)} · ${name(d.periods[j])}\n${value}%\n${v.zh ? "初始群体" : "Initial cohort"} n=${r.n}`,
          i * d.periods.length + j,
          d.rows.length * d.periods.length,
        );
      });
    });
    label(
      base,
      0,
      d.rows.length * 86 + 105,
      v.zh
        ? "空白＝未提供数值，不表示零"
        : "Blank = no value provided, not zero",
      { "font-size": v.small ? 12 : 18 },
    );
  },
);
Core.install(
  "sensitivity-range",
  (d, w) => d.rows.length * 100 + 130,
  (v) => {
    const { a, d, w, p, base, label, name, mark, group } = v,
      left = v.small ? 15 : 170,
      right = w - 15,
      x = (q) => left + ((q + d.extent) / (2 * d.extent)) * (right - left);
    [-d.extent, 0, d.extent].forEach((q) =>
      label(base, x(q), 25, (q > 0 ? "+" : "") + q, {
        "text-anchor":
          q === -d.extent ? "start" : q === d.extent ? "end" : "middle",
      }),
    );
    a.line(base, x(0), 40, x(0), 70 + (d.rows.length - 1) * 100 + 35, {
      class: "axis",
    });
    d.rows.forEach((r, i) => {
      const y = 70 + i * 100,
        g = group();
      label(
        base,
        v.small ? left : left - 15,
        v.small ? y - 12 : y + 20,
        name(r.name),
        { "text-anchor": v.small ? "start" : "end" },
      );
      const low = a.el(
        "rect",
        { x: x(r.low), y, width: x(0) - x(r.low), height: 30, fill: p.data },
        null,
        g,
      );
      a.el(
        "rect",
        { x: x(0), y, width: x(r.high) - x(0), height: 30, fill: p.accent },
        null,
        g,
      );
      label(g, x(r.low), y + 54, String(r.low), {
        "text-anchor": "middle",
        "font-weight": 700,
      });
      label(g, x(r.high), y + 54, "+" + r.high, {
        "text-anchor": "middle",
        "font-weight": 700,
      });
      mark(
        g,
        low,
        `${name(r.name)}\n${r.low} / +${r.high} ${v.unit}\n${v.zh ? "相对基准、单因素改变" : "One factor at a time, relative to baseline"}`,
        i,
        d.rows.length,
      );
    });
  },
);
Core.install(
  "delivery-roadmap",
  (d, w) => d.rows.length * (w < 720 ? 105 : 80) + 190,
  (v) => {
    const { a, d, w, base, p, label, name, mark, group } = v,
      left = v.small ? 12 : 170,
      right = w - 12,
      start = Date.parse(d.start),
      end = Date.parse(d.end),
      x = (date) =>
        left + ((Date.parse(date) - start) / (end - start)) * (right - left);
    d.ticks.forEach((date, i) => {
      a.line(
        base,
        x(date),
        45,
        x(date),
        80 + d.rows.length * (v.small ? 105 : 80),
      );
      label(base, x(date), 25, date.slice(5), {
        "text-anchor": i === 0 ? "start" : "end",
        "font-size": v.small ? 12 : 17,
      });
    });
    const layer = group();
    a.step(layer, 1000, 5000);
    d.rows.forEach((r, i) => {
      const y = 85 + i * (v.small ? 105 : 80);
      label(
        base,
        v.small ? left : left - 15,
        v.small ? y - 15 : y + 18,
        v.small ? name(r.name) + " · " + name(r.owner) : name(r.name),
        { "text-anchor": v.small ? "start" : "end", "font-weight": 700 },
      );
      const g = a.el("g", {}, null, layer),
        bar = a.el(
          "rect",
          {
            x: x(r.start),
            y,
            width: x(r.end) - x(r.start),
            height: 24,
            fill: r.actual ? p.data : p.background,
            stroke: r.actual ? p.data : p.accent,
            "stroke-width": 2,
            "stroke-dasharray": r.actual ? "" : "5 3",
          },
          null,
          g,
        );
      a.el(
        "rect",
        {
          x: -5,
          y: -5,
          width: 10,
          height: 10,
          transform: `translate(${x(r.end)} ${y + 12}) rotate(45)`,
          fill: r.actual ? p.data : p.accent,
        },
        null,
        g,
      );
      a.mark(
        g,
        {
          target: bar,
          label: `${name(r.name)}\n${r.start} → ${r.end}\n${name(r.owner)} · ${r.actual ? (v.zh ? "已完成" : "Completed") : v.zh ? "计划" : "Planned"}\n${name(r.deliverable)}`,
        },
        1000,
        false,
      );
      g.style.opacity = 1;
      if (!v.small)
        label(base, x(r.start), y + 48, name(r.owner), {
          "font-size": v.small ? 12 : 16,
        });
      if (r.depends != null) {
        const previous = d.rows[r.depends],
          py = 85 + r.depends * (v.small ? 105 : 80) + 26;
        a.el(
          "path",
          {
            d: `M${x(previous.end)},${py} V${y - 7} H${x(r.start)}`,
            fill: "none",
            stroke: p.muted,
            "stroke-width": 1.5,
          },
          null,
          layer,
        );
      }
    });
    MBB.wrapText(
      base,
      left,
      125 + d.rows.length * (v.small ? 105 : 80),
      v.zh
        ? "实心＝完成；虚线＝计划；折线＝前置依赖；菱形＝验收节点"
        : "Solid = completed; dashed = planned; connectors = dependencies; diamonds = acceptance gates",
      w - left,
      { style: `font-size:${v.small ? 12 : 17}px` },
      19,
    );
  },
);
Core.install(
  "decision-grid",
  (d, w) => (w < 720 ? d.rows.length * 235 + 130 : d.rows.length * 112 + 160),
  (v) => {
    const { a, d, w, base, p, label, name, mark } = v,
      left = v.small ? 0 : 160,
      span = (w - left) / d.options.length;
    if (!v.small)
      d.options.forEach((s, i) =>
        label(base, left + (i + 0.5) * span, 27, name(s), {
          "text-anchor": "middle",
          "font-weight": 700,
        }),
      );
    d.rows.forEach((r, i) => {
      const y = 65 + i * (v.small ? 235 : 112);
      label(base, 0, y, name(r.name), { "font-weight": 700 });
      r.values.forEach((value, j) => {
        const xx = v.small ? 100 : left + j * span,
          yy = v.small ? y + 15 + j * 63 : y - 28,
          cw = v.small ? w - 100 : span - 10,
          g = a.el("g", {}, null, a.svg),
          cell = a.el(
            "rect",
            {
              x: xx,
              y: yy,
              width: cw,
              height: v.small ? 56 : 89,
              fill: p.background,
              stroke: p.grid,
            },
            null,
            g,
          );
        if (v.small)
          label(base, 0, yy + 30, name(d.options[j]), { "font-size": 12 });
        MBB.wrapText(
          g,
          xx + 10,
          yy + 24,
          name(value),
          cw - 20,
          { style: `font-size:${v.small ? 13 : 17}px` },
          22,
        );
        mark(
          g,
          cell,
          `${name(r.name)} · ${name(d.options[j])}\n${name(value)}\n${name(r.basis)}`,
          i * d.options.length + j,
          d.rows.length * d.options.length,
        );
      });
    });
  },
);
Core.install(
  "share-pie",
  (d, w) => Math.min(w, 630) + d.rows.length * 40 + 100,
  (v) => {
    const { a, d, w, p, base, label, name, mark } = v,
      r = Math.min(w / 2 - 15, 330),
      cx = w / 2,
      cy = r + 15,
      total = d.rows.reduce((s, r) => s + r.value, 0),
      pie = d3
        .pie()
        .sort(null)
        .value((r) => r.value)(d.rows),
      arc = d3.arc().innerRadius(0).outerRadius(r);
    pie.forEach((slice, i) => {
      const g = a.el("g", { transform: `translate(${cx},${cy})` }, null, a.svg),
        fill = p.categories[i],
        shape = a.el(
          "path",
          { d: arc(slice), fill, stroke: p.background, "stroke-width": 2 },
          null,
          g,
        ),
        pos = d3
          .arc()
          .innerRadius(r * 0.68)
          .outerRadius(r * 0.68)
          .centroid(slice);
      label(
        g,
        pos[0],
        pos[1],
        `${((slice.data.value / total) * 100).toFixed(0)}%`,
        {
          "text-anchor": "middle",
          style: `fill:${MBB.ink(fill)}`,
          "font-weight": 700,
        },
      );
      mark(
        g,
        shape,
        `${name(slice.data.name)}\n${slice.data.value} ${v.unit}\n${((slice.data.value / total) * 100).toFixed(1)}%`,
        i,
        d.rows.length,
      );
    });
    Core.legend(v, d.rows, 2 * r + 75);
  },
);

Core.install("forecast-fan", 660, (v) => {
  const { a, d, w, p, base, labels, label } = v,
    left = 65,
    right = w - 15,
    top = 55,
    bottom = 505,
    x = (i) => left + (i / (d.rows.length - 1)) * (right - left),
    y = (q) => bottom - (q / d.max) * (bottom - top);
  MBB.ticks(0, d.max, 4).forEach((q) => {
    a.line(base, left, y(q), right, y(q));
    label(base, left - 9, y(q) + 5, MBB.number(q, v.c.lang), { "text-anchor": "end", "data-axis-tick":"y" });
  });
  d.rows.forEach((r, i) => {
    if (MBB.categoryIndices(d.rows.length).includes(i))
      label(base, x(i), bottom + 30, r.year, {
        "text-anchor":
          i === 0 ? "start" : i === d.rows.length - 1 ? "end" : "middle",
        "font-size": v.small ? 12 : 18,
      });
  });
  const layer = a.el("g", {}, null, a.svg);
  a.step(layer, 1000, 5000);
  const future = d.rows.slice(d.forecastFrom);
  for (const [low, high, color] of [
    ["p05", "p95", p.ordinal[0]],
    ["p25", "p75", p.ordinal[3]],
  ]) {
    a.el(
      "path",
      {
        d: d3
          .area()
          .x((r, i) => x(i + d.forecastFrom))
          .y0((r) => y(r[low]))
          .y1((r) => y(r[high]))(future),
        fill: color,
      },
      null,
      layer,
    );
  }
  for (const [rows, start, dash] of [
    [d.rows.slice(0, d.forecastFrom + 1), 0, ""],
    [future, d.forecastFrom, "7 5"],
  ])
    a.el(
      "path",
      {
        d: d3
          .line()
          .x((r, i) => x(i + start))
          .y((r) => y(r.value))(rows),
        fill: "none",
        stroke: dash ? MBB.ink(p.ordinal[3]) : p.text,
        "stroke-width": 3,
        "stroke-dasharray": dash,
      },
      null,
      layer,
    );
  d.rows.forEach((r, i) => {
    const node = a.el(
      "rect",
      {
        x: Math.max(left, x(i) - (right - left) / (d.rows.length - 1) / 2),
        y: top,
        width:
          ((right - left) / (d.rows.length - 1)) *
          (i === 0 || i === d.rows.length - 1 ? 0.5 : 1),
        height: bottom - top,
        fill: "transparent",
      },
      null,
      layer,
    );
    a.mark(
      node,
      {
        label: `${r.year}\n${r.value} ${v.unit}${r.p05 == null ? "" : `\n5–95%: ${r.p05}–${r.p95}\n25–75%: ${r.p25}–${r.p75}`}`,
        crosshair: { x: x(i), y1: top, y2: bottom },
      },
      1000,
      false,
    );
    node.style.opacity = 1;
  });
  a.line(labels, x(d.forecastFrom), top, x(d.forecastFrom), bottom, {
    class: "axis",
    "stroke-dasharray": "4 4",
  });
  label(
    labels,
    x(d.forecastFrom) + 8,
    top + 22,
    v.zh ? "预测 →" : "Forecast →",
    { "font-size": v.small ? 12 : 18, "font-weight": 700 },
  );
  const legendY = bottom + 78;
  [
    [p.ordinal[0], "5–95%"],
    [p.ordinal[3], "25–75%"],
  ].forEach(([color, t], i) => {
    a.el(
      "rect",
      {
        x: left + (i * (w - left)) / 2,
        y: legendY - 15,
        width: 23,
        height: 18,
        fill: color,
      },
      null,
      base,
    );
    label(base, left + 32 + (i * (w - left)) / 2, legendY, t, {
      "font-size": v.small ? 13 : 18,
    });
  });
});
