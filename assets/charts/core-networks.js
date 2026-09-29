"use strict";
for (const type of ["ring-network", "satellite-network"])
  Core.install(
    type,
    (d, w) => Math.min(w, 820) + 140,
    (v) => {
      const { a, d, w, p, base, group, label, mark } = v,
        r = Math.min(w / 2 - (v.small ? 48 : 105), 350),
        cx = w / 2,
        cy = r + 90,
        hub = type === "satellite-network";
      const pts = d.nodes.map((n, i) =>
        hub && i === 0
          ? { x: cx, y: cy }
          : {
              x:
                cx +
                r *
                  Math.cos(
                    ((i - (hub ? 1 : 0)) * 2 * Math.PI) /
                      (d.nodes.length - (hub ? 1 : 0)) -
                      Math.PI / 2,
                  ),
              y:
                cy +
                r *
                  Math.sin(
                    ((i - (hub ? 1 : 0)) * 2 * Math.PI) /
                      (d.nodes.length - (hub ? 1 : 0)) -
                      Math.PI / 2,
                  ),
            },
      );
      // A bounded deterministic spring/repulsion relaxation for the hub layout.
      if (hub)
        for (let iteration = 0; iteration < 80; iteration++) {
          const forces = pts.map(() => ({ x: 0, y: 0 }));
          for (let i = 1; i < pts.length; i++)
            for (let j = i + 1; j < pts.length; j++) {
              const dx = pts[i].x - pts[j].x,
                dy = pts[i].y - pts[j].y,
                dist = Math.max(1, Math.hypot(dx, dy)),
                f = 2000 / dist ** 2;
              forces[i].x += (dx / dist) * f;
              forces[i].y += (dy / dist) * f;
              forces[j].x -= (dx / dist) * f;
              forces[j].y -= (dy / dist) * f;
            }
          pts.forEach((q, i) => {
            if (!i) return;
            const dx = q.x - cx,
              dy = q.y - cy,
              dist = Math.hypot(dx, dy),
              f = (dist - r * 0.84) * 0.03;
            q.x += forces[i].x - (dx / dist) * f;
            q.y += forces[i].y - (dy / dist) * f;
          });
        }
      d.links.forEach((link, i) => {
        const from = pts[link.source],
          to = pts[link.target],
          path = a.el(
            "path",
            {
              d: `M${from.x},${from.y} L${to.x},${to.y}`,
              fill: "none",
              stroke: p.data,
              "stroke-width": hub
                ? Math.max(
                    2.5,
                    (link.value / Math.max(...d.links.map((l) => l.value))) *
                      (v.small ? 5 : 9),
                  )
                : 3,
              "stroke-opacity": 0.6,
              "pointer-events": "stroke",
            },
            null,
            a.svg,
          );
        mark(
          path,
          path,
          `${v.name(d.nodes[link.source].name)} → ${v.name(d.nodes[link.target].name)}\n${link.value} ${v.unit}`,
          i,
          d.links.length,
          { kind: "ribbon" },
        );
      });
      d.nodes.forEach((node, i) => {
        const q = pts[i],
          g = group(),
          radius =
            Math.sqrt(node.value / Math.max(...d.nodes.map((n) => n.value))) *
            (v.small ? 28 : hub ? 68 : 42),
          circle = a.el(
            "circle",
            {
              cx: q.x,
              cy: q.y,
              r: radius,
              fill: p.data,
              stroke: p.background,
              "stroke-width": 2,
            },
            null,
            g,
          );
        label(g, q.x, q.y + 5, Core.format(node.value, v.c.lang), {
          "text-anchor": "middle",
          "font-size": v.small ? 12 : 18,
          style: `fill:${MBB.ink(p.data)}`,
        });
        mark(
          g,
          circle,
          `${v.name(node.name)}\n${node.value} ${v.unit}`,
          i,
          d.nodes.length,
        );
        const title = label(g, q.x, q.y - radius - 12, v.name(node.name), {
          "text-anchor": "middle",
          "font-size": v.small ? 11 : 18,
          "font-weight": 600,
        });
        const box = title.getBBox(),
          back = a.el(
            "rect",
            {
              x: box.x - 3,
              y: box.y - 2,
              width: box.width + 6,
              height: box.height + 4,
              fill: p.background,
            },
            null,
            g,
          );
        g.insertBefore(back, title);
      });
    },
  );
Core.install(
  "branch-tree",
  (d, w) =>
    Math.max(
      620,
      d.groups.reduce((s, g) => s + g.children.length, 0) * 55 + 65,
    ),
  (v) => {
    const { a, d, w, p, base, group, label, mark } = v,
      leaves = d.groups.flatMap((g) => g.children),
      left = 18,
      middle = w * 0.39,
      right = w - 30;
    let leaf = 0;
    const rootY = 55 + ((leaves.length - 1) * 55) / 2;
    d.groups.forEach((row, i) => {
      const first = leaf,
        y = 55 + (leaf + (row.children.length - 1) / 2) * 55;
      v.stroke(base, left, rootY, middle, y, p.grid, 1);
      row.children.forEach((child, j) => {
        const yy = 55 + leaf++ * 55,
          g = group();
        a.el(
          "path",
          {
            d: `M${middle},${y} H${middle + 18} V${yy} H${right}`,
            fill: "none",
            stroke: p.data,
            "stroke-width": 1,
          },
          null,
          g,
        );
        const node = a.el(
          "circle",
          { cx: right, cy: yy, r: 6, fill: p.data },
          null,
          g,
        );
        label(g, right - 12, yy - 10, v.name(child), {
          "text-anchor": "end",
          "font-size": v.small ? 11 : 16,
        });
        mark(
          g,
          node,
          `${v.name(d.root || (v.zh ? "根节点" : "Root"))} → ${v.name(row.name)} → ${v.name(child)}`,
          first + j,
          leaves.length,
        );
      });
      const node = a.el(
        "circle",
        { cx: middle, cy: y, r: 9, fill: p.accent },
        null,
        a.svg,
      );
      mark(
        node,
        node,
        `${v.name(row.name)}\n${row.children.length} ${v.zh ? "子项" : "children"}`,
        i,
        d.groups.length,
      );
      label(base, middle - 10, y - 15, v.name(row.name), {
        "text-anchor": "end",
        "font-size": v.small ? 12 : 18,
      });
    });
    const root = a.el(
      "circle",
      { cx: left, cy: rootY, r: 11, fill: p.data },
      null,
      a.svg,
    );
    mark(
      root,
      root,
      `${v.name(d.root || (v.zh ? "根节点" : "Root"))}\n${leaves.length} ${v.zh ? "末级项" : "leaves"}`,
      0,
      1,
    );
  },
);
Core.install(
  "radial-membership",
  (d, w) => Math.min(w, 780) + 130,
  (v) => {
    const { a, d, w, p, base, group, label, mark } = v,
      r = Math.min(w / 2 - 35, 390),
      cx = w / 2,
      cy = r + 45,
      groups = [...new Set(d.rows.map((r) => r.group))],
      centres = groups.map((g, i) => ({
        x: cx + r * 0.32 * Math.cos((i * 2 * Math.PI) / groups.length),
        y: cy + r * 0.32 * Math.sin((i * 2 * Math.PI) / groups.length),
      }));
    d.rows.forEach((row, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / d.rows.length,
        x = cx + r * Math.cos(angle),
        y = cy + r * Math.sin(angle),
        to = centres[row.group],
        g = group();
      const path = a.el(
        "path",
        {
          d: `M${x},${y} Q${cx},${cy} ${to.x},${to.y}`,
          fill: "none",
          stroke: v.color(row.group),
          "stroke-width": 1.5,
        },
        null,
        g,
      );
      const node = a.el(
        "circle",
        { cx: x, cy: y, r: v.small ? 4 : 7, fill: v.color(row.group) },
        null,
        g,
      );
      mark(
        g,
        node,
        `${v.name(row.name)} → ${v.name(d.groupNames[row.group])}\n${row.value} ${v.unit}`,
        i,
        d.rows.length,
      );
    });
    centres.forEach((q, i) => {
      const g = group(),
        node = a.el(
          "circle",
          {
            cx: q.x,
            cy: q.y,
            r: v.small ? 22 : 40,
            fill: v.color(i),
            stroke: p.background,
            "stroke-width": 2,
          },
          null,
          g,
        );
      label(
        g,
        q.x,
        q.y + 5,
        v.name(d.groupNames[i]) === "Southwest" && v.small
          ? "SW"
          : v.name(d.groupNames[i]),
        {
          "text-anchor": "middle",
          "font-size": v.small ? 12 : 18,
          style: `fill:${MBB.ink(v.color(i))}`,
        },
      );
      mark(
        g,
        node,
        `${v.name(d.groupNames[i])}\n${d.rows.filter((r) => r.group === i).length} ${v.zh ? "条记录" : "records"}`,
        i,
        centres.length,
      );
    });
    label(
      base,
      4,
      2 * r + 95,
      v.zh
        ? "每个外点和连线保留一条原始归属"
        : "Each outer node and line keeps one membership",
      { "font-size": v.small ? 12 : 17 },
    );
  },
);
Core.install(
  "membership-columns",
  (d, w) =>
    80 +
    Math.max(
      ...[0, 1, 2, 3].map((g) => d.rows.filter((r) => r.group === g).length),
    ) *
      (w < 720 ? 76 : 60),
  (v) => {
    const { a, d, w, p, base, group, label, mark } = v,
      groups = [...new Set(d.rows.map((r) => r.group))],
      cols = v.small ? 2 : groups.length,
      cw = w / cols,
      block =
        70 +
        Math.max(
          ...groups.map((id) => d.rows.filter((r) => r.group === id).length),
        ) *
          60;
    groups.forEach((id, k) => {
      label(
        base,
        v.small ? 60 + (k % cols) * (w - 120) : (k % cols) * cw + cw / 2,
        Math.floor(k / cols) * block + 25,
        `${v.name(d.groupNames[id])}`,
        {
          "text-anchor": "middle",
        },
      );
      const members = d.rows.filter((r) => r.group === id);
      members.forEach((row, i) => {
        const g = group(),
          x = v.small ? 60 + (k % cols) * (w - 120) : (k % cols) * cw + cw / 2,
          y = Math.floor(k / cols) * block + 68 + i * 60,
          node = a.el(
            "circle",
            { cx: x, cy: y, r: v.small ? 5 : 7, fill: p.data },
            null,
            g,
          );
        if (i)
          v.stroke(base, x, Math.floor(k / cols) * block + 40, x, y, p.grid, 1);
        label(g, x, y + 24, v.name(row.name), {
          "text-anchor": "middle",
          "font-size": v.small ? 12 : 16,
        });
        mark(
          g,
          node,
          `${v.name(row.name)} → ${v.name(d.groupNames[id])}\n${row.value} ${v.unit}`,
          i,
          members.length,
        );
      });
    });
  },
);
for (const type of ["rank-paths", "parallel-measures"])
  Core.install(
    type,
    (d, w) => 620 + d.rows.length * 30,
    (v) => {
      const { a, d, w, p, base, group, label, mark } = v,
        rank = type === "rank-paths",
        dims = rank ? d.dates : d.dimensions,
        top = 60,
        bottom = 440,
        left = 52,
        right = w - 25,
        domains = rank
          ? []
          : dims.map((_, j) =>
              Core.extent(
                d.rows.map((r) => r.values[j]),
                d.domains?.[j],
              ),
            ),
        x = (i) => left + (i / (dims.length - 1)) * (right - left),
        y = (q, j = 0) =>
          rank
            ? top + ((q - 1) / (d.rows.length - 1)) * (bottom - top)
            : bottom -
              ((q - domains[j][0]) / (domains[j][1] - domains[j][0])) *
                (bottom - top);
      dims.forEach((dim, i) => {
        v.stroke(base, x(i), top, x(i), bottom, p.grid, 1);
        label(base, x(i), bottom + (rank ? 30 : 56), rank ? dim : v.name(dim), {
          "text-anchor":
            i === 0 ? "start" : i === dims.length - 1 ? "end" : "middle",
          "font-size": v.small ? 12 : 17,
        });
      });
      if (rank)
        Array.from({ length: d.rows.length }, (_, i) => i + 1).forEach((q) =>
          label(base, left - 10, y(q) + 4, String(q), {
            "text-anchor": "end",
            "font-size": 13,
          }),
        );
      else
        domains.forEach((domain, j) =>
          [domain[0], domain[1]].forEach((q, k) =>
            label(base, x(j), k ? top - 15 : bottom + 24, String(q), {
              "text-anchor": "middle",
              "font-size": 12,
            }),
          ),
        );
      // Fade the complete ranking layer together: independently fading crossing
      // paths can reverse a few palette-quantized pixels near the final frame.
      const rankingLayer = rank ? group() : null;
      if (rankingLayer) a.step(rankingLayer, 1200, 4800);
      const register = rank
        ? (node, target, label, i, n, more = {}) => {
            node.style.opacity = "1";
            if (node.tagName === "path") node.style.pointerEvents = "stroke";
            return a.mark(node, { target, label, ...more }, 1200, false);
          }
        : mark;
      d.rows.forEach((row, i) => {
        const g = rankingLayer ? a.el("g", {}, null, rankingLayer) : group(),
          points = row.values.map((q, j) => [x(j), y(q, j)]),
          color = v.color(i),
          path = a.el(
            "path",
            {
              d: Core.path(points),
              fill: "none",
              stroke: color,
              "stroke-width": 2.5,
            },
            null,
            g,
          );
        register(
          path,
          path,
          `${v.name(row.name)}\n${row.values.map((q, j) => `${rank ? dims[j] : v.name(dims[j])}: ${q}`).join("\n")}`,
          i,
          d.rows.length,
          { kind: "ribbon", valueCount: dims.length },
        );
        points.forEach((q, j) => {
          const point = a.el(
            "circle",
            { cx: q[0], cy: q[1], r: 4, fill: color },
            null,
            g,
          );
          register(
            point,
            point,
            `${v.name(row.name)} · ${rank ? dims[j] : v.name(dims[j])}\n${q ? row.values[j] : ""} ${rank ? (v.zh ? "名" : "rank") : v.unit}`,
            i * dims.length + j,
            d.rows.length * dims.length,
          );
        });
      });
      Core.legend(v, d.rows, 535);
    },
  );
