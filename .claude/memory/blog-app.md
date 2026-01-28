# Blog Application (@dingo-den/blog)

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Astro 5.12.6 |
| UI 交互 | React 19.1.1 |
| 样式 | Tailwind CSS 3.4.17 |
| 组件库 | shadcn/ui (New York) + Radix UI |
| 内容格式 | MDX |
| 类型安全 | TypeScript (strict) |

## 目录结构

```
apps/blog/
├── src/
│   ├── components/
│   │   ├── common/      # Astro 组件 (Breadcrumb, FormattedDate, Note, TOC)
│   │   └── ui/          # React 组件 (ThemeToggle, Tooltip, TruncatedTooltipLink)
│   ├── content/blog/    # MDX 文章内容
│   ├── layouts/         # 页面布局
│   │   ├── BaseLayout.astro
│   │   ├── BaseHead.astro
│   │   ├── Header.astro
│   │   └── Footer.astro
│   ├── pages/           # 路由页面
│   │   ├── about.astro
│   │   ├── archive.astro
│   │   ├── blog/
│   │   │   ├── index.astro
│   │   │   ├── [...slug].astro
│   │   │   └── _components/
│   │   └── rss.xml.js
│   ├── styles/
│   ├── assets/
│   ├── consts.ts
│   └── content.config.ts
├── public/
├── astro.config.mjs
├── tailwind.config.mjs
└── tsconfig.json
```

## Content Collections Schema

**文件**: `src/content.config.ts`

```typescript
{
  title: string          // 文章标题
  description: string    // 文章描述
  pubDate: Date          // 发布日期
  updatedDate?: Date     // 更新日期 (可选)
  heroImage?: Image      // 首图 (可选)
}
```

## 路由

| 路径 | 页面 |
|------|------|
| `/` | 重定向到 `/blog` |
| `/blog` | 博客首页 (最近 5 篇) |
| `/blog/[...slug]` | 文章详情或分类页 |
| `/about` | 关于页 |
| `/archive` | 归档页 |
| `/rss.xml` | RSS feed |

## Blog 专属命令

```bash
# 运行 blog 开发服务器
pnpm --filter @dingo-den/blog dev

# 构建 blog
pnpm --filter @dingo-den/blog build

# 预览 blog
pnpm --filter @dingo-den/blog preview
```

## 组件说明

### Layout 组件
- `BaseLayout.astro`: 根布局，包含 BaseHead、Header、Main、Footer
- `BaseHead.astro`: SEO 元标签、外部资源
- `Header.astro`: 导航栏，包含 logo、链接、主题切换
- `Footer.astro`: 版权信息

### Common 组件 (Astro)
- `Breadcrumb.astro`: 面包屑导航
- `FormattedDate.astro`: 格式化日期显示
- `HeaderLink.astro`: 链接组件
- `Note.astro`: 提示框组件
- `table-of-contents/`: 目录导航

### UI 组件 (React)
- `ThemeToggle.tsx`: 深色/浅色主题切换 (client:load)
- `Tooltip.tsx`: 工具提示
- `TruncatedTooltipLink.tsx`: 截断提示链接

## Astro 配置要点

**文件**: `astro.config.mjs`

```javascript
{
  site: "https://example.com",  // 需要更新为实际域名
  integrations: [
    mdx(),
    sitemap(),
    react({ include: ["**/*.mdx"] }),  // 仅在 MDX 中水合 React
    vue(),
    tailwind({ applyBase: false })
  ],
  redirects: {
    "/": "/blog"
  }
}
```

## TypeScript 路径别名

```json
{
  "@/*": ["./src/*"]
}
```
