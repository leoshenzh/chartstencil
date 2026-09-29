# 输入格式

每个输入文件生成一张图。工具包不提供数据集；使用者负责提供数据、单位和文字。

## 顶层字段

| 字段 | 是否必填 | 含义 |
| --- | --- | --- |
| type | 是 | 图型标识，见 chart-catalog.md |
| data | 是 | 该图型要求的对象或数组 |
| title / subtitle | 否 | 使用者提供的标题、指标说明；省略留空 |
| description / source / footnote | 否 | 使用者提供的说明、来源、脚注；省略留空 |
| palette | 否 | default / blue / botanical / grayscale / spotlight |
| brand | 否 | 六位十六进制颜色或颜色角色对象 |
| appearance | 否 | 可选 magazine 外观 |
| editorial / annotation | 否 | 明确开启图内文字标注，并提供文字 |
| synthetic | 否 | true 时追加虚构数据标识，不会生成数据 |
| labels | 否 | bubbles 模板的轴名、单位、范围等显示设置 |

多语言名称通常使用长度为 2 的字符串数组；中文在前、英文在后。单语言使用者可将两项设成相同文字。数值必须有限；不做隐含币种、数量级或语言换算。

## 完整结构

`catalog.json` 按图型列出实现文件、已支持的输入结构以及新增的通用显示字段。结构仅列字段名和类型，没有任何原始值；它不是覆盖全部限制的严格校验器。请结合对应实现检查数量、颜色、范围与布局约束。

## 主要编码约束

| 图型 | 输入要求 |
| --- | --- |
| sankey | inputs / outputs 含 name,value；links 的 source,target 是从 0 开始的下标；每个节点连接数量守恒 |
| ribbons | names、before、after 等长；years 为两个阶段标签；值非负 |
| nested-voronoi | groups 内 rows 含 name,value；面积值为正 |
| mekko | stack 模式按 columns 的总量决定宽度；growth 模式使用其专门结构 |
| unit-flow | 每个点对应 unitValue；每组 value 应可被该单位整除 |
| bubble-matrix | 每行 values 对应 columns；可用 colors 另编码颜色；声明单位和色阶范围 |
| trajectory | periods 中使用 period,x,y,size,level；x/y 为 0–1 的归一化坐标，level 为 1–5；提供 xLabel、yLabel、sizeLabel、sizeUnit、levelLabel |
| aligned-metrics | 每行 values 为两期值；metric1、metric2、metric3 为辅助指标；用 metricLabels 命名 |
| aligned-stack | 每行 values 为构成值；metric 为辅助数值，metricMax 为其上界；stackMax 默认 100；stackLabel、metricLabel、metricUnit 自定义文字 |
| radial-timeline | rows 含 name,value；unit 和 centerLabel 由输入提供 |
| timeseries | times、series、yDomain、xTicks 对应时间与数值；unit 由输入提供；today 的标注取实际输入值 |
| stacked-ledger | ordinal 使用五级色阶时选择 blue；类别超过颜色数时需分面 |
| component-diagram | figure 为使用者提供的示意轮廓，parts 为标注点；这是部件示意模板 |

bubbles 保留元组输入：每行依次为中文名、英文名、x、y、size，可选第六项控制标签位置。顶层 labels 可提供 xLabel、yLabel、sizeLabel、sizeUnit、yUnit、xDomain、yDomain、sizeMax。默认 x 范围 0–1、y 范围 0–50；范围与单位应按实际数据设定。

百分比、归一化分数、区间和单位点阵属于不同编码，不能只换单位名称就当作同一种数据。模板不会自动推断行业口径、编造缺失值或补充结论。

## 可选的通用标注

显示字段放在 `data` 中，多语言文字仍使用中英文两项数组。`drop-scatter` 可传 xLabel/yLabel、xUnit/yUnit 和 xDomain/yDomain（缺省均为 0–100）；`quadrant-area` 可传 xLabel/yLabel。`status-yearbook` 的 statusLabels 对应状态 0–2，`lifecycle-history` 的 stateLabels 对应状态 0–3；省略时仅使用编号状态名。日历热图和分段读数图的 metricLabel、按时期展开图的 periodLabel/note 均由调用者提供。区间直方图可传 binUnit/countUnit；grouped-bars 和 slope 可传 unit/deltaUnit；stacked-area 的 endChanges 可传 changeUnit。缺省时不补行业含义、完整样本声明、机构数量或虚构单位。
