# Blog Handoff

## 这份文档的用途

给新的 session 快速接手这个 blog 仓库用。

目标不是复述所有历史，而是让接手者在几分钟内知道：

- 这个项目现在在做什么
- 已经做到了哪里
- 目前哪些文件最重要
- 下一步应该优先推进什么
- 运行和验证方式是什么

## 项目范围

当前聚焦对象只有：`blog`

当前仓库已经回到 blog 单仓库；不要再按 monorepo / 多 app 的方式理解它。

## 当前背景

这是一个 Astro + Tailwind 的个人博客项目，目标是把它从“之前写过、能跑的旧博客”推进成“有明确审美、可长期维护的 AI/blog 项目”。

当前设计方向已经明确：

- calm
- editorial
- restrained
- content-first
- one coherent system

简化说：

> 不要把它做成模板感强的技术站，而要做成一个安静、克制、可阅读、像个人刊物的博客。

详细原则见：`spec.md`

## 已完成的关键工作

### 1. 第一轮视觉改版已提交

已提交 commit：

- `e334936` — `feat(blog): redesign editorial layout`

这一轮已经完成：

- 首页首屏和文章列表改版
- 文章页基础阅读版式改版
- Archive / About 风格统一
- Header / Footer / navigation 基础收束
- 全局设计 token 初步收束

### 2. 字体系统与正文样式已完成一轮收口

这一轮已经合入当前仓库结构中：

- 去掉了外链的 `LXGW WenKai`
- 改为更稳定的系统 sans + classic serif + mono 三层结构
- 修正了 header 和 TOC 对衬线字体的误用
- 调整了标题字距、正文可读性和代码字体使用
- 补了一轮代码块、引用块、提示块与表格的正文样式统一

受影响的关键文件：

- `src/styles/global.css`
- `src/layouts/BaseHead.astro`
- `src/layouts/Header.astro`
- `src/components/common/table-of-contents/TableOfContentsWidget.tsx`

### 3. 文档体系已经建立

已经建立的文档：

- `README.md`
- `docs/README.md`
- `docs/spec.md`
- `docs/plan.md`
- `docs/status.md`
- `docs/tasks.md`
- `docs/handoff.md`（当前文件）

### 4. Obsidian 自动导入骨架已落地

已提交 commit：

- `90ace85` — `feat(blog): add obsidian import automation scaffold`

这一轮已经完成：

- 新增导入脚本骨架：扫描 / 候选池 / draft 生成
- 新增导入配置与状态缓存
- 新增 GitHub Actions workflow：`Obsidian Import`
- 默认私有源仓库已指向：`Taz-dingo/obsidian-vault`
- 已在本地用真实私有 vault 完成一轮 backfill / draft / build 验证

受影响的关键文件：

- `scripts/obsidian-import/index.mjs`
- `config/obsidian-import.config.json`
- `data/obsidian-candidates.json`
- `data/obsidian-import-state.json`
- `.github/workflows/obsidian-import.yml`
- `docs/obsidian-publishing-proposal.md`

## 当前工作区状态

当前仓库已经是 blog single repo，主工作目录是：`/Users/tazdingo/Dingo Projetcts/dingo-den`。

如果你是新 session，先默认按“一个仓库就是一个 blog 项目”来理解，不再需要额外切到 `apps/blog` 或依赖独立 worktree。

此前遗留的 `apps/kana` 文档已不再属于当前项目范围，可直接忽略或清理。


## 当前最重要的文件

### 设计系统 / 样式

- `src/styles/global.css`
  - 全局 token
  - 字体定义
  - 组件级样式约定
  - prose / editorial 样式

### 页面

- `src/pages/blog/index.astro`
  - 首页结构与首屏表达
- `src/pages/blog/_components/PostDetail.astro`
  - 文章阅读页核心结构
- `src/pages/archive.astro`
  - 归档扫描体验
- `src/pages/about.astro`
  - 站点自我说明

### 框架布局

- `src/layouts/BaseLayout.astro`
- `src/layouts/BaseHead.astro`
- `src/layouts/Header.astro`
- `src/layouts/Footer.astro`

### 项目文档

- `docs/spec.md`
- `docs/plan.md`
- `docs/status.md`
- `docs/tasks.md`
- `docs/obsidian-publishing-proposal.md`

## 新 session 应该先做什么

建议顺序：

1. 先读 `docs/spec.md`
2. 再读 `docs/status.md`
3. 再读 `docs/tasks.md`
4. 再读 `docs/obsidian-publishing-proposal.md`
5. 看一眼 `config/obsidian-import.config.json`
6. 看一眼 `scripts/obsidian-import/index.mjs`
7. 在仓库根目录直接跑页面 / 或跑导入脚本

这样能最快理解“方向 → 当前状态 → 下一步 → 代码落点”。

## 建议的下一步优先级

### 第一优先级

- 用真实 vault 目录更新导入配置，收紧扫描白名单
- 在 GitHub Actions 中完成第一次 `Obsidian Import` 实跑

### 第二优先级

- 收敛敏感词、黑名单目录与自动发布阈值
- 继续补真实内容下的阅读体验细节

### 第三优先级

- 完善写作规范、摘要规范、分类路径规则
- 评估 OG image、代码高亮方案、文章封面策略

## 当前不要急着做的事情

先不要跳去做：

- 重 CMS
- 评论系统
- 大标签系统
- 复杂动效
- 大量新依赖
- 看起来很“产品化”的组件堆叠

原因很简单：当前博客最缺的不是功能，而是系统完成度。

## 运行与验证

在当前仓库中推荐这样跑：

```bash
cd "/Users/tazdingo/Dingo Projetcts/dingo-den"
pnpm dev
```

构建验证：

```bash
cd "/Users/tazdingo/Dingo Projetcts/dingo-den"
pnpm build
```

Obsidian 导入本地验证：

```bash
cd "/Users/tazdingo/Dingo Projetcts/dingo-den"
OBSIDIAN_SOURCE_PATH="/你的/obsidian/vault" pnpm obsidian:scan:backfill
OBSIDIAN_SOURCE_PATH="/你的/obsidian/vault" pnpm obsidian:drafts
```

如果使用 GitHub Actions，当前需要在 **blog 仓库** 中配置 secret：

- `OBSIDIAN_SOURCE_TOKEN`

## 交接结论

如果你是新的 session，可以把当前项目理解成：

- 方向已经有了
- 第一轮视觉改版已经落地
- Obsidian 自动导入骨架已经写好并验证过一轮
- 接下来重点是“把导入规则调准 + 跑第一次线上自动导入”
