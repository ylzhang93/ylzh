/* ============================================================
   GitHub Contents API 封装（write.html / blog.html 共用）
   注意：所有写操作都需要你的个人令牌（token），访客没有令牌，
   无法修改任何内容。评论（giscus）走 GitHub Discussions，与此无关。
   ============================================================ */
(function(){
  'use strict';

  /* 请求 GitHub Contents API */
  function api(method, path, cfg, token, body){
    return fetch('https://api.github.com/repos/' + cfg.owner + '/' + cfg.repo + '/contents/' + path, {
      method: method,
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: body ? JSON.stringify(body) : undefined
    }).then(function(r){
      return r.json().then(function(j){ return { ok: r.ok, j: j }; });
    });
  }

  function decodeB64(s){
    return new TextDecoder().decode(Uint8Array.from(atob(s), function(c){ return c.charCodeAt(0); }));
  }
  function encodeB64(s){
    return btoa(unescape(encodeURIComponent(s)));
  }

  /* 读取文章清单（返回 posts 数组） */
  function readIndex(cfg, token){
    return api('GET', 'posts/index.json', cfg, token).then(function(res){
      if (!res.ok) return [];
      try { return JSON.parse(decodeB64(res.j.content)); } catch (e) { return []; }
    });
  }

  /* 写入文章清单（获取最新 sha 后 PUT） */
  function writeIndex(cfg, token, posts, done){
    api('GET', 'posts/index.json', cfg, token).then(function(res){
      api('PUT', 'posts/index.json', cfg, token, {
        message: 'update posts/index.json',
        content: encodeB64(JSON.stringify(posts, null, 2) + '\n'),
        sha: res.ok ? res.j.sha : null,
        branch: cfg.branch
      }).then(function(r){
        done(r.ok, r.ok ? '' : (r.j.message || ''));
      });
    });
  }

  /* 删除一篇文章：删 md 文件 + 从清单移除。done(ok, msg) */
  function deletePost(cfg, token, file, done){
    api('GET', file, cfg, token).then(function(res){
      if (!res.ok){ done(false, res.j.message || ''); return; }
      api('DELETE', file, cfg, token, {
        message: 'delete: ' + file,
        sha: res.j.sha,
        branch: cfg.branch
      }).then(function(del){
        if (!del.ok){ done(false, del.j.message || ''); return; }
        readIndex(cfg, token).then(function(posts){
          posts = posts.filter(function(p){ return p.file !== file; });
          writeIndex(cfg, token, posts, function(ok, msg){ done(ok, msg); });
        });
      });
    });
  }

  window.GH = {
    api: api,
    decodeB64: decodeB64,
    encodeB64: encodeB64,
    readIndex: readIndex,
    writeIndex: writeIndex,
    deletePost: deletePost
  };
})();
