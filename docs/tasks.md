# Blog Tasks

## 使用规则

- `[ ]` 未开始
- `[~]` 进行中
- `[x]` 已完成

优先级说明：

- P1：当前必须推进
- P2：重要，但可排在下一轮
- P3：长期优化项

## P1 — 当前重点

- [x] 将仓库从 monorepo 形态收回为 blog single repo
- [x] 清理 single repo 后残留的旧多 app / `apps/kana` 文档引用

- [x] 统一字体系统，明确正文 / 标题 / 代码字体角色
- [~] 复查首页首屏在桌面与移动端的层级和节奏
- [x] 统一正文中的代码块、引用块、提示块视觉语言
- [ ] 补一轮真实内容视角的样式检查（至少基于现有两篇文章）
- [x] 将站点对外文案从 frontend 方向调整为 AI / agents 方向
- [ ] 明确文章摘要、标题、分类路径的写作规则
- [x] 建立 blog 项目文档结构
- [x] 完成首页 / 文章页 / 归档页第一轮视觉改版
- [~] 将 Obsidian 自动导入规则调整到贴合真实 vault 结构

## P2 — 下一轮

- [ ] 给代码块引入更成熟的高亮主题
- [ ] 统一文章页图片、hero 图、说明文字的样式策略
- [x] 补全页面级 Open Graph / Twitter / article time 基础元信息
- [x] 检查并优化移动端导航与文章页边距
- [x] 为 Vercel 部署补齐 `site` URL 回退配置
- [ ] 梳理首页是否需要“精选文章 / 最新文章”更明确的关系
- [ ] 用真实 vault 目录更新 `config/obsidian-import.config.json`
- [ ] 完成第一次 GitHub Actions `Obsidian Import` 实跑
- [ ] 收敛敏感词、黑名单目录和自动发布阈值

## P3 — 后续储备

- [ ] 设计站点级 OG image 方案
- [ ] 明确 favicon / brand assets 方案
- [ ] 判断是否需要 reading time、上一篇/下一篇导航
- [ ] 判断是否需要更明确的内容分类与标签层
- [ ] 判断是否要引入更精细的文章封面策略
- [ ] 规划一个用于导入既有 Markdown 笔记并触发发布流程的 MCP 能力
- [x] 产出 Obsidian → blog 自动筛选 / 导入 / 发布方案 v1
- [x] 落地 Obsidian → blog 自动导入骨架 v1

## 任务管理原则

- 任务要尽量描述成“可直接执行的动作”
- 不把愿景口号写成任务
- 每完成一轮工作，至少同步更新 `status.md` 和 `tasks.md`
- 当优先级变化明显时，同步更新 `plan.md`
