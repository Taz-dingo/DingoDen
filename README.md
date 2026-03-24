# Dingo Den Blog

一个使用 Astro 构建的个人博客项目，当前重点是把它打磨成一个安静、克制、content-first 的长期写作站点。

## 开发

在仓库根目录运行：

```bash
pnpm dev
```

构建：

```bash
pnpm build
```

预览：

```bash
pnpm preview
```

## 部署到 Vercel

当前项目是 Astro 静态站点，Vercel 会自动识别并使用正确的构建设置。

推荐方式：

1. 把当前 GitHub 仓库导入到 Vercel
2. Framework Preset 保持为 `Astro`
3. Build Command 使用 `pnpm build`
4. Output Directory 使用 `dist`

站点地址来源规则：

- 生产环境优先读取 `PUBLIC_SITE_URL`
- 如果未设置，则在 Vercel 上回退到 `VERCEL_PROJECT_PRODUCTION_URL`

如果你绑定了正式域名，建议在 Vercel 项目里添加：

```bash
PUBLIC_SITE_URL=https://你的域名
```

## Obsidian 自动导入

仓库中已经包含 Obsidian → blog 的自动导入骨架。

当前默认内容源：`Taz-dingo/obsidian-vault`（私有仓库）

因此 GitHub Actions 还需要你配置一个 secret：

- `OBSIDIAN_SOURCE_TOKEN`：对 `Taz-dingo/obsidian-vault` 具有只读权限的 GitHub token

可用脚本：

```bash
pnpm obsidian:scan:backfill
pnpm obsidian:scan:incremental
pnpm obsidian:drafts
pnpm obsidian:import
```

如果要在本地调试，可指定本地 vault 路径：

```bash
OBSIDIAN_SOURCE_PATH=/你的/obsidian/vault pnpm obsidian:import
```

## 项目文档

文档集中放在 `docs/`：

- `docs/README.md`
- `docs/spec.md`
- `docs/plan.md`
- `docs/status.md`
- `docs/tasks.md`
- `docs/handoff.md`
