# New App

在 monorepo 中创建一个新的 Astro 应用。

## 使用方法

`/new-app <app-name>`

例如：`/new-app demo`

## 执行步骤

1. 检查 `apps/<app-name>` 是否已存在
2. 创建 `apps/<app-name>` 目录结构
3. 创建基础配置文件：
   - `package.json` (scoped 名称 `@dingo-den/<app-name>`)
   - `astro.config.mjs` (基本 Astro 配置)
   - `tsconfig.json`
   - `tailwind.config.mjs` (如果需要)
4. 创建基础目录：
   - `src/pages/`
   - `src/layouts/`
   - `public/`
5. 创建首页 `src/pages/index.astro`
6. 运行 `pnpm install`

## 注意事项

- 应用名称使用 kebab-case
- package.json 的 name 使用 `@dingo-den/<app-name>` 格式
- 需要安装 Astro 作为依赖
