# Blog Status

## Snapshot

- 日期：2026-03-24
- 当前工作目录：`/Users/tazdingo/Dingo Projetcts/dingo-den`
- 当前聚焦：`single-repo AI blog`
- 最新结构调整：`cbf550f` — `refactor(blog): collapse repo back to single app`
- 最近一轮视觉基线：`e334936` — `feat(blog): redesign editorial layout`

## 当前完成情况

### 已完成

- 博客首页完成第一轮 editorial 风格改版
- 文章页完成第一轮阅读版式改版
- 归档页与 About 页完成风格统一
- Header / Footer / 导航 / 主题切换完成基础统一
- 全局设计 token 已初步收束
- 字体系统已从外链字体方案回收为更统一的 sans / serif / mono 结构
- 正文中的代码块、引用块、提示块与表格样式已完成一轮统一收口
- 已建立 blog 专属 docs 目录与 handoff 文档，可支持新 session 接手
- single repo 下的文档路径已与当前仓库结构重新对齐
- 站点基础 metadata 已补齐到页面与文章级别（title / og / twitter / article time）
- 首页首屏、Header 与文章页完成一轮移动端节奏优化
- 已补齐 Vercel 发布所需的站点 URL 配置回退逻辑
- 站点对外定位已从 frontend 调整为 AI / agents / applied AI
- 已产出 Obsidian → blog 自动发布方案 v1，明确 GitHub repo 为主数据源

### 进行中

- 移动端和真实内容下的样式复查
- 首页首屏在真实设备宽度下的层级微调

### 还未完成但明确需要做

- 代码块主题升级
- 更完整的正文元素样式体系（表格、引用、图片等）
- 移动端更细致的视觉检查（主要剩真实设备复核）
- 内容策略和写作规范补齐
- 真实域名确定后的 canonical / OG URL / sharing image 收口

## 当前风格判断

目前站点已经从“默认博客模板感”明显转向：

- 更安静
- 更像个人刊物
- 更强调首屏气质与阅读层级

但还没有完全成熟，主要还差：

- 正文细节完成度
- 文章内容数量与封面策略

## 已知问题 / 风险

- 当前文章数量较少，很多列表页的气质还依赖版式而不是内容密度
- 视觉系统虽已成型，但还需要更多真实内容验证

## 建议的状态更新节奏

每完成以下任一事项，就更新一次 `status.md`：

- 一个页面级改版完成
- 一轮阅读体验优化完成
- 一轮文档或内容规范完成
- 一个明确的技术/视觉方向被放弃或替换
