# Dingo Den - Project Overview

Dingo Den 是一个 pnpm workspace monorepo，用于管理多个 Web 应用和 demo 项目。

## 基本信息

- **项目类型**: Monorepo (pnpm workspace)
- **主要目的**: 集中管理和维护多个作品集/demo
- **包管理器**: pnpm
- **命名空间**: @dingo-den/*

## 目录结构

```
dingo-den/
├── apps/                    # 应用目录
│   └── blog/               # 主博客应用 (@dingo-den/blog)
├── packages/               # 共享包目录 (预留)
├── .claude/               # Claude Code 配置和记忆
│   ├── skills/            # Claude Skills
│   └── memory/            # 项目记忆文件
├── pnpm-workspace.yaml   # Workspace 配置
└── package.json           # 根配置
```

## 全局命令

```bash
# 开发
pnpm dev              # 运行所有应用
pnpm --filter <name> dev  # 运行指定应用

# 构建
pnpm build            # 构建所有应用
pnpm --filter <name> build  # 构建指定应用

# 预览
pnpm preview          # 预览所有应用
```

## 技术规范

- **提交信息规范**: 遵循 Conventional Commits
  - `feat:` 新功能
  - `fix:` 修复
  - `refactor:` 重构
  - `docs:` 文档

## 已知应用

| 名称 | 包名 | 描述 |
|------|------|------|
| blog | @dingo-den/blog | Astro 静态博客 |
