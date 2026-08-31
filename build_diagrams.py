#!/usr/bin/env python3
# -*- coding: utf-8 -*-
r"""
build_diagrams.py — 把文章里的交换图（\begin{tikzcd} / \begin{tikzpicture}）编译成 SVG

背景：TikZJax（浏览器 WebAssembly 渲染）依赖从 jsdelivr/unpkg 下载约 6MB 资源，
国内网络经常失败导致图片显示不出来。本脚本改为「构建期编译」——这正是
Stacks Project 的做法：发布前在本地用 TeX 把图编译成 SVG 存进仓库，
文章里直接引用图片，浏览器零下载、零依赖、永远稳定。

用法（在网站根目录运行）：

    python build_diagrams.py               # 构建 posts/*.md 里所有图
    python build_diagrams.py posts/xxx.md  # 只构建指定文章

对每篇含图的文章：
  1. 收集该文的 :::macros 自定义宏（\newcommand 等）
  2. 把每个 \begin{tikzcd}…\end{tikzcd} / \begin{tikzpicture}…\end{tikzpicture} 块
     用 pdflatex(latex) + dvisvgm 编译成 SVG（文本转路径，完全自包含）
  3. SVG 存入 posts/diagrams/，md 里的图块替换为 ![图](posts/diagrams/diag-<hash>.svg)

要求：本机装有 TeX Live（pdflatex / latex / dvisvgm）。

发布流程：写完文章后先跑本脚本，再 git add && git commit && git push。
"""
import argparse
import hashlib
import os
import re
import shutil
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.abspath(__file__))
POSTS_DIR = os.path.join(ROOT, "posts")
DIAGRAM_DIR = os.path.join(POSTS_DIR, "diagrams")

# 匹配 \begin{tikzcd}...\end{tikzcd} 或 \begin{tikzpicture}...\end{tikzpicture}
# （容忍外层 $$ 或 \[ \] 包裹）
TIKZ_BLOCK_RE = re.compile(
    r"(?:\$\$\s*|\\\[\s*)?"
    r"\\begin\{(tikzcd|tikzpicture)\}[\s\S]*?\\end\{\1\}"
    r"(?:\s*\$\$|\s*\\\])?"
)

# 匹配 :::macros ... ::: 块
MACROS_BLOCK_RE = re.compile(r"^:::macros[ \t]*\n([\s\S]*?)^:::[ \t]*\n?", re.M)

# 匹配单行 \newcommand / \renewcommand / \def
NEWCOMMAND_RE = re.compile(
    r"^\s*\\(?:re)?newcommand\*?\s*\{\\?([a-zA-Z]+)\}(?:\[\d+\])?\{([\s\S]*)\}\s*$"
)
DEF_RE = re.compile(r"^\s*\\def\\?([a-zA-Z]+)\{([\s\S]*)\}\s*$")


def collect_macros(md):
    """收集文章里 :::macros 块定义的所有 \newcommand → [(name, def), ...]"""
    out = []
    for m in MACROS_BLOCK_RE.finditer(md):
        for line in m.group(1).splitlines():
            mc = NEWCOMMAND_RE.match(line)
            if mc:
                out.append((mc.group(1), mc.group(2)))
                continue
            dc = DEF_RE.match(line)
            if dc:
                out.append((dc.group(1), dc.group(2)))
    return out


def strip_wrappers(block):
    # 去掉图块外层可能的 $$ 或 \[ \] 包裹
    b = block.strip()
    b = re.sub(r"^\$\$\s*", "", b)
    b = re.sub(r"\s*\$\$$", "", b)
    b = re.sub(r"^\\\[\s*", "", b)
    b = re.sub(r"\s*\\\]\s*$", "", b)
    return b.strip()


def build_one(block, macros, workdir, verbose=False):
    """编译单个 tikz 块 → (svg_path_abs, svg_bytes, error|None)"""
    body = strip_wrappers(block)
    body = body.replace("</script", "<\\/script")  # 防御（正常不会出现）

    pre = []
    for name, definition in macros:
        pre.append("\\newcommand{\\%s}{%s}" % (name, definition))
    preamble = "\n".join(pre)

    is_tikzcd = "\\begin{tikzcd}" in body
    tex = (
        "\\documentclass{standalone}\n"
        "\\usepackage{amsmath,amssymb}\n"
        + ("\\usepackage{tikz-cd}\n" if is_tikzcd else "\\usepackage{tikz}\n")
        + preamble
        + "\n\\begin{document}\n"
        + body
        + "\n\\end{document}\n"
    )

    # 内容哈希 → 文件名（内容不变则复用旧图）
    h = hashlib.md5(tex.encode("utf-8")).hexdigest()[:12]
    out_svg = os.path.join(DIAGRAM_DIR, "diag-%s.svg" % h)
    if os.path.exists(out_svg):
        return out_svg, None, None

    tmp = tempfile.mkdtemp(prefix="tikzdiag-")
    try:
        texpath = os.path.join(tmp, "diag.tex")
        with open(texpath, "w", encoding="utf-8") as f:
            f.write(tex)

        def run(cmd):
            r = subprocess.run(
                cmd, cwd=tmp,
                stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                timeout=120, text=True, errors="replace",
            )
            if verbose:
                sys.stdout.write(r.stdout[-800:])
            return r.returncode

        # 用 latex（DVI 模式）编译，dvisvgm 从 DVI 转 SVG
        if run(["latex", "-interaction=nonstopmode", "-halt-on-error", "diag.tex"]) != 0:
            return None, None, "latex 编译失败（图内可能有未定义命令，检查 \\begin{tikzcd} 里的宏）"
        if run(["dvisvgm", "--no-fonts", "--font-format=woff2", "diag.dvi"]) != 0:
            return None, None, "dvisvgm 转换失败"

        dvi_svg = os.path.join(tmp, "diag.svg")
        if not os.path.exists(dvi_svg):
            return None, None, "未生成 diag.svg"

        os.makedirs(DIAGRAM_DIR, exist_ok=True)
        shutil.copyfile(dvi_svg, out_svg)
        return out_svg, os.path.getsize(out_svg), None
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def process_file(md_path, verbose=False):
    """处理单篇 md：编译图块并替换为图片引用。返回 (changed, errors)"""
    with open(md_path, "r", encoding="utf-8") as f:
        md = f.read()

    if "\\begin{tikzcd}" not in md and "\\begin{tikzpicture}" not in md:
        return False, []

    macros = collect_macros(md)
    errors = []
    changed = False

    def repl(m):
        nonlocal changed
        svg_path, size, err = build_one(m.group(0), macros, None, verbose)
        if err:
            errors.append(err)
            return m.group(0)  # 失败保留原文
        rel = os.path.relpath(svg_path, ROOT).replace("\\", "/")
        changed = True
        return "\n\n![交换图](%s)\n" % rel

    new_md = TIKZ_BLOCK_RE.sub(repl, md)
    if changed:
        with open(md_path, "w", encoding="utf-8") as f:
            f.write(new_md)
    return changed, errors


def main():
    ap = argparse.ArgumentParser(description="把文章里的 tikzcd/tikzpicture 编译成 SVG")
    ap.add_argument("files", nargs="*", help="要处理的 .md 文件（默认 posts/*.md）")
    ap.add_argument("-v", "--verbose", action="store_true", help="显示 TeX 编译输出")
    args = ap.parse_args()

    if not shutil.which("latex") or not shutil.which("dvisvgm"):
        print("错误：未找到 latex / dvisvgm，请安装 TeX Live 后重试。")
        sys.exit(1)

    os.makedirs(DIAGRAM_DIR, exist_ok=True)

    if args.files:
        files = [f if os.path.isabs(f) else os.path.join(ROOT, f) for f in args.files]
    else:
        files = [
            os.path.join(POSTS_DIR, f)
            for f in sorted(os.listdir(POSTS_DIR))
            if f.endswith(".md")
        ]

    if not files:
        print("posts/ 下没有 .md 文件")
        return

    total_changed = 0
    total_err = 0
    for fp in files:
        if not os.path.exists(fp):
            print("跳过（不存在）：%s" % fp)
            continue
        changed, errors = process_file(fp, args.verbose)
        name = os.path.basename(fp)
        if changed:
            print("已更新：%s" % name)
            total_changed += 1
        for e in errors:
            print("  错误：%s" % e)
            total_err += 1
        if not changed and not errors:
            print("无图：  %s" % name)

    print()
    print("完成：处理 %d 篇，新生成图存入 posts/diagrams/。" % total_changed)
    if total_err:
        print("有 %d 处编译失败，对应 md 保留原文（仍会走 TikZJax 渲染）。" % total_err)
        sys.exit(2)
    print("下一步：git add . && git commit && git push")


if __name__ == "__main__":
    main()
