/* ============================================================
   博客搜索 / 标签 / slug 工具（纯函数，无 DOM 依赖，便于测试）
   ============================================================ */
(function(){
  'use strict';

  window.Search = {

    /* 文章是否匹配查询 q（q 已转小写）
       p       —— 清单条目 {file,title,title_zh,title_en,date,tags}
       content —— 文章全文（可选，传 null 则只搜元信息） */
    matchPost: function(p, content, q){
      if (!q) return true;
      var hay = [
        p.title || '', p.title_zh || '', p.title_en || '',
        p.date || '', (p.tags || []).join(' ')
      ].join(' ').toLowerCase();
      if (hay.indexOf(q) !== -1) return true;
      if (content && content.toLowerCase().indexOf(q) !== -1) return true;
      return false;
    },

    /* 提取首次命中处的前后文片段（用于正文搜索高亮） */
    snippet: function(content, q, radius){
      radius = radius || 55;
      var i = content.toLowerCase().indexOf(q);
      if (i === -1) return '';
      var start = Math.max(0, i - radius);
      var end = Math.min(content.length, i + q.length + radius);
      var s = content.slice(start, end).replace(/\s+/g, ' ').trim();
      return (start > 0 ? '…' : '') + s + (end < content.length ? '…' : '');
    },

    /* 高亮片段中的查询词（返回 HTML，调用方负责插入） */
    highlight: function(text, q){
      if (!q) return text;
      var esc = String(text).replace(/[&<>"']/g, function(c){
        return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
      });
      return esc.replace(new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'),
        '<mark>$1</mark>');
    },

    /* 标题 → 文件名 slug */
    slugify: function(title){
      return String(title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    },

    /* 日期本地化：2026-08-30 → 中文「2026年8月30日」/ 英文「Aug 30, 2026」 */
    formatDate: function(s, lang){
      var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || '').trim());
      if (!m) return String(s || '');
      var y = m[1], mo = +m[2], d = +m[3];
      if (lang === 'en'){
        var names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return names[mo - 1] + ' ' + d + ', ' + y;
      }
      return y + '年' + mo + '月' + d + '日';
    },

    /* 统计全部标签及出现次数（按次数降序，再按名称） */
    distinctTags: function(posts){
      var m = {};
      posts.forEach(function(p){
        (p.tags || []).forEach(function(t){ m[t] = (m[t] || 0) + 1; });
      });
      return Object.keys(m)
        .map(function(t){ return { tag: t, count: m[t] }; })
        .sort(function(a, b){
          return b.count - a.count || a.tag.localeCompare(b.tag);
        });
    }
  };
})();
