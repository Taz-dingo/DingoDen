# Monorepo Architecture

## pnpm Workspace 配置

**文件**: `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

## 包命名规范

所有应用和包使用 scoped 命名：

- **应用**: `@dingo-den/<app-name>`
- **共享包**: `@dingo-den/<package-name>`

## 添加新应用

1. 在 `apps/` 下创建应用目录
2. 初始化 `package.json`，设置 `name` 为 `@dingo-den/<app-name>`
3. 运行 `pnpm install` 安装依赖

## 添加新共享包

1. 在 `packages/` 下创建包目录
2. 初始化 `package.json`，设置 `name` 为 `@dingo-den/<package-name>`
3. 运行 `pnpm install` 安装依赖
4. 在其他应用中通过 `workspace:*` 协议引用

## 依赖引用

```json
{
  "dependencies": {
    "@dingo-den/ui": "workspace:*"
  }
}
```
