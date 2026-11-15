---
name: todo
description: 轻量 Notion 任务入口的现行视觉规范
colors:
  paper: '#fff'
  surface: '#fff'
  sidebar: '#fafafa'
  ink: '#24332f'
  muted: '#59665f'
  line: '#d7ddd6'
  accent: '#245c45'
  danger: '#a13428'
  focus: '#336bba'
  button-hover: '#e7ede6'
  primary-hover: '#194331'
  delete-hover: '#f9e9e4'
  selection: '#c7dfcb'
  backdrop: '#17281e80'
  dialog-shadow: '#17281e33'
  scrollbar: '#94a098'
typography:
  title:
    fontFamily: system-ui, sans-serif
    fontSize: 1.5rem
    fontWeight: 600
    lineHeight: 1.6
  section:
    fontFamily: system-ui, sans-serif
    fontSize: 1.125rem
    fontWeight: 600
    lineHeight: 1.6
  form-title:
    fontFamily: system-ui, sans-serif
    fontSize: 1rem
    fontWeight: 600
    lineHeight: 1.6
  body:
    fontFamily: system-ui, sans-serif
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6
  navigation:
    fontFamily: system-ui, sans-serif
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: system-ui, sans-serif
    fontSize: .875rem
    fontWeight: 400
    lineHeight: 1.6
  help:
    fontFamily: system-ui, sans-serif
    fontSize: .8rem
    fontWeight: 400
    lineHeight: 1.6
  brand:
    fontFamily: system-ui, sans-serif
    fontSize: 1.5rem
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -.03em
rounded:
  square: '0'
  control: 6px
  dialog: 12px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  section: 32px
components:
  button-default:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.control}'
    padding: 10px 12px
  button-primary:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.surface}'
    rounded: '{rounded.control}'
    padding: 10px 24px
  button-primary-hover:
    backgroundColor: '{colors.primary-hover}'
  input:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.control}'
    padding: 10px 12px
    width: 100%
  navigation-active:
    backgroundColor: '{colors.button-hover}'
    textColor: '{colors.accent}'
    rounded: '{rounded.control}'
    padding: 12px
    typography: '{typography.navigation}'
  dialog:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.dialog}'
    padding: 24px
  drawer:
    backgroundColor: '{colors.sidebar}'
    textColor: '{colors.ink}'
    rounded: '{rounded.square}'
    height: 100dvh
---

# Design System: todo

## Overview

以任务操作与录入为中心，采用白色与近白色阅读面、深绿色主要操作和系统字体。现行界面从 thepuskar/todoist-clone 固定源码（116d18c）克隆并适配布局，基础控件保留 Water.css 改写的普通 CSS；来源与逐文件映射见 `docs/third-party.md`。不另设视觉隐喻或品牌包装。

**Key Characteristics:**
- 固定全屏外壳、可收起侧栏与独立滚动的纯白任务区。
- 待完成、已完成和回收站说明页独立导航；手机使用模态抽屉。
- 现成中文单日日期选择、清楚的键盘焦点与文字状态。

## Colors

颜色以前置 token 为准；基础颜色对应 `app/globals.css` 的 CSS 变量，其余记录当前局部样式。

### Primary

- **深绿色（accent）**：新增任务、标题链接、完成复选框、成功状态、光标与日期选中态。
- **深绿悬停色（primary-hover）**：主要按钮悬停反馈。

### Neutral

- **白色纸面（paper）**、**白色表面（surface）**、**侧栏浅灰（sidebar）**：分别承载页面、任务与控件、导航。
- **深色正文（ink）**、**灰绿辅助文字（muted）**：区分任务标题与日期、备注、计数、说明。
- **浅色分隔线（line）**：划分表格单元格、表单与侧栏。
- **浅绿悬停色（button-hover）**：普通按钮悬停、当前导航和日期悬停。
- **浅绿选区（selection）**、**灰绿滚动条（scrollbar）**：浏览器文字选区与滚动条。

**红色（danger）**表达错误与逾期，配合文字提示；delete-hover 为既有 token，当前界面未使用。**蓝色（focus）**仅承担可见焦点。**遮罩（backdrop）**与**阴影色（dialog-shadow）**用于模态层。

## Typography

统一使用系统无衬线字体，不加载网络字体。正文使用浏览器默认相对字号；body token 记录其常规（1rem）基准，保留用户字号偏好。

侧栏品牌与当前视图标题使用 title 的字号，品牌额外使用 brand 的紧字距。新增对话框标题使用 section。侧栏使用 navigation，选中时字重 600。字段标签、任务日期、备注、视图计数使用 label；日期帮助文字使用 help。

任务标题链接加粗（600），保留下划线与悬停加粗下划线。日期采用等宽数字，备注保留换行。已完成任务通过独立视图与勾选状态表达，标题仍使用当前任务链接样式。

## Layout

外壳固定为 100vw × 100dvh（100vh 回退），页面本身不滚动。桌面侧栏宽 240px，收起后保留 64px 导航切换栏，以 240ms cubic-bezier(.22, 1, .36, 1) 平滑过渡。任务区独立滚动、纯白底，内边距 48px 32px 72px，内部最大宽度 800px 并居中。

宽度不超过 760px 时保留 56px 导航栏；菜单打开左侧原生模态抽屉，宽度上限 300px，距视口右缘至少 32px，高度 100dvh。手机任务区内边距 32px 16px 48px。标题与计数允许换行。

表格固定 800px，五列 CSS 宽度依次为 56／128／299／72／244px，加上折叠边框后整体宽度为 800px。窄屏通过可聚焦的容器横向滚动；表头居中，单元格使用 1px 边框及 14px 12px 内边距。新增对话框表单为两列，标题、备注与操作区跨列；不超过 520px 时为单列。回收站说明行宽上限 65ch。

## Elevation & Depth

常规界面保持平面，以白色与近白色表面、留白和细分隔线组织层级。原生新增对话框与导航抽屉继承模态阴影（`0 16px 64px #17281e33`）与 backdrop 遮罩。日历沿用 react-datepicker 供应商样式，其弹层层级（z-index: 10），不另造阴影系统。

## Shapes

按钮、输入框与导航链接使用 control 小圆角；新增对话框使用 dialog 较大圆角；左侧抽屉为 square 直角。输入框与普通按钮使用细边框（1px）。任务表格使用单元格边框，不使用阴影卡片。日历保留供应商日期格与月份导航的形状，仅作局部适配。

## Components

### Buttons

普通按钮使用白色表面；添加任务与创建任务按钮使用深绿实底；恢复按钮使用透明底与深绿文字。按钮最小高度（44px）。禁用时降低不透明度（.55）并显示不可用指针。背景过渡（.1s linear），减少动态效果偏好下关闭。

### Inputs / Fields

标签位于字段上方。输入框撑满可用宽度，备注可纵向调整，最小高度（88px）。错误使用红色边框与文字反馈。可聚焦控件使用外偏移（3px）的蓝色轮廓（3px）。

日期使用 react-datepicker（9.1.0）及自带 CSS、中文 locale，提供单日选择、严格 YYYY-MM-DD 手输、清空与键盘选择。保留供应商状态样式，只覆盖字体、主操作色、宽度与月份按钮；底部起始边对齐弹层，最大宽度为视口减（24px）。月份与清空按钮最小高度（32px），输入右侧为清空控件留出（36px）。

### Navigation

侧栏链接包含名称与真实计数，当前项使用浅绿底和深绿文字，并带 aria-current。待完成与已完成通过 URL 的 view 状态独立显示；回收站只提供 Notion 数据库入口和管理说明，没有列表或计数。桌面按钮收起导航，手机按钮打开原生模态抽屉；关闭后焦点返回触发按钮。顶部不设刷新按钮，读取错误保留重试。

### Task List

五列表头为“#”“截止日期”“活动 / 计划 / 任务”“优先级”“完成情况”。编号显示 Notion 原生 ID 数字，缺失显示“—”；日期显示斜杠格式，缺失显示“—”。内容列显示标题链接与备注。优先级为高／中／低，未知值显示“未设置”。复选框 20px，点击区至少 44px；逾期同时使用红色与“已逾期”文字。

已完成列表独立显示，以 Asia/Shanghai 显示“于YYYY/MM/DD HH:mm完成”，缺失时间显示“已完成 · 时间未记录”，异常时间显示“已完成 · 时间异常”，并提供“恢复未完成”。保存结果提供文字状态与目标视图链接。网页无删除控件；回收站仅提供 Notion 说明与数据库入口。

### Create Dialog

仅待完成视图显示“添加任务”，打开原生模态 dialog；已完成与回收站不可新增。宽度上限 600px，与视口边缘至少相距 16px；高度受动态视口限制并允许内部滚动。字段为标题、可选截止日期、优先级（高／中／低，默认中）与可选备注。打开后聚焦标题，关闭返回触发按钮；草稿在视图切换时保留，成功创建后清空。异步期间禁用相关操作并阻止取消，失败保留输入与文字错误。日历打开时 Escape 先关闭日历，再按可关闭对话框。

## Do's and Don'ts

### Do:

- **Do** 沿用系统字体、普通 CSS、现有控件和来源记录。
- **Do** 为错误、逾期与异步结果提供可理解的文字反馈。
- **Do** 保留可见键盘焦点、触控区域、窄屏文字换行与对话框焦点管理。
- **Do** 保留日期组件的选中、键盘选中、禁用与中文月份导航状态。

### Don't:

- **Don't** 只依靠颜色表达任务状态。
- **Don't** 将普通任务行改成带阴影的卡片。
- **Don't** 将已完成任务放回底部折叠区，或给回收站编造任务列表与计数。
