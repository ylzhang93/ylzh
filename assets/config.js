/* ============================================================
   站点配置
   ============================================================ */
window.SITE_CONFIG = {
  /* TODO: 你的 GitHub 用户名 */
  owner: '',
  /* TODO: 仓库名（发布到 GitHub Pages 的那个仓库） */
  repo: '',
  /* 默认分支 */
  branch: 'main',

  /* 写作页口令：只有知道口令的人能打开编辑器界面。
     注意：口令写在网页源码里，只是"隐私帘"——真正的写权限
     由 GitHub Token 保证（见 README）。留空则直接显示编辑器。 */
  editorKey: '',

  /* 评论区（giscus，基于 GitHub Discussions，访客用 GitHub 账号即可回复）
     启用步骤见 README「评论与回复」：
     1. 仓库 Settings → Features 启用 Discussions
     2. 安装 https://github.com/apps/giscus 并授权该仓库
     3. 打开 https://giscus.app 选择分类，复制 repo-id / category-id
     4. 填好下面各项并把 enabled 改为 true */
  comments: {
    enabled: false,
    repo: '',                    /* 形如 "用户名/仓库名" */
    repoId: '',
    category: 'Announcements',
    categoryId: '',
    strict: false                /* true = 仅仓库协作者可评论 */
  }
};
