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
      next_dir: '下一篇',

      write_link: '写作',
      write_title: '写作',
      notfound_text: '页面不存在。',
      owner_link: '站长入口',
      gate_prompt: '此页面仅限站长使用，请输入口令。',
      gate_ph: '口令',
      gate_unlock: '解锁',
      gate_wrong: '口令错误，请重试。',
      cfg_missing: '请先在 assets/config.js 中填写 owner 与 repo。',
      token_lbl: 'GitHub Token',
      token_ph: 'ghp_…（仅保存在你的浏览器）',
      token_help: '只需填写一次，保存在你的浏览器里，不会上传到任何服务器。需要仓库 contents 读写权限。',
      remember_lbl: '在这台电脑上记住令牌',
      remember_hint: '别人的电脑请勿勾选——令牌只本次使用，关闭浏览器即消失。',
      draft_lbl: '保存为草稿（访客不可见）',
      draft_badge: '草稿',
      draft_count: '还有 {n} 篇草稿',
      post_draft: '这篇文章尚未发布。',
      draft_hint: '草稿不会出现在列表/搜索/文章中，但文件仍在公开仓库里（GitHub Pages 免费版仓库必须公开）——如需绝对保密请勿写入。',
      f_existing: '编辑已有文章',
      f_new: '（新文章）',
      f_title: '标题',
      f_title_en: '英文标题（可选）',
      f_tags: '标签（回车添加，可多个）',
      f_slug: '文件名 slug',
      f_body: '正文（Markdown + LaTeX）',
      f_filename: '文件路径',
      btn_preview: '预览',
      btn_save: '保存发布',
      btn_delete: '删除文章',
      saved_ok: '已保存发布！稍等片刻即可在博客页看到。',
      save_fail: '保存失败：',
      del_confirm: '确定删除这篇文章？此操作不可撤销。',
      del_ok: '已删除。',
      need_token: '请先填写 GitHub Token。',
      need_title: '请填写标题。',
      need_body: '请填写正文。',
      searching: '搜索中…',
      search_ph: '搜索标题、标签或正文…',
      all_tags: '全部',
      no_results: '没有匹配的文章',
      plus_new: '写日志',
      comments_title: '评论',
      comments_note: '回复需要 GitHub 账号，登录后即可跟帖。',
      token_link: '创建令牌 →',

      tb_bold: '加粗',
      tb_italic: '斜体',
      tb_heading: '标题',
      tb_list: '列表',
      tb_quote: '引用',
      tb_code: '代码块',
      tb_link: '链接',
      tb_image: '图片',
      tb_math: '行内公式',
      tb_mathblock: '块级公式',
      tb_aopsmath: 'AoPS 公式',
      tb_env: '多行环境（align*）',
      tb_symbols: '符号与表情',
      tb_spoiler: '隐藏解答（点击展开）',
      tb_spoiler_lbl: '隐藏',
      tb_mathfmt: '数学字体与修饰',
      tb_thm: '定理环境',
      spoiler_summary: '点击查看解答',
      spoiler_ph: '这是解答。',
      row_edit: '编辑',
      row_delete: '删除',
      badge_latest: '最新',
      post_count: '共 {n} 篇文章',
      preview_close: '关闭预览'
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
      next_dir: 'Next',

      write_link: 'Write',
      write_title: 'Write',
      notfound_text: 'Page not found.',
      owner_link: 'Owner entry',
      gate_prompt: 'This page is for the site owner only. Enter the passphrase.',
      gate_ph: 'Passphrase',
      gate_unlock: 'Unlock',
      gate_wrong: 'Wrong passphrase, try again.',
      cfg_missing: 'Fill in owner and repo in assets/config.js first.',
      token_lbl: 'GitHub Token',
      token_ph: 'ghp_… (stored only in your browser)',
      token_help: 'Filled once, stored only in your browser, never uploaded. Needs contents read/write on the repo.',
      remember_lbl: 'Remember token on this computer',
      remember_hint: 'Leave unchecked on shared computers — the token is used once and never stored.',
      draft_lbl: 'Save as draft (hidden from visitors)',
      draft_badge: 'Draft',
      draft_count: '{n} drafts',
      post_draft: 'This post is not published yet.',
      draft_hint: 'Drafts are hidden from the list/search/posts, but the file still lives in the public repo (free GitHub Pages requires a public repo). For absolute secrecy, do not write it here.',
      f_existing: 'Edit an existing post',
      f_new: '(New post)',
      f_title: 'Title',
      f_title_en: 'Title (English, optional)',
      f_tags: 'Tags (Enter to add, multiple allowed)',
      f_slug: 'Filename slug',
      f_body: 'Body (Markdown + LaTeX)',
      f_filename: 'File path',
      btn_preview: 'Preview',
      btn_save: 'Save & Publish',
      btn_delete: 'Delete post',
      saved_ok: 'Saved! It will appear on the blog shortly.',
      save_fail: 'Save failed: ',
      del_confirm: 'Delete this post? This cannot be undone.',
      del_ok: 'Deleted.',
      need_token: 'Please enter your GitHub token first.',
      need_title: 'Please enter a title.',
      need_body: 'Please enter the body.',
      searching: 'Searching…',
      search_ph: 'Search titles, tags or text…',
      all_tags: 'All',
      no_results: 'No matching posts',
      plus_new: 'New Post',
      comments_title: 'Comments',
      comments_note: 'Replies require a GitHub account.',
      token_link: 'Create a token →',

      tb_bold: 'Bold',
      tb_italic: 'Italic',
      tb_heading: 'Heading',
      tb_list: 'List',
      tb_quote: 'Quote',
      tb_code: 'Code block',
      tb_link: 'Link',
      tb_image: 'Image',
      tb_math: 'Inline math',
      tb_mathblock: 'Block math',
      tb_aopsmath: 'AoPS math',
      tb_env: 'Multiline env (align*)',
      tb_symbols: 'Symbols & emoji',
      tb_spoiler: 'Spoiler (click to expand)',
      tb_spoiler_lbl: 'Hide',
      tb_mathfmt: 'Math fonts & accents',
      tb_thm: 'Theorem environments',
      spoiler_summary: 'Click to view solution',
      spoiler_ph: 'Solution goes here.',
      row_edit: 'Edit',
      row_delete: 'Delete',
      badge_latest: 'Latest',
      post_count: '{n} posts',
      preview_close: 'Close preview'
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
