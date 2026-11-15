# 开源代码归属

`app/globals.css` 的表单控件、字体继承、按钮过渡、textarea 垂直缩放、禁用状态和基础交互写法局部改编自 **Water.css 2.1.1**，作者 Kognise，MIT 许可。

- 源码：https://github.com/kognise/water.css
- 固定版本：https://cdn.jsdelivr.net/npm/water.css@2.1.1/out/light.css
- 许可原文：https://cdn.jsdelivr.net/npm/water.css@2.1.1/LICENSE.md
- 本地完整许可：[licenses/water-css-MIT.md](licenses/water-css-MIT.md)
- 修改：合并重复规则，移除上游未使用样式，改为项目颜色与布局变量，新增焦点 outline、44px 控件区域、窄屏布局及原生 dialog。全部样式本地提供，不依赖运行时 CDN。

TodoMVC 仅用于理解任务行交互，没有复制 JSX 或样式；不使用其 CC BY 4.0 的 `todomvc-app-css`。本项目未引入 Tailwind、Sass、Chakra 或额外 UI 组件库。

## Todo layout (actual source adaptation)

Source: [thepuskar/todoist-clone](https://github.com/thepuskar/todoist-clone/tree/116d18c4f23a66e84dab19e90a88f0be49d8a9d1), MIT © 2020 Puskar Adhikari. [Full license](licenses/todoist-clone-MIT.md).

| Upstream file | Local adaptation |
| --- | --- |
| src/components/layout/Content.js | app/page.js: content section containing Sidebar and Tasks (subsequently moved to todo-shell.js) |
| src/components/layout/Sidebar.js | sidebar / sidebar__generic list, active item, span labels; native links replace div buttons |
| src/components/Tasks.js | tasks container, heading, tasks__list map and keyed rows, existing Server Actions replace Firebase hooks |
| src/App.scss: sidebar, content, tasks | app/globals.css: expanded generic navigation / active / hover / grid / task-list rules |

Fixed source downloaded and compared before adapting. Removed projects, collated calendar filters, contexts, Firebase, CRA, icons, logo, remote fonts and old dependencies. Responsive grid replaces fixed width/offsets; existing validation and state server actions retained; task deletion and its confirmation dialog removed in stage 16. Water.css still supplies the adapted base controls, typography and dialogs above; it is no longer the main layout source.

Stage 12: Sidebar.js/Content.js adapted structure now lives in `app/components/todo-shell.js`; `Tasks.js` keyed list remains in task-list.js, task-board.js selects status views. Native `<dialog>` supplies the mobile modal drawer and focus trap. URL state uses browser history; no UI framework or client API layer added.

## Date picker and copied example

[react-datepicker 9.1.0](https://github.com/Hacker0x01/react-datepicker/tree/8fa1a80ebceda95516606164843b25d47e857ce5), MIT © 2014–2025 HackerOne Inc and individual contributors. [Full license](licenses/react-datepicker-MIT.md). Published npm version/peer metadata checked: React/React DOM 19 supported; date-fns-tz is optional and not needed for single calendar days. Direct dependencies locked: react-datepicker 9.1.0, date-fns 4.1.0 (MIT, locale/parse/format); Floating UI and clsx are transitive runtime dependencies in package-lock.json. No Sass build tool required.

Copied the fixed README Installation example (`DatePicker selected={startDate} onChange={date => setStartDate(date)}`) into `app/components/date-field.js` and its controlled parent `new-task.js`. Imported package CSS in `app/layout.js`; zhCN locale from date-fns. Adaptations: optional date string, exact format, clear, Chinese accessible labels, raw invalid text preservation, form errors/pending, local calendar-day formatting. `lib/date-input.js` only adapts the field value; no month/leap/keyboard calendar algorithms copied or reimplemented. Vendor state styles retained; small plain CSS overrides scoped to vendor classes.

Stage 17: the adapted Sidebar/Content shell remains in todo-shell.js, expanded to full viewport with independently scrolling white main area. The former Tasks keyed-list rendering now maps keyed table rows in task-list.js; the five-column semantic HTML table and ordinary CSS grid lines are project-specific adaptations, not copied spreadsheet-library code. The modal creation form uses native dialog and the already adopted DatePicker example. DateField adds only Escape coordination inside the dialog; all date/calendar logic stays in the existing package. No new dependency was added.
