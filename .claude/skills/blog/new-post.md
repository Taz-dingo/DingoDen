# New Blog Post

创建新的博客文章。

## 使用方法

`/blog/new-post`

## 执行步骤

1. 提示输入文章信息：
   - 标题 (title)
   - 描述 (description)
   - 分类/路径 (slug)
   - 是否需要首图 (heroImage)

2. 生成文件名：
   - 路径: `src/content/blog/<slug>/index.mdx`

3. 创建 MDX 文件，包含 frontmatter：

```markdown
---
title: "<title>"
description: "<description>"
pubDate: <current-date>
heroImage: "./hero.jpg"  // 如果选择有首图
---

# <title>

文章内容...
```

4. 提示用户文件创建成功，可以开始编辑内容

## 注意事项

- slug 使用 kebab-case
- 日期格式：YYYY-MM-DD
- heroImage 使用相对路径
