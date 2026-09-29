# ChartStencil

通用图表模板与绘图工具。提供 **119 种图型、5 种配色、深浅模式**，将使用者传入的数据渲染为独立 HTML，并支持导出可编辑 SVG。

工具包不附带业务数据、示例故事、预设标题、分析结论或宣传配图；地理地图不包含在内。

## 获取与使用

从本仓库下载 ZIP 后解压，或克隆仓库。整个 `chartstencil` 文件夹即为可复用的 Skill；所有运行依赖均已随包提供。

需要 Python 3.8+，不需要安装 Python 依赖。浏览器渲染所需的 D3 已随包提供，可离线使用。

查看图型清单：

```sh
python3 scripts/build.py --list
```

准备自己的 JSON 文件，再生成图表：

```sh
python3 scripts/build.py --input your-data.json --out out --theme dark --palette default
```

用浏览器打开生成的 HTML。页面提供配色、深浅模式、动画重播和 SVG 导出。SVG 只包含图形，完整图卡可以保存 HTML 或使用浏览器截图。

## 输入与模板

- 必填字段：`type`、`data`。
- 可选文字：`title`、`subtitle`、`description`、`source`、`footnote`。不填写则留空。
- 图型、字段与编码约束见 [图型目录](references/chart-catalog.md) 和 [输入格式](references/data-format.md)。
- 名称、指标、单位和标注由输入决定；不同单位不自动换算。
- 配色：`default`、`blue`、`botanical`、`grayscale`、`spotlight`。
- 主题：`dark`、`light`。网页优先记住读者选择，否则使用构建主题。
- `--lang en` 选择双语字段的英文项，不自动翻译用户文字。
- 图型各有结构约束；通用表示不绑定具体行业，不表示任意数据都适合任意图型。

## 作为 Skill 使用

让支持本地 Skill 的工具加载整个文件夹，入口为 `SKILL.md`。assets、references、scripts、vendor 都需保留，安装位置按所用工具的说明选择。

本 Skill 负责套用图型、样式和输出文件，不生成业务数据或分析结论。用户需提供实际数据与所需文字。

## 许可

MIT；上游版权声明保留在 [LICENSE](LICENSE)。D3 使用 ISC，见 [NOTICE.md](NOTICE.md) 与 [vendor/d3/LICENSE](vendor/d3/LICENSE)。

项目不属于任何咨询公司，也未获得其认证。验证范围见 [RELEASE.md](RELEASE.md)。
