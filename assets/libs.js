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

  /* Markdown → 安全 HTML（公式已还原为 $…$ 文本，未做 KaTeX 排版） */
  function renderMarkdown(md){
    var mathSpans = [];
    function protectSeg(seg){
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
    return window.DOMPurify.sanitize(html);
  }

  /* 对容器内公式做 KaTeX 排版 */
  function renderMathIn(el){
    if (!window.renderMathInElement) return;
    renderMathInElement(el, {
      delimiters: [
        {left: '$$', right: '$$', display: true},
        {left: '$', right: '$', display: false},
        {left: '\\[', right: '\\]', display: true},
        {left: '\\(', right: '\\)', display: false}
      ],
      throwOnError: false
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
    loadComments: loadComments
  };
})();
