/* ============================================================
   前端库加载与 Markdown 渲染（post.html / write.html 共用）
   - 多 CDN 自动回退：jsdelivr → npmmirror → unpkg
   - 数学保护：公式片段先占位，避免 Markdown 误解析 _ * 等字符
   - 围栏代码块内的 $ 不会被当作公式
   ============================================================ */
(function(){
  'use strict';

  var JSD   = function(p){ return 'https://cdn.jsdelivr.net/npm/' + p; };
  var NPMM  = function(p){ return 'https://registry.npmmirror.com/' + p; };
  var UNPKG = function(p){ return 'https://unpkg.com/' + p; };
  function chain(p){ return [JSD(p), NPMM(p), UNPKG(p)]; }

  function loadScript(urls, done){
    var i = 0;
    (function next(){
      if (i >= urls.length) return done(false);
      var s = document.createElement('script');
      s.src = urls[i++];
      s.onload = function(){ done(true); };
      s.onerror = next;
      document.head.appendChild(s);
    })();
  }
  function loadCss(src){
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = src;
    document.head.appendChild(l);
  }

  var loaded = false;
  var tikzStarted = false;   /* TikZJax 是否已加载（懒加载，有 tikz 块才触发） */

  /* TikZJax fork：MutationObserver 自动渲染动态插入的 <script type="text/tikz">
     资源（run-tex.js / tex.wasm.gz / core.dump.gz / fonts）与其同目录。
     已自托管到本站 assets/tikzjax/（本地服务器 & GitHub Pages 同源加载，
     不依赖 jsdelivr/unpkg 等第三方 CDN，预览/线上都稳定）；
     外部 CDN 仅作后备。 */
  var TIKZ_URLS = [
    'assets/tikzjax/tikzjax.js',
    'https://cdn.jsdelivr.net/npm/@drgrice1/tikzjax@1.0.0-beta24/dist/tikzjax.js',
    'https://unpkg.com/@drgrice1/tikzjax@1.0.0-beta24/dist/tikzjax.js'
  ];
  var TIKZ_CSS = [
    'assets/tikzjax/fonts.css',
    'https://cdn.jsdelivr.net/npm/@drgrice1/tikzjax@1.0.0-beta24/dist/fonts.css'
  ];

  /* 加载 marked + dompurify + katex + auto-render，done(ok) */
  function load(done){
    if (loaded) return done(true);
    loadScript(chain('marked@5.1.2/marked.min.js'), function(ok){
      if (!ok) return done(false);
      loadScript(chain('dompurify@3.1.6/dist/purify.min.js'), function(ok2){
        if (!ok2) return done(false);
        loadScript(chain('katex@0.16.11/dist/katex.min.js'), function(ok3){
          if (!ok3) return done(false);
          loadCss('https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css');
          loadScript(chain('katex@0.16.11/dist/contrib/auto-render.min.js'), function(ok4){
            if (!ok4) return done(false);
            loaded = true;
            done(true);
          });
        });
      });
    });
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  /* 定理环境标签（随界面语言） */
  var THM_LABELS = {
    zh: { theorem: '定理', lemma: '引理', proposition: '命题', corollary: '推论',
          definition: '定义', proof: '证明', remark: '注', example: '例',
          conjecture: '猜想', claim: '断言' },
    en: { theorem: 'Theorem', lemma: 'Lemma', proposition: 'Proposition', corollary: 'Corollary',
          definition: 'Definition', proof: 'Proof', remark: 'Remark', example: 'Example',
          conjecture: 'Conjecture', claim: 'Claim' }
  };
  /* :::theorem 标题 ... ::: 块 */
  var THM_RE = /^:::([a-zA-Z]+)[ \t]*([^\n]*)\n([\s\S]*?)^:::[ \t]*\n?/gm;
  /* LaTeX 风格 \begin{theorem}[标题] ... \end{theorem}（只认定理类环境，不碰数学环境） */
  var THM_LATEX_RE = /\\begin\{(theorem|lemma|proposition|corollary|definition|proof|remark|example|conjecture|claim)\}(?:\[([^\]]*)\])?([\s\S]*?)\\end\{\1\}/g;

  /* 解析一行 \newcommand / \def 宏定义 → { 命令名: 定义 } */
  function parseMacroLine(line){
    line = line.trim();
    if (!line || line.charAt(0) !== '\\') return null;
    var m;
    m = /^\\(?:re)?newcommand\*?\{\\?([a-zA-Z]+)\}(?:\[\d+\])?\{([\s\S]*)\}$/.exec(line);
    if (m) return { name: '\\' + m[1], def: m[2] };
    m = /^\\def\\?([a-zA-Z]+)\{([\s\S]*)\}$/.exec(line);
    if (m) return { name: '\\' + m[1], def: m[2] };
    return null;
  }

  /* Markdown → { html, macros }（公式已还原为 $…$ 文本，未做 KaTeX 排版）
     opts: { lang, macros } —— macros 为全局宏表（config.js katexMacros） */
  function renderMarkdown(md, opts){
    opts = opts || {};
    var lang = opts.lang === 'en' ? 'en' : 'zh';
    var macros = {};
    var base = opts.macros || {};
    Object.keys(base).forEach(function(k){ macros[k] = base[k]; });
    var mathSpans = [];
    var tikzBlocks = [];   /* \begin{tikzcd}…\end{tikzcd} / \begin{tikzpicture}…\end{tikzpicture} 原文 */
    function protectSeg(seg){
      /* 自定义宏 :::macros ... ::: 块：解析并移除（不渲染） */
      seg = seg.replace(/^:::macros[ \t]*\n([\s\S]*?)^:::[ \t]*\n?/gm, function(_, body){
        body.split('\n').forEach(function(line){
          var parsed = parseMacroLine(line);
          if (parsed) macros[parsed.name] = parsed.def;
        });
        return '';
      });
      /* TikZ 交换图/图形：整块提取为 ⟦Tn⟧ 占位符（须在数学保护之前，
         块内的 $…$、_、% 等原样保留，交给 TikZJax 处理）
         顺带吃掉常见的外层定界符 $$…$$ 或 \[…\] */
      seg = seg.replace(/(?:\$\$\s*|\\\[\s*)?\\begin\{(tikzcd|tikzpicture)\}[\s\S]*?\\end\{\1\}(?:\s*\$\$|\s*\\\])?/g, function(m){
        tikzBlocks.push(m.replace(/^\$\$\s*|^\s*\\\[\s*|\s*\$\$$|\s*\\\]\s*$/g, ''));
        return '\u27E6T' + (tikzBlocks.length - 1) + '\u27E7';
      });
      /* 定理环境 :::theorem ... ::: → 带编号的卡片 */
      seg = seg.replace(THM_RE, function(_, type, title, body){
        var label = (THM_LABELS[lang] || THM_LABELS.zh)[type] || type;
        var t = (title || '').trim();
        var head = '<div class="thm-head">' + label +
          (t ? '<span class="thm-title">' + escapeHtml(t) + '</span>' : '') + '</div>';
        return '<div class="thm thm-' + type + '">' + head + '\n\n' +
          body.trim() + '\n\n</div>';
      });
      /* LaTeX 风格 \begin{theorem}[标题] ... \end{theorem} → 同样转成卡片 */
      seg = seg.replace(THM_LATEX_RE, function(_, type, title, body){
        var label = (THM_LABELS[lang] || THM_LABELS.zh)[type] || type;
        var t = (title || '').trim();
        var head = '<div class="thm-head">' + label +
          (t ? '<span class="thm-title">' + escapeHtml(t) + '</span>' : '') + '</div>';
        return '<div class="thm thm-' + type + '">' + head + '\n\n' +
          body.trim() + '\n\n</div>';
      });
      seg = seg.replace(/\[math\]\s*([\s\S]*?)\s*\[\/math\]/g, function(_, inner){
        return /\n/.test(inner)
          ? '\n$$\n' + inner.trim() + '\n$$\n'
          : '$' + inner.trim() + '$';
      });
      function p(re){
        seg = seg.replace(re, function(m){
          mathSpans.push(m);
          return '\u27E6' + (mathSpans.length - 1) + '\u27E7';
        });
      }
      p(/\$\$[\s\S]+?\$\$/g);       /* 块级 $$...$$ */
      p(/\$[^$\n]+?\$/g);           /* 行内 $...$ */
      p(/\\\[[\s\S]+?\\\]/g);       /* \[...\] */
      p(/\\\([\s\S]+?\\\)/g);       /* \(...\) */
      return seg;
    }
    md = md.split(/(```[^\n]*\n[\s\S]*?```)/g)
          .map(function(seg, i){ return i % 2 === 1 ? seg : protectSeg(seg); })
          .join('');
    var html = window.marked.parse ? window.marked.parse(md) : window.marked(md);
    html = html.replace(/\u27E6(\d+)\u27E7/g, function(_, i){
      return escapeHtml(mathSpans[+i]);   /* & < > 转义，KaTeX 从文本节点读回原字符 */
    });
    /* DOMPurify 之后再还原 tikz 块：<script> 标签若先于 sanitize 会被剥掉。
       转义 </script 防止内容提前闭合标签（TikZ 代码几乎不会含，防御性处理）。
       把当前宏表（:::macros 定义的 \newcommand）写入 data-add-to-preamble，
       TikZJax 会把它拼进 TeX preamble——否则 tikzcd 里的 \G、\A 等自定义宏
       在 TikZJax 的独立 TeX 引擎里未定义，编译失败只能显示原生代码。
       tikz-cd 需显式 \usepackage{tikz-cd}（TikZJax 内置该文件但不自动加载）。 */
    function tikzPreamble(code){
      var parts = [];
      if (/\\begin\{tikzcd\}/.test(code)) parts.push('\\usepackage{tikz-cd}');
      Object.keys(macros).forEach(function(k){
        parts.push('\\newcommand{' + k + '}{' + macros[k] + '}');
      });
      return parts.join('\n');
    }
    var clean = window.DOMPurify.sanitize(html);
    clean = clean.replace(/\u27E6T(\d+)\u27E7/g, function(_, i){
      var code = tikzBlocks[+i] || '';
      code = code.replace(/<\/script/gi, '<\\/script');
      var pre = tikzPreamble(code);
      return '<script type="text/tikz"' +
        (pre ? ' data-add-to-preamble="' + escapeHtml(pre) + '"' : '') +
        '>' + code + '</script>';
    });
    return { html: clean, macros: macros, hasTikz: tikzBlocks.length > 0 };
  }

  /* 对容器内公式做 KaTeX 排版（macros 为自定义宏表） */
  function renderMathIn(el, macros){
    if (!window.renderMathInElement) return;
    var opts = {
      delimiters: [
        {left: '$$', right: '$$', display: true},
        {left: '$', right: '$', display: false},
        {left: '\\[', right: '\\]', display: true},
        {left: '\\(', right: '\\)', display: false}
      ],
      throwOnError: false
    };
    if (macros && Object.keys(macros).length) opts.macros = macros;
    renderMathInElement(el, opts);
  }

  /* 懒加载 TikZJax 并渲染容器内的 <script type="text/tikz"> 块。
     该 fork 用 MutationObserver 监听 body：加载后新插入的 tikz 块自动渲染；
     加载时已有的块也会被扫描处理，所以只需保证 tikzjax.js 在 script 插入后加载。
     资源优先从本站 assets/tikzjax/ 加载（本地预览 & GitHub Pages 同源，稳定），
     失败才回退第三方 CDN。 */
  function renderTikz(el){
    if (!el || !el.querySelector) return;
    if (!el.querySelector('script[type="text/tikz"]')) return;
    if (tikzStarted) return;               /* 已加载：observer 自动接管后续块 */
    tikzStarted = true;
    /* TeX 字体：引入 fonts.css（内部 url('fonts/…') 按 CSS 自身地址解析，
       自托管时解析到本站 assets/tikzjax/fonts/，无需改写） */
    loadCss(TIKZ_CSS[0]);
    loadScript(TIKZ_URLS, function(ok){
      if (!ok){                             /* 本地失败 → 回退 CDN */
        loadCss(TIKZ_CSS[1]);
        loadScript(TIKZ_URLS.slice(1), function(ok2){
          if (!ok2) tikzStarted = false;    /* 全部失败：允许下次重试 */
        });
      }
    });
  }

  /* giscus 评论区：按文章注入脚本（term 唯一标识 → 一篇一个 Discussion）
     返回 true 表示已注入；配置未就绪返回 false */
  function loadComments(cfg, term, lang, container){
    var c = cfg && cfg.comments;
    if (!c || !c.enabled || !c.repo || !c.repoId || !c.categoryId) return false;
    container.innerHTML = '';
    var s = document.createElement('script');
    s.src = 'https://giscus.app/client.js';
    s.async = true;
    var attrs = {
      'data-repo': c.repo,
      'data-repo-id': c.repoId,
      'data-category': c.category || 'Announcements',
      'data-category-id': c.categoryId,
      'data-mapping': 'specific',
      'data-term': term,
      'data-strict': c.strict ? '1' : '0',
      'data-reactions-enabled': '1',
      'data-emit-metadata': '0',
      'data-input-position': 'bottom',
      'data-theme': 'light',
      'data-lang': lang === 'zh' ? 'zh-CN' : 'en',
      'data-loading': 'lazy'
    };
    Object.keys(attrs).forEach(function(k){ s.setAttribute(k, attrs[k]); });
    container.appendChild(s);
    return true;
  }

  window.LIBS = {
    load: load,
    renderMarkdown: renderMarkdown,
    renderMathIn: renderMathIn,
    renderTikz: renderTikz,
    loadComments: loadComments
  };
})();
