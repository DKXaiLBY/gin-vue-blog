/**
 * 站点级开关配置: 改这里, 不用动组件
 */
export default {
  // GitHub 用户名: 填了才会在首页显示提交热力图, 留空隐藏
  githubUsername: 'DKXaiLBY',

  // giscus 评论: 基于 GitHub Discussions 的免费评论系统
  // ⚠️ 启用步骤: 在 github.com 网页上给仓库安装 giscus App
  //    (https://github.com/apps/giscus → Install → 选 gin-vue-blog)
  //    然后把下面 repo / repoId 两行的值填上即可, 其余两值已备好:
  //    repoId:    R_kgDOUxqCkw
  //    category:  Announcements
  //    categoryId: DIC_kwDOUxqCk84DGoK2
  giscus: {
    repo: 'DKXaiLBY/gin-vue-blog',
    repoId: 'R_kgDOUxqCkw',
    category: 'Announcements',
    categoryId: 'DIC_kwDOUxqCk84DGoK2',
  },
}
