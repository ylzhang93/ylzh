/* ============================================================
   站点配置
   注意：个人敏感信息（owner / repo / privateRepo / editorKey）
   不写在这里！它们保存在你自己的浏览器 localStorage 里，
   在写作页（write.html）的「站点设置」中填写，每个浏览器单独保存。
   此文件只保留非敏感配置。
   ============================================================ */
window.SITE_CONFIG = {
  /* 以下个人配置由浏览器本地提供（写作页「站点设置」填写） */
  owner: '',            /* GitHub 用户名 */
  repo: '',             /* 公开仓库 */
  privateRepo: '',      /* 私有笔记仓库 */
  editorKey: '',        /* 写作口令（可选，隐私帘） */

  /* 默认分支 */
  branch: 'main',

  /* 全站 LaTeX 自定义宏（KaTeX macros）：写 \R 就是 \mathbb{R}。
     也可以只在一篇文章里用 :::macros 块定义（见 README「自定义宏」）。 */
  katexMacros: {
    '\\R': '\\mathbb{R}',
    '\\C': '\\mathbb{C}',
    '\\N': '\\mathbb{N}',
    '\\Z': '\\mathbb{Z}',
    '\\Q': '\\mathbb{Q}',
    '\\F': '\\mathcal{F}',
    '\\norm': '\\left\\lVert #1 \\right\\rVert',
    '\\abs': '\\left\\lvert #1 \\right\\rvert'
  },

  /* 评论区（giscus，基于 GitHub Discussions，访客用 GitHub 账号即可回复）
     启用步骤见 README「评论与回复」 */
  comments: {
    enabled: false,
    repo: '',
    repoId: '',
    category: 'Announcements',
    categoryId: '',
    strict: false
  }
};

/* 个人配置从 localStorage 合并（每台浏览器单独保存，见写作页「站点设置」） */
(function(){
  'use strict';
  var KEYS = ['owner', 'repo', 'privateRepo', 'editorKey'];
  try {
    KEYS.forEach(function(k){
      var v = localStorage.getItem('zyl_cfg_' + k);
      if (v !== null) window.SITE_CONFIG[k] = v;
    });
  } catch (e) {}
  window.SITE_CFG = {
    get: function(k){ return window.SITE_CONFIG[k]; },
    set: function(k, v){
      window.SITE_CONFIG[k] = v;
      try {
        if (v) localStorage.setItem('zyl_cfg_' + k, v);
        else localStorage.removeItem('zyl_cfg_' + k);
      } catch (e) {}
    }
  };
})();
