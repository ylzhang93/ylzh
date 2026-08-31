#!/usr/bin/env python3
# -*- coding: utf-8 -*-
r"""
new_post.py — 新建一篇博客文章

用法（在网站根目录运行）：

    python new_post.py "文章标题"
    python new_post.py "文章标题" --tags "代数几何, 笔记"
    python new_post.py "文章标题" --tags "数论" --slug elliptic-curves

流程：
  1. 在 posts/ 下创建 <日期>-<slug>.md 模板文件
  2. 把文章信息追加到 posts/index.json（按日期倒序）
  3. 推送 GitHub 后自动上线；本地预览 http://localhost:8080/blog.html

写作语法：Markdown + LaTeX 公式。
  行内公式  $...$         例如 $e^{i\pi} + 1 = 0$
  块级公式  $$...$$       例如 $$ \int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi} $$
  AoPS 风格 [math]...[/math]（多行自动按块级处理）
"""
import argparse
import datetime
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
POSTS_DIR = os.path.join(ROOT, "posts")
MANIFEST = os.path.join(POSTS_DIR, "index.json")

TEMPLATE = """# {title}

在这里写正文。

行内公式：$e^{i\\pi} + 1 = 0$

块级公式：

$$
\\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}
$$

也支持 AoPS 风格的 `[math]...[/math]` 标签。
"""


def sanitize_slug(title):
    """标题 → 文件名 slug：保留小写字母、数字、连字符。"""
    s = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    return s


def load_manifest():
    if not os.path.exists(MANIFEST):
        return []
    with open(MANIFEST, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data if isinstance(data, list) else []


def save_manifest(posts):
    posts.sort(key=lambda p: p.get("date", ""), reverse=True)
    with open(MANIFEST, "w", encoding="utf-8") as f:
        json.dump(posts, f, ensure_ascii=False, indent=2)
        f.write("\n")


def main():
    ap = argparse.ArgumentParser(description="新建一篇数学博客文章（公开文章用命令行；草稿/私有请在网页编辑器写，自动存入私有仓库）")
    ap.add_argument("title", help="文章标题")
    ap.add_argument("--title-en", default="", help="可选：英文标题（语言切换时显示）")
    ap.add_argument("--tags", default="", help="逗号分隔的标签，如：代数几何,笔记")
    ap.add_argument("--slug", default="", help="可选的文件名 slug（默认由标题生成）")
    args = ap.parse_args()

    title = args.title.strip()
    if not title:
        print("错误：标题不能为空")
        sys.exit(1)

    date = datetime.date.today().isoformat()
    slug = args.slug.strip() or sanitize_slug(title)
    if not slug:
        slug = "post-" + date.replace("-", "")

    os.makedirs(POSTS_DIR, exist_ok=True)

    # 处理重名
    base = f"{date}-{slug}"
    filename, n = base, 2
    while os.path.exists(os.path.join(POSTS_DIR, filename + ".md")):
        filename = f"{base}-{n}"
        n += 1

    filepath = os.path.join(POSTS_DIR, filename + ".md")
    relpath = "posts/" + filename + ".md"

    tags = [t.strip() for t in args.tags.split(",") if t.strip()]

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(TEMPLATE.replace("{title}", title))

    posts = load_manifest()
    entry = {
        "file": relpath,
        "title": title,
        "date": date,
        "tags": tags,
    }
    if args.title_en.strip():
        entry["title_en"] = args.title_en.strip()
    posts.append(entry)
    save_manifest(posts)

    print("已创建文章：")
    print("  文件   ", filepath)
    print("  标题   ", title)
    if args.title_en.strip():
        print("  英文标题", args.title_en.strip())
    print("  日期   ", date)
    print("  标签   ", ", ".join(tags) if tags else "（无）")
    print()
    print("提示：草稿/私有文章请在网页编辑器（write.html）写，状态选「草稿/私有」会自动存入私有仓库。")
    print()
    print("下一步：")
    print("  1. 编辑上面的 .md 文件，用 Markdown + $...$ 写公式")
    print("  2. 本地预览  http://localhost:8080/blog.html")
    print("  3. git add . && git commit -m \"new post: %s\" && git push" % title)


if __name__ == "__main__":
    main()
