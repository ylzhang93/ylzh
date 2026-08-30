/* ============================================================
   zyl personal site — i18n (zh / en)
   用法：
     <script src="assets/i18n.js"></script>  放在 head 里
     需要翻译的元素加 data-i18n="key"（文本）或 data-i18n-html="key"（HTML）
     导航栏放一个 <button data-i18n-toggle type="button">EN</button>
     页面可选定义 window.onLangChange = function(lang){...}
   ============================================================ */
(function(){
  'use strict';

  var KEY = 'zyl-lang';

  var dict = {
    zh: {
      page_title: 'zyl · 数学',

      nav_about: '关于',
      nav_research: '研究',
      nav_blog: '博客',
      nav_contact: '联系',

      hero_overline: '数学博士研究生',
      about_title: '关于',
      about_1: '我是 zyl，一名数学博士生，对代数几何、模空间与数论怀有持久的兴趣。这个页面是一个安静的地方——安放我对数学的一些想法与记录。',
      research_title: '研究兴趣',
      card1_title: '代数几何',
      card1_desc: '层的上同调、光滑与奇点。',
      card2_title: '模空间',
      card2_desc: '曲线的模空间、GIT 与紧化。',
      card3_title: '数论',
      card3_desc: '算术对象中的对称与秩序。',
      contact_title: '联系',
      contact_note: '欢迎来信交流数学。',
      footer_copy: '纸与墨写就',

      blog_title: '博客',
      blog_sub: '用 Markdown 与 LaTeX 语法，记录数学的思考。',
      blog_empty: '还没有文章——写第一篇吧：<code>python new_post.py "文章标题"</code>',

      back_blog: '← 返回博客',
      loading: '正在加载…',
      load_fail: '博客组件加载失败，请检查网络后重试。',
      no_post: '未指定文章。',
      post_missing: '文章不存在或尚未发布：',
      prev_dir: '上一篇',
      next_dir: '下一篇'
    },

    en: {
      page_title: 'zyl · Mathematics',

      nav_about: 'About',
      nav_research: 'Research',
      nav_blog: 'Blog',
      nav_contact: 'Contact',

      hero_overline: 'PhD Student in Mathematics',
      about_title: 'About',
      about_1: 'I am zyl, a PhD student in mathematics with a lasting interest in algebraic geometry, moduli spaces and number theory. This page is a quiet corner for my mathematical thoughts and notes.',
      research_title: 'Research',
      card1_title: 'Algebraic Geometry',
      card1_desc: 'Sheaf cohomology, smoothness and singularities.',
      card2_title: 'Moduli Spaces',
      card2_desc: 'Moduli of curves, GIT and compactification.',
      card3_title: 'Number Theory',
      card3_desc: 'Symmetry and order in arithmetic objects.',
      contact_title: 'Contact',
      contact_note: 'Always happy to talk math.',
      footer_copy: 'Made with paper & ink',

      blog_title: 'Blog',
      blog_sub: 'Mathematical thoughts, written in Markdown & LaTeX.',
      blog_empty: 'No posts yet — write your first one: <code>python new_post.py "Title"</code>',

      back_blog: '← Back to Blog',
      loading: 'Loading…',
      load_fail: 'Failed to load the blog engine. Check your connection and retry.',
      no_post: 'No article specified.',
      post_missing: 'Article not found: ',
      prev_dir: 'Prev',
      next_dir: 'Next'
    }
  };

  /* 初始语言：本地记忆 > 浏览器语言 > 中文 */
  var lang = 'zh';
  try {
    var saved = localStorage.getItem(KEY);
    if (saved === 'zh' || saved === 'en'){
      lang = saved;
    } else if ((navigator.language || '').toLowerCase().indexOf('zh') === 0){
      lang = 'zh';
    } else {
      lang = 'en';
    }
  } catch (e) { /* localStorage 不可用时保持默认 */ }

  document.documentElement.lang = lang;

  function apply(){
    var i, el, key, v;
    document.documentElement.lang = lang;
    var textEls = document.querySelectorAll('[data-i18n]');
    for (i = 0; i < textEls.length; i++){
      el = textEls[i];
      key = el.getAttribute('data-i18n');
      v = dict[lang][key];
      if (v !== undefined) el.textContent = v;
    }
    var htmlEls = document.querySelectorAll('[data-i18n-html]');
    for (i = 0; i < htmlEls.length; i++){
      el = htmlEls[i];
      key = el.getAttribute('data-i18n-html');
      v = dict[lang][key];
      if (v !== undefined) el.innerHTML = v;
    }
    var btns = document.querySelectorAll('[data-i18n-toggle]');
    for (i = 0; i < btns.length; i++){
      btns[i].textContent = lang === 'zh' ? 'EN' : '中文';
      btns[i].setAttribute('aria-label', lang === 'zh' ? 'Switch to English' : '切换到中文');
    }
    if (window.onLangChange) window.onLangChange(lang);
  }

  window.I18N = {
    get lang(){ return lang; },   /* getter：始终反映当前语言 */
    t: function(key){
      return dict[lang][key] !== undefined ? dict[lang][key] : key;
    },
    setLang: function(l){
      lang = (l === 'en') ? 'en' : 'zh';
      try { localStorage.setItem(KEY, lang); } catch (e) {}
      apply();
    }
  };

  document.addEventListener('click', function(e){
    var btn = e.target.closest ? e.target.closest('[data-i18n-toggle]') : null;
    if (btn) I18N.setLang(I18N.lang === 'zh' ? 'en' : 'zh');
  });

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }
})();
