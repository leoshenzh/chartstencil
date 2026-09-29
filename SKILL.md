---
name: chartstencil
description: Render caller-supplied data with 119 generic chart templates, five palettes, light/dark themes, offline HTML and editable SVG export. Use for chart formatting, Sankey flows, rankings, compositions, matrices, distributions, networks and time series. Does not supply business content, datasets or conclusions.
---

# ChartStencil

A chart template and rendering tool. The caller supplies the data and all business content.

## Procedure

1. Read the requested chart type, input data, labels and units. Do not invent numbers, titles, analysis, recommendations or source statements.
2. Consult `references/chart-catalog.md` and the corresponding shape in `references/catalog.json`. Read that type's implementation for optional modes and constraints.
3. Write an input JSON with `type` and `data`. Add `title`, `subtitle`, `description`, `source`, or `footnote` only when supplied by the caller. Omitted text stays blank.
4. Run `python3 scripts/build.py --input INPUT.json --out OUTPUT_DIR --theme dark --palette default`.
5. Inspect the actual page at the target width. Check rendering, label fit, units, flow balance and whether the output matches the supplied values. The builder performs basic checks, not exhaustive per-type validation.
6. Deliver the HTML and input JSON. The page exports editable SVG geometry; it does not include surrounding title/source text in that SVG.

## Appearance

- Themes: dark, light.
- Palettes: default, blue, botanical, grayscale, spotlight.
- Optional `brand` accepts six-digit hex colors; the engine adjusts contrast.
- Some encodings use their own ordinal or semantic colors.
- Bilingual labels use `["Chinese", "English"]`. `--lang` selects, rather than translates, these entries.
- Use `python3 scripts/build.py --list` to enumerate every type.

## Scope

Includes templates, styles, renderer, controls, data-shape references, and locally vendored D3.
Includes no geographic maps, business datasets, example narratives, report/PPT workflows, or private service dependencies.
Do not add content to make an empty chart look complete. Request missing data when the chosen template needs it.
Keep LICENSE, NOTICE.md and vendor/d3/LICENSE with redistributed files.
