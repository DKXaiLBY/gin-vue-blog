/**
 * 简历数据: /resume 页面从这里渲染, 改这个文件即可更新简历
 * 打印/导出 PDF: 简历页右上角按钮 (浏览器打印为 PDF)
 */
export default {
  name: '你的名字',
  slogan: '计算机科学与技术 · 求职中',
  contacts: [
    { icon: 'i-mdi:email-outline', label: '邮箱', value: 'your@email.com' },
    { icon: 'i-mdi:github', label: 'GitHub', value: 'github.com/yourname', link: 'https://github.com/yourname' },
    { icon: 'i-mdi:phone-outline', label: '电话', value: '138-xxxx-xxxx' },
  ],

  educations: [
    {
      school: 'XX 学院',
      major: '计算机科学与技术（本科）',
      time: '2025.09 - 2029.06',
      desc: '主修数据结构、操作系统、计算机网络、数据库原理等核心课程',
    },
  ],

  // 技能分两组渲染: 熟练 / 了解
  skills: {
    proficient: ['Vue3', 'JavaScript / TypeScript', 'Node.js', 'Git'],
    familiar: ['Go', 'MySQL', 'Redis', 'Docker', 'Linux'],
  },

  // 项目经历: 也可以直接引项目展示页的数据, 这里放简历专属的精简版
  projects: [
    {
      name: '个人博客（深度二开）',
      time: '2026.09 - 至今',
      desc: '基于开源项目 gin-vue-blog 二次开发：修复上游 MD5 弱哈希安全隐患、品牌色 CSS 变量化支持明暗双主题、自研项目展示模块（Go 表结构 + API + 后台管理页 + 前台展示页）、新增简历页与历程时间线。',
      tech: 'Vue3 · TypeScript · Gin · MySQL · Redis · Docker',
    },
  ],

  awards: [
    { time: '20XX.XX', text: '奖项名称（竞赛 / 证书 / 奖学金）' },
  ],

  selfEvaluation: '热爱编程，保持技术好奇心；有独立完成全栈小项目的能力，持续在 GitHub 记录学习轨迹。',
}
