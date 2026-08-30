# zyl 的个人主页 · Personal Page

> For life, for math, for entertainment.

数学博士生的个人主页。单页静态站点：纯 HTML / CSS / JavaScript，无构建步骤。

- 米色纸张质感 + 衬线排版（EB Garamond），中英双语
- KaTeX 渲染数学公式
- Canvas 绘制缓慢旋转的三叶扭结（trefoil knot）动画
- 滚动渐显、导航高亮、响应式，兼容 `prefers-reduced-motion`

## 本地预览

```bash
python -m http.server 8080
# 打开 http://localhost:8080
```

## 发布到 GitHub Pages

### 1. 创建仓库（二选一）

| 仓库名 | 发布后的网址 |
| --- | --- |
| `<用户名>.github.io`（用户名仓库） | `https://<用户名>.github.io` |
| 任意项目名（如 `my-page`） | `https://<用户名>.github.io/<项目名>` |

本页全部使用相对路径，两种方式都可用。

### 2. 推送

```bash
git init
git add .
git commit -m "initial commit: personal page"
git branch -M main
git remote add origin https://github.com/<用户名>/<仓库名>.git
git push -u origin main
```

### 3. 开启 Pages

仓库页面 → **Settings → Pages** → Source 选择 `Deploy from a branch` → 分支选 `main` / 目录 `/ (root)` → Save。等一两分钟即可访问。

> 提示：如果之前推送过旧站（如 `a-zhang-biu/azhangbiu`），直接覆盖推送并刷新 Pages 即可。旧站已归档在本地 `legacy/` 目录（已在 `.gitignore` 中，不会推送到 GitHub）。

## 修改指引

在 `index.html` 中搜索 `TODO` 注释：

- 名字：首屏 `<h1 class="name">`（`zyl` 和中文名）
- 邮箱：联系区 `mailto:` 链接
- GitHub 链接：创建账号后把地址换成你的用户名
- 照片：替换 `source/img/wuzhu.jpg`
- 公式：KaTeX 语法，行内 `\(...\)`、块级 `\[...\]`

## 目录结构

```
index.html          主页面（所有样式与脚本内联）
source/img/         照片
legacy/             旧版网站归档（仅本地保留，不推送，确认后可删除）
```
