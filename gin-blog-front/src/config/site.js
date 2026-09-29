/**
 * 站点级开关配置: 改这里, 不用动组件
 */
export default {
  // GitHub 用户名: 填了才会在首页显示提交热力图, 留空隐藏
  githubUsername: 'DKXaiLBY',

  // giscus 评论: 基于 GitHub Discussions 的免费评论系统
  // 到 https://giscus.app 生成这四个值后填进来, repo 留空则文章底部不渲染 giscus
  giscus: {
    repo: '',
    repoId: '',
    category: 'Announcements',
    categoryId: '',
  },
}
