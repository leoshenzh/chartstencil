"""Build offline charts from JSON using only Python's standard library."""
import argparse, html, json, math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = json.loads((ROOT / "references/catalog.json").read_text(encoding="utf-8"))
MODULES = MANIFEST["modules"]
SUPPORTED = {item["type"] for item in MANIFEST["charts"]}
PALETTES = ["default", "blue", "botanical", "grayscale", "spotlight"]

def require(condition, message):
    if not condition:
        raise ValueError(message)

def validate(spec):
    kind, d = spec["type"], spec["data"]
    require(kind in SUPPORTED, "Unsupported chart type: " + kind)
    for key in ["title", "subtitle", "source", "description", "footnote"]:
        require(isinstance(spec.get(key, ""), str), "Missing text: " + key)
    require(isinstance(d, (dict, list)), "Data must be an object or array")
    # Detailed shapes are documented in references/catalog.json.
    # Checking all number leaves also rejects JSON NaN/Infinity before HTML emission.
    def finite(x):
        if isinstance(x, dict):
            for v in x.values(): finite(v)
        elif isinstance(x, list):
            for v in x: finite(v)
        elif type(x) in (int, float):
            require(math.isfinite(x), "Data contains NaN or Infinity")
    finite(d)
    if kind == "sankey" and d.get("links"):
        for side, key in [("inputs", "source"), ("outputs", "target")]:
            for link in d["links"]:
                require(type(link[key]) is int and 0 <= link[key] < len(d[side]), "Invalid Sankey node index")
                require(type(link["value"]) in (int, float) and link["value"] >= 0, "Invalid Sankey flow")
            for i, row in enumerate(d[side]):
                require(math.isclose(row["value"], sum(x["value"] for x in d["links"] if x[key] == i),
                                     rel_tol=1e-9, abs_tol=1e-9), "Sankey links must balance at every node")

def build(spec, destination, theme="dark", palette=None, lang="zh"):
    validate(spec)
    palette = palette or spec.get("palette", "default")
    require(theme in ["dark", "light"] and palette in PALETTES and lang in ["zh", "en"], "Invalid appearance setting")
    config = dict(kind=spec["type"], type=spec["type"], data=spec["data"],
                  title=spec.get("title", ""), description=spec.get("description", ""), theme=theme, lang=lang)
    for key in ["brand", "appearance", "labels"]:
        if key in spec: config[key] = spec[key]
    if spec.get("editorial"):
        config.update(editorial=True, annotation=spec.get("annotation", ""))
    if palette != "default":
        config["palette"] = palette
    css = (ROOT / "assets/runtime/foundation.css").read_text(encoding="utf-8")
    runtime = "\n".join((ROOT / "assets/runtime" / f).read_text(encoding="utf-8")
                        for f in ["colors.js", "foundation.js", "theme-toggle.js"])
    charts = "\n".join((ROOT / "assets/charts" / (f + ".js")).read_text(encoding="utf-8")
                       for f in MODULES)
    licenses = "\n".join((ROOT / p).read_text(encoding="utf-8") for p in ["LICENSE", "vendor/d3/LICENSE"])
    charts = "/* " + licenses.replace("*/", "* /") + " */\n" + (ROOT / "vendor/d3/d3.min.js").read_text(encoding="utf-8") + "\n" + charts
    ui = (ROOT / "assets/controls.js").read_text(encoding="utf-8")
    encoded = json.dumps(config, ensure_ascii=False, allow_nan=False).replace("<", "\\u003c")
    title, subtitle, source, description = [html.escape(spec.get(k, "")) for k in ["title", "subtitle", "source", "description"]]
    footnote = html.escape(spec.get("footnote", ""))
    demo_note = "演示数据 · 所有名称和数字均为虚构。" if spec.get("synthetic") else ""
    page = f"""<!doctype html><html lang="{lang}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title><style>{css}
.chart-card h1:empty,.subtitle:empty,.footnote:empty,.source:empty,.signature:empty{{display:none}}.public-controls{{padding:12px;display:flex;gap:12px;align-items:center;flex-wrap:wrap}}select{{font:inherit;padding:8px}}.public-controls button{{min-height:42px}}@media print{{.public-controls,.theme-bar,.description{{display:none}}}}
</style><body><main><article class="chart-card {theme}"><h1>{title}</h1><p class="subtitle">{subtitle}</p><svg class="plot"></svg><div class="mobile-values"></div>
<p class="footnote">{footnote}</p><p class="source">{source}</p><p class="signature">{demo_note}</p></article>
<div class="public-controls"><label>配色 <select id="palette"><option value="default">经典蓝</option><option value="blue">单色蓝</option><option value="botanical">植物绿</option><option value="grayscale">黑白灰</option><option value="spotlight">重点强调</option></select></label><button id="replay" type="button">重播动画</button><button id="export-svg" type="button">导出 SVG 图形</button><span id="export-status" role="status"></span></div>
<details class="description"><summary>图表说明</summary><p>{description}</p><p>切换主题或配色不会改变数据。SVG 导出只含图形；完整图卡可使用浏览器打印或截图。</p></details></main><div class="tooltip" role="tooltip" hidden></div>
<script>{runtime}\nconst CHART_CONFIG={encoded};\n{charts}\n{ui}</script></body></html>"""
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(page, encoding="utf-8")
    return destination

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    choice = parser.add_mutually_exclusive_group(required=True)
    choice.add_argument("--input", type=Path, help="Caller-supplied chart JSON")
    choice.add_argument("--list", action="store_true", help="List supported chart types")
    parser.add_argument("--out", type=Path, default=Path("out"), help="Output directory")
    parser.add_argument("--theme", choices=["dark", "light"], default="dark")
    parser.add_argument("--palette", choices=PALETTES)
    parser.add_argument("--lang", choices=["zh", "en"], default="zh")
    args = parser.parse_args()
    if args.list:
        print("\n".join(sorted(SUPPORTED)))
        return
    spec = json.loads(args.input.read_text(encoding="utf-8"))
    output = build(spec, args.out / (args.input.stem + ".html"), args.theme, args.palette, args.lang)
    print(output)

if __name__ == "__main__":
    main()
