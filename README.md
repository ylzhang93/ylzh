# zyl 的个人主页 · Personal Page

> For life, for math, for entertainment.

数学博士生的个人主页。单页静态站点：纯 HTML / CSS / JavaScript，无构建步骤。

- 米色纸张质感 + 衬线排版（EB Garamond）
- **中 / EN 语言切换**：右上角开关一键切换全站语言（自动记住选择）
- KaTeX 渲染数学公式
- Canvas 绘制缓慢旋转的三叶扭结（trefoil knot）动画
- 滚动渐显、导航高亮、响应式，兼容 `prefers-reduced-motion`
- 数学博客：Markdown 写作，`$...$` 渲染公式，像写 LaTeX 一样简单
- **网页在线写作**（仅站长可写）+ 全文搜索 + 标签筛选

## 语言切换

页面右上角有一个语言开关（中文模式显示 `EN`，英文模式显示 `中文`），点击即可切换全站语言：

- 界面文字（导航、标题、介绍、联系等）全部随语言切换
- 选择会保存在浏览器里（localStorage），下次访问自动恢复
- 首次访问自动跟随浏览器语言（`zh*` 用中文，否则英文）
- 每篇文章可提供中英两个标题：`posts/index.json` 里的 `title_zh` / `title_en`（缺省回退到 `title`）
- 文章正文的语言由你自己决定（写中文或英文都可以）；想要双语文章，可以写两篇，或用 `--title-en` 只提供英文标题

## 本地预览

```bash
python -m http.server 8080
# 打开 http://localhost:8080
```

## 写博客

### 快速开始（一条命令）

```bash
python new_post.py "文章标题" --tags "代数几何, 笔记"
python new_post.py "My Title" --title-en "My Title" --tags "数论"   # 同时提供英文标题
```

脚本会：
1. 在 `posts/` 下创建 `2026-08-30-文章标题.md` 模板文件
2. 把文章信息写入 `posts/index.json`（文章列表；`--title-en` 可加英文标题）

然后编辑这个 `.md` 文件，写完推送到 GitHub 即上线：

```bash
git add .
git commit -m "new post: 文章标题"
git push
```

### 写作语法

文章就是 Markdown 文件，数学公式用 LaTeX 语法：

| 用法 | 写法 |
| --- | --- |
| 行内公式 | `$e^{i\pi} + 1 = 0$` |
| 块级公式 | `$$ \int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi} $$` |
| 多行公式（align* 等） | `$$ \begin{align*} a &= b + c \\ &= d \end{align*} $$`（工具栏 `env` 按钮一键插入） |
| 行内（LaTeX 风格） | `\(x_i\)` |
| 自定义宏 | `:::macros` 块里写 `\newcommand{\R}{\mathbb{R}}`，全文生效（见下文「自定义宏」） |
| 定理环境 | `:::theorem 费马小定理` … `:::`（支持 theorem/lemma/proposition/corollary/definition/proof/remark/example/conjecture/claim，自动编号；工具栏 `∎` 一键插入） |
| 块级（LaTeX 风格） | `\[ \dim \mathcal{M}_g = 3g-3 \]` |
| AoPS 风格 | `[math]a^2+b^2=c^2[/math]`，多行 `[math]...[/math]` 自动按块级 |
| 标题 | `# 一级`、`## 二级`、`### 三级` |
| 列表 / 引用 / 代码 | 标准 Markdown：`-`、`>`、```` ``` ```` |
| 表格 | 标准 GFM 表格 |

注意：
- 普通文本里的货币符号请写成 `\$`（反斜杠转义），否则会被当作公式起点
- 公式中的 `&`（如 `aligned`、`align*` 环境）无需特殊处理，会自动转义还原
- **数学环境必须放在块级公式里**：`\begin{align*}...\end{align*}` 要包在 `$$...$$` 或 `\[...\]` 中（工具栏 `env` 按钮自动完成），裸写不会被识别
- 数学符号直接写 LaTeX 命令即可：`\infty`、`\sum`、`\int`、`\mathbb{R}`、`\alpha` 等
- 想新建文章但标题是中文时，文件名会退化为 `post-日期`，建议用 `--slug` 指定英文名

### 自定义宏（\newcommand，节省体力）

像 LaTeX 一样自定义命令，全文生效。在文章任意位置写一个 `:::macros` 块：

```markdown
:::macros
\newcommand{\RR}{\mathbb{R}}
\newcommand{\norm}[1]{\left\lVert #1 \right\rVert}
\newcommand{\GL}[1]{\mathrm{GL}_{#1}}
\def\eps{\varepsilon}
:::
```

然后正文里直接写 `$\RR^n$`、`$\norm{v}$`、`$\GL{2}$`、`$\eps$`。

- 支持 `\newcommand`、`\renewcommand`、`\def` 三种写法，支持带参数宏（`[1]` + `#1`）
- 宏块本身不会显示在文章里
- 全站通用宏（`\R \C \N \Z \Q \F \norm \abs`）已在 `assets/config.js` 的 `katexMacros` 里预置，可直接用；单篇文章的定义会覆盖全局
- 代码块里的 `\newcommand` 不会被解析

### 定理环境

用 `:::` 包裹，第一行写类型（可加标题），内容支持 Markdown 与公式：

```markdown
:::theorem 费马小定理
若 $p$ 是素数且 $p \nmid a$，则

$$
a^{p-1} \equiv 1 \pmod p
$$
:::
```

自动渲染为带编号的卡片（定理 1、引理 1、命题 1……各类型独立计数），`proof` 类型末尾自动加 ∎。支持的类型：`theorem`、`lemma`、`proposition`、`corollary`、`definition`、`proof`、`remark`、`example`、`conjecture`、`claim`。工具栏 **`∎`** 按钮可一键插入模板。

### 隐藏内容（点击展开，AoPS `\hide` 的替代）

AoPS 的 `\hide{}` 是论坛专用宏，本站不支持；用网页原生折叠块即可达到同样效果（点击"解答"展开/收起），里面的公式照常渲染。**工具栏的「隐藏」按钮可一键插入下面的模板**（选中文字会包进去）：

```html
<details>
<summary>点击查看解答</summary>

这里写解答，支持 **Markdown** 和公式 $e^{i\pi}+1=0$。

</details>
```

注意：`<summary>` 与内容之间、内容与 `</details>` 之间**各留一个空行**，里面的 Markdown 才会被解析（这是 CommonMark 的 HTML 块规则）。

### 手动新建（不用脚本）

在 `posts/` 下新建 `2026-08-30-my-title.md`，再往 `posts/index.json` 里加一条：

```json
{"file": "posts/2026-08-30-my-title.md", "title": "我的标题", "title_en": "My Title", "date": "2026-08-30", "tags": ["数论"]}
```

`title_en` 可省略；省略时英文界面沿用 `title`。

`posts/2026-08-30-euler-identity.md` 是一篇示例文章（演示各种语法），确认后可以删除。

## 网页在线写作（write.html）

在浏览器里直接写博客，发布后 GitHub Pages 自动更新。博客页头部有 **「＋ 写日志」** 按钮（QQ 空间式），点击直达新文章编辑。

> 写作入口（「＋」按钮、页脚「写作」链接）**只有站长可见**：浏览器里保存过令牌才会显示，普通网友看不到。

### 用令牌发一篇 blog（完整流程）

1. **创建令牌**（只做一次）：GitHub → Settings → Developer settings → Personal access tokens → Generate new token → 勾选 `repo`（经典令牌）或 fine-grained 令牌勾选 `Contents: Read and write` → 生成后**复制**（只显示一次）
2. **打开写作页**：博客页点「＋ 写日志」（即 `write.html?new=1`）。浏览器**没存过令牌时页面显示 404**（访客视角：页面不存在）；点页面底部几乎看不见的「站长入口」进入并粘贴令牌，之后你的浏览器直接进入编辑器
3. **填写**：标题、英文标题（可选）、标签（回车添加）、正文（Markdown + LaTeX，自动实时预览）
4. **粘贴令牌**：粘到「GitHub Token」输入框（只保存在你的浏览器 localStorage）
5. **保存发布**：文章通过 GitHub API 写入仓库 `posts/` 并更新清单，一两分钟后博客页可见；成功后点消息里的链接直接看文章
6. 下次发帖不用再填令牌（已记住）；换电脑/浏览器需重新粘贴

### 编辑 / 删除

- **博客列表**：浏览器保存过令牌后，每篇文章悬停会出现 **编辑 / 删除** 按钮（QQ 空间式）。编辑直达写作页并载入文章；删除需确认，即时生效
- **写作页**：顶部「编辑已有文章」下拉框选择文章 → 自动载入 → 改完点保存；「删除文章」按钮可删除整篇
- 写作页保持简洁：顶部一条工具栏（加粗/链接/公式/引用等），写完点 **「预览」** 按钮弹出全屏预览（Markdown + LaTeX/KaTeX 公式排版效果），Esc 或点空白处关闭

### 权限说明（为什么只有你能写）

- 写入操作需要 **GitHub Token**（Personal Access Token，简称 PAT），它等效于仓库的写权限——**只有持有你令牌的人才能改仓库**，访客没有令牌，只能看
- 令牌只保存在**你自己的浏览器 localStorage** 里，不会上传到任何服务器，也绝不写进代码/仓库
- 写作页对访客显示 **404**（没有令牌 = 页面不存在），只有存过令牌的浏览器直接进入编辑器
- 可选的口令（`editorKey`）写在网页源码里，只是"隐私帘"，不构成真正的安全边界——真正的权限由 GitHub 保证。如果想完全隐藏写作入口，删掉页脚的"写作"链接和博客页的「＋」按钮即可
- 注意：令牌 = 仓库写权限，泄露等于把仓库交给别人，不要分享

### 评论与回复（giscus，AoPS 论坛式）

文章页底部有评论区：访客用 **GitHub 账号**登录即可**跟帖回复**，支持**嵌套楼层**（基于 GitHub Discussions，类似论坛的回复串）。站长零服务器、零成本。

启用步骤：

1. **启用 Discussions**：仓库 → Settings → Features → 打开 Discussions
2. **安装 giscus**：打开 https://github.com/apps/giscus → Install → 选择你的仓库
3. **获取配置**：打开 https://giscus.app → 填入你的仓库 → 选择一个分类（如 `Announcements`）→ 页面会生成 repo-id 和 category-id
4. **填入配置**：编辑 `assets/config.js` 的 `comments` 块，把 `enabled` 改为 `true`，填入 `repo`（形如 `用户名/仓库名`）、`repoId`、`category`、`categoryId`
5. 可选：`strict: true` 表示仅仓库协作者能评论（默认 `false`，任何 GitHub 账号都能回复）

原理：每篇文章用它的文件路径作为唯一标识，对应一个独立的 Discussion——回复会自动归档在仓库的 Discussions 里，不会丢。

### 搜索与标签

- 博客页顶部有**搜索框**：标题 / 标签 / 日期即时匹配；输入后会**全文检索**所有文章正文（首次搜索时按需加载），命中内容会显示带高亮的前后文片段
- 搜索结果可分享：`blog.html?q=关键词&tag=标签` 会直接打开对应筛选结果
- **标签栏**：文章全部标签及数量，点击筛选（可多选，标签间是"且"的关系）；文章页的标签也可点击直达筛选
- 多写标签（一篇 3–6 个），搜索与分类都会更好用

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
git remote add origin git@github.com:ylzhang93/ylzh.git
git push -u origin main
```

### 3. 开启 Pages

仓库页面 → **Settings → Pages** → Source 选择 `Deploy from a branch` → 分支选 `main` / 目录 `/ (root)` → Save。等一两分钟即可访问。

> 提示：如果之前推送过旧站（如 `a-zhang-biu/azhangbiu`），直接覆盖推送并刷新 Pages 即可。旧站已归档在本地 `legacy/` 目录（已在 `.gitignore` 中，不会推送到 GitHub）。

## 修改指引

在 `index.html` 中搜索 `TODO` 注释：

- 名字：首屏 `<h1 class="name">`（`zyl` 和中文名）
- 邮箱：联系区 `mailto:` 链接
- 公式：KaTeX 语法，行内 `\(...\)`、块级 `\[...\]`

## 目录结构

```
index.html          主页面
blog.html           博客列表页（搜索 + 标签筛选）
post.html           文章阅读页（Markdown + KaTeX 渲染）
write.html          在线写作页（站长专用，GitHub API 直写）
assets/site.css     共享样式
assets/i18n.js      中英词典与语言切换
assets/libs.js      前端库加载（多 CDN 回退）+ Markdown 渲染
assets/search.js    搜索 / 标签 / slug 工具
assets/config.js    站点配置（owner / repo / 写作口令）
posts/              博客文章（.md）与清单（index.json）
new_post.py         发帖脚本（命令行备选，python new_post.py "标题"）
source/img/         （已移除照片；如需放图，图片放这里）
legacy/             旧版网站归档（仅本地保留，不推送，确认后可删除）
```
