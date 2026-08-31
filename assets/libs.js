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
  var xyStarted = false;
  var xyReady = false;
  var xyWaiters = [];        /* MathJax + XyJax 只加载一次，等待者统一回调 */

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
    var legacyTikz = [];  /* 仅用于提示迁移，不再加载浏览器 TeX/WASM */
    var xyBlocks = [];     /* \xymatrix{...}：交给 MathJax + XyJax-v3 */
    function protectSeg(seg){
      /* 自定义宏 :::macros ... ::: 块：解析并移除（不渲染） */
      seg = seg.replace(/^:::macros[ \t]*\n([\s\S]*?)^:::[ \t]*\n?/gm, function(_, body){
        body.split('\n').forEach(function(line){
          var parsed = parseMacroLine(line);
          if (parsed) macros[parsed.name] = parsed.def;
        });
        return '';
      });
      /* Xy-pic 交换图：用括号计数提取完整 \xymatrix{...}（支持内部嵌套花括号），
         比正则可靠；必须先于 Markdown/KaTeX 保护。 */
      (function(){
        var out = '', pos = 0;
        while (true){
          var start = seg.indexOf('\\xymatrix', pos);
          if (start < 0){ out += seg.slice(pos); break; }
          var open = seg.indexOf('{', start + 9);
          if (open < 0){ out += seg.slice(pos); break; }
          var depth = 0, end = -1;
          for (var k = open; k < seg.length; k++){
            if (seg.charAt(k) === '\\'){ k++; continue; } /* \{ / \} 不参与计数 */
            if (seg.charAt(k) === '{') depth++;
            else if (seg.charAt(k) === '}'){
              depth--;
              if (depth === 0){ end = k + 1; break; }
            }
          }
          if (end < 0){ out += seg.slice(pos); break; }
          out += seg.slice(pos, start);
          xyBlocks.push(seg.slice(start, end));
          out += '\u27E6X' + (xyBlocks.length - 1) + '\u27E7';
          pos = end;
        }
        seg = out;
      })();
      /* 旧 tikzcd/tikzpicture 不再在浏览器运行完整 TeX；显示迁移提示。 */
      seg = seg.replace(/(?:\$\$\s*|\\\[\s*)?\\begin\{(tikzcd|tikzpicture)\}[\s\S]*?\\end\{\1\}(?:\s*\$\$|\s*\\\])?/g, function(m){
        legacyTikz.push(m);
        return '\u27E6L' + (legacyTikz.length - 1) + '\u27E7';
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
    var clean = window.DOMPurify.sanitize(html);
    clean = clean.replace(/\u27E6L(\d+)\u27E7/g, function(){
      return '<div class="tikz-error">旧 tikzcd 语法已停用；请使用工具栏 ⇄ 插入 \\xymatrix 交换图。</div>';
    });
    /* XyJax 槽位在 sanitize 后生成，data-xy 仅保存纯 TeX 文本；
       MathJax typeset 时再读取，正文的 KaTeX 渲染不受影响。 */
    clean = clean.replace(/\u27E6X(\d+)\u27E7/g, function(_, i){
      var defs = [];
      Object.keys(macros).forEach(function(k){
        defs.push('\\newcommand{' + k + '}{' + macros[k] + '}');
      });
      var code = defs.join(' ') + ' ' + (xyBlocks[+i] || '');
      return '<div class="xy-diagram" data-xy="' + escapeHtml(code) + '"></div>';
    });
    return {
      html: clean,
      macros: macros,
      hasLegacyTikz: legacyTikz.length > 0,
      hasXy: xyBlocks.length > 0
    };
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

  /* MathJax 3 + XyJax-v3：只在出现 \xymatrix 时懒加载。
     普通公式继续由 KaTeX 处理；XyJax 输出内联 SVG，快于浏览器内运行完整 TeX。 */
  function loadXy(done){
    if (xyReady) return done(true);
    xyWaiters.push(done);
    if (xyStarted) return;
    xyStarted = true;

    var xyBase = new URL('assets/xyjax/', document.baseURI).href.replace(/\/$/, '');
    window.MathJax = {
      loader: {
        load: ['[custom]/xypic.js'],
        paths: { custom: xyBase }
      },
      tex: {
        packages: { '[+]': ['xypic'] }
      },
      startup: { typeset: false }
    };
    loadScript(['assets/mathjax/tex-chtml-full.js'], function(ok){
      if (!ok){
        xyStarted = false;
        var failed = xyWaiters.splice(0);
        failed.forEach(function(cb){ cb(false); });
        return;
      }
      var ready = window.MathJax && window.MathJax.startup && window.MathJax.startup.promise;
      Promise.resolve(ready).then(function(){
        xyReady = true;
        var waiting = xyWaiters.splice(0);
        waiting.forEach(function(cb){ cb(true); });
      }).catch(function(){
        xyStarted = false;
        var failed = xyWaiters.splice(0);
        failed.forEach(function(cb){ cb(false); });
      });
    });
  }

  function renderXy(el){
    if (!el || !el.querySelectorAll) return;
    var slots = Array.prototype.slice.call(el.querySelectorAll('.xy-diagram[data-xy]'));
    if (!slots.length) return;
    loadXy(function(ok){
      if (!ok){
        slots.forEach(function(slot){
          slot.className += ' xy-error';
          slot.textContent = '交换图组件加载失败。';
        });
        return;
      }
      slots.forEach(function(slot){
        if (slot.getAttribute('data-xy-rendered') === '1') return;
        var source = slot.getAttribute('data-xy') || '';
        slot.removeAttribute('data-xy');
        slot.setAttribute('data-xy-rendered', '1');
        slot.textContent = '\\[' + source + '\\]';
      });
      window.MathJax.typesetPromise(slots).catch(function(err){
        slots.forEach(function(slot){
          slot.className += ' xy-error';
          slot.textContent = '交换图编译失败：请检查 \\xymatrix 语法。';
        });
        if (window.console) console.error(err);
      });
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
    renderXy: renderXy,
    loadComments: loadComments
  };
})();
