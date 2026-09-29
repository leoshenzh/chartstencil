/* Role palettes designed for this project; independent of external chart libraries. */
"use strict";
const MBBColors = (() => {
  const luminance = (color) => {
    const rgb = color
      .slice(1)
      .match(/../g)
      .map((x) => parseInt(x, 16) / 255)
      .map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  };
  const contrast = (a, b) =>
    (Math.max(luminance(a), luminance(b)) + 0.05) /
    (Math.min(luminance(a), luminance(b)) + 0.05);
  const mix = (a, b, t) =>
    "#" +
    [1, 3, 5]
      .map((i) =>
        Math.round(
          parseInt(a.slice(i, i + 2), 16) * (1 - t) +
            parseInt(b.slice(i, i + 2), 16) * t,
        )
          .toString(16)
          .padStart(2, "0"),
      )
      .join("");
  function accessible(color, background, minimum = 3) {
    if (!/^#[0-9a-f]{6}$/i.test(color))
      throw Error("Use a six-digit hex color");
    const end = luminance(background) > 0.179 ? "#000000" : "#ffffff";
    for (let i = 0; i <= 100; i++) {
      const candidate = mix(color, end, i / 100);
      if (contrast(candidate, background) >= minimum) return candidate;
    }
  }
  function audit(p) {
    return Object.entries({
      text: [p.text, 4.5],
      muted: [p.muted, 4.5],
      data: [p.data, 3],
      accent: [p.accent, 3],
      ...Object.fromEntries(
        ["categories", "ordinal", "diverging"].flatMap((key) =>
          p[key].map((c, i) => [key + i, [c, 3]]),
        ),
      ),
    }).map(([role, [color, minimum]]) => ({
      role,
      color,
      minimum,
      ratio: contrast(color, p.background),
      pass: contrast(color, p.background) >= minimum,
    }));
  }
  function resolve(config, base) {
    if (!config.palette && !config.brand && !config.appearance) return base;
    const dark = config.theme === "dark",
      magazine = config.appearance === "magazine";
    const background = magazine
      ? dark
        ? "#252c29"
        : "#f3f0e7"
      : base.background;
    let p = { ...base, background };
    const gray = dark
      ? ["#929292", "#aaaaaa", "#c2c2c2", "#d8d8d8", "#efefef"]
      : ["#737373", "#606060", "#505050", "#404040", "#303030"];
    const blue = dark
      ? ["#326bd4", "#277bdc", "#168ce3", "#36a1ed", "#67b6f4"]
      : ["#577faf", "#3c6caa", "#285a96", "#174779", "#103358"];
    const green = dark
      ? ["#8ba977", "#b5aa65", "#77a18e"]
      : ["#526a3e", "#796b27", "#396e60"];
    if (config.palette === "grayscale")
      p = {
        ...p,
        background: magazine ? background : dark ? "#242424" : "#ffffff",
        text: dark ? "#f5f5f5" : "#222222",
        muted: dark ? "#c5c5c5" : "#555555",
        grid: dark ? "#777777" : "#888888",
      };
    if (config.palette === "grayscale")
      p = {
        ...p,
        data: gray[2],
        accent: gray[4],
        categories: gray,
        ordinal: gray,
        diverging: [gray[0], gray[2], gray[4]],
      };
    if (config.palette === "blue")
      p = {
        ...p,
        data: blue[2],
        accent: blue[4],
        categories: blue,
        ordinal: blue,
        diverging: [blue[0], gray[2], blue[4]],
      };
    if (config.palette === "botanical")
      p = {
        ...p,
        data: green[0],
        accent: green[1],
        categories: green,
        ordinal: blue,
        diverging: [green[1], gray[2], green[0]],
      };
    if (config.palette === "spotlight")
      p = {
        ...p,
        data: gray[1],
        categories: [base.accent, ...Array(5).fill(gray[1])],
        ordinal: gray,
        diverging: [base.accent, gray[2], gray[4]],
      };
    if (config.brand) {
      const brand =
        typeof config.brand === "string"
          ? { data: config.brand, accent: config.brand }
          : config.brand;
      p = { ...p, ...brand };
      const main = brand.data || p.data;
      if (!brand.categories) p.categories = [main, ...gray];
      if (!brand.ordinal) {
        const end = luminance(p.background) > 0.179 ? "#000000" : "#ffffff";
        const start = accessible(
          mix(main, end === "#ffffff" ? "#000000" : "#ffffff", 0.85),
          p.background,
        );
        p.ordinal = [0, 0.25, 0.5, 0.75, 1].map((t) => mix(start, end, t));
      }
    }
    p.categories = [...p.categories];
    while (p.categories.length < 6)
      p.categories.push(gray[(p.categories.length - 1) % gray.length]);
    for (const role of ["text", "muted", "data", "accent"])
      p[role] = accessible(
        p[role],
        p.background,
        ["text", "muted"].includes(role) ? 4.5 : 3,
      );
    for (const role of ["categories", "ordinal", "diverging"])
      p[role] = p[role].map((color) => accessible(color, p.background));
    if (audit(p).some((r) => !r.pass))
      throw Error("Palette contrast gate failed");
    return p;
  }
  return { resolve, audit, contrast, accessible };
})();
