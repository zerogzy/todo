# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

采用 Next.js App Router、Server Components、Server Actions、JavaScript、官方 Notion SDK 和普通 CSS；检查使用 ESLint 与 Node 内置测试。

## Product Purpose

todo 是 Notion 任务管理器的轻量网页入口，负责快速查看、新增、勾选完成与恢复未完成。Notion 是唯一持久化数据源。

## Operating Context

任务数据库使用“任务”“完成”“截止日期”“备注”“优先级”“完成时间”和 Notion 原生 ID 编号，编号从 1 开始。任务标题链接打开 Notion；搜索、复杂编辑、删除及回收站管理继续在 Notion 中完成，网页平铺子任务。

## Capabilities and Constraints

全屏固定外壳、可折叠侧栏、独立滚动的纯白任务区及 800px 五列表格；窄屏可横向滚动。待完成／已完成独立菜单及回收站说明页，手机抽屉导航。仅待完成视图可打开原生新增对话框，字段为标题、日期、优先级（高／中／低，默认中）及备注，使用现成中文日期选择。逾期与完成时间使用 Asia/Shanghai；已完成显示“于YYYY/MM/DD HH:mm完成”，缺失或异常时间明确提示，并提供“恢复未完成”。网页与 Server Action 均不提供删除，回收站保留 Notion 说明与入口；移除顶部刷新，保留错误重试。保留表单输入、准确反馈失败、支持手机和键盘。Token 仅在服务端，不开发访问控制。

## Accessibility & Inclusion

可见焦点、可理解控件名称、文字逾期提示、状态宣布、对话框焦点管理及 320px 窄屏可操作。
