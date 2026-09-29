/**
 * 历程时间线: /timeline 页面从这里渲染, 改这个文件即可
 * type 只影响圆点颜色: study 蓝 / project 绿 / award 橙 / other 灰
 */
export default [
  {
    date: '2025.09',
    title: '开启大学生活',
    desc: '进入广州理工学院计算机科学与技术专业，开始系统学习编程。',
    type: 'study',
  },
  {
    date: '2026.08',
    title: '多个个人项目并行推进',
    desc: 'LoveGirl 情侣 App 持续迭代至 v3.38（170+ 次构建），同期完成 SparkKeeper 自动化工具与 Tomato 应用自分发官网。',
    type: 'project',
  },
  {
    date: '2026.09',
    title: '深度二开个人博客',
    desc: '基于开源项目 gin-vue-blog 深度定制：修复上游安全漏洞、自研项目展示模块、新增简历与历程页，Docker 全栈部署上线。',
    type: 'project',
  },
]
