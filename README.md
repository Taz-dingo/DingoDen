# Dingo Den

一个以 `pnpm workspace` 管理的 monorepo，目前包含：

- `apps/blog`：个人博客
- `apps/kana`：日语 Kana 学习应用

## 开发方式

当前推荐流程：

- `kana` 功能在 kana 专属 worktree 中开发
- `blog` 功能在 blog 专属 worktree 中开发
- 子项目开发分支统一使用 `sub/*` 命名
- 每个子项目完成一轮开发后，再合并回 `main`

当前对应关系：

- `sub/blog` ↔ blog worktree
- `sub/kana` ↔ kana worktree
- `main` ↔ 主 worktree / 集成分支

这意味着：

- 不在 `main` 上直接做长期子项目开发
- `blog` 的日常开发优先在 `sub/blog` 完成
- `kana` 的日常开发优先在 `sub/kana` 完成
- `main` 主要用于汇总、集成、验收和发布前确认

## 适用原则

这套流程即使只有一个人开发也依然有价值，因为它能：

- 保持不同子项目的上下文分离
- 让提交边界更清楚
- 避免 blog 和 kana 的改动混在一起
- 让 `main` 长期保持为相对稳定的集成态

如果某段时间只维护一个子项目，也可以临时简化操作；但默认仍推荐按子项目分 worktree 开发。

## 常用命令

在仓库根目录运行：

```bash
pnpm dev:blog
pnpm dev:kana
pnpm build
pnpm lint
pnpm format
```

## 子项目文档

- `apps/blog/README.md`
- `apps/blog/docs/README.md`
- `apps/kana/README.md`
- `apps/kana/docs/README.md`
