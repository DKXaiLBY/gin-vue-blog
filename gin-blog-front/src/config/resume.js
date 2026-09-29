/**
 * 简历数据: /resume 页面从这里渲染, 改这个文件即可更新简历
 * 打印/导出 PDF: 简历页右上角按钮 (浏览器打印为 PDF)
 */
export default {
  name: 'DKXaiLBY',
  slogan: '广州理工学院 · 计算机科学与技术 · 2029 届',
  contacts: [
    { icon: 'i-mdi:github', label: 'GitHub', value: 'github.com/DKXaiLBY', link: 'https://github.com/DKXaiLBY' },
  ],

  educations: [
    {
      school: '广州理工学院',
      major: '计算机科学与技术（本科）',
      time: '2025.09 - 2029.06',
      desc: '主修数据结构、操作系统、计算机网络、数据库原理等核心课程',
    },
  ],

  // 技能分两组渲染: 熟练 / 了解
  skills: {
    proficient: ['Flutter / Dart', 'Vue3', 'JavaScript / TypeScript', 'Node.js', 'Git'],
    familiar: ['Go / Gin', 'MySQL', 'Redis', 'Docker', 'Linux'],
  },

  // 项目经历: 也可以直接引项目展示页的数据, 这里放简历专属的精简版
  projects: [
    {
      name: 'LoveGirl —— 情侣互动 App（Flutter 全栈）',
      time: '2026.08 - 至今',
      desc: '独立开发并长期维护的情侣关系管理 App：衣柜管理、数字形象、旅行地图、相册翻页、通知中心等模块，配套 Node/Express + MySQL 接口服务；以 170+ 次构建持续迭代至今，并在仓库中维护 AGENTS.md / BACKLOG 的工程化协作流程。',
      tech: 'Flutter · Dart · Node.js · Express · MySQL',
    },
    {
      name: '个人博客 —— 开源项目深度二次开发',
      time: '2026.09 - 至今',
      desc: '基于 gin-vue-blog 深度二开：修复上游 MD5 弱哈希安全隐患、品牌色 CSS 变量化实现明暗双主题、自研项目展示模块（Go 数据模型 + API + 后台管理页 + 前台展示页）、新增简历页与历程时间线，Docker 全栈部署至阿里云 ECS 并完成反代与安全加固。',
      tech: 'Vue3 · TypeScript · Go · Gin · MySQL · Redis · Docker',
    },
    {
      name: 'SparkKeeper —— 定时任务自动化工具',
      time: '2026.08',
      desc: 'Node.js/TypeScript 编写的定时自动化工具：每日随机时间调度、干跑演练模式、容器化部署，配套 Web 状态页。',
      tech: 'Node.js · TypeScript · Docker',
    },
    {
      name: 'Tomato —— 安卓应用与自分发官网',
      time: '2026',
      desc: '安卓应用及配套官网：不走应用商店的自分发模式，官网动态读取版本接口并提供二维码下载。',
      tech: 'Android · Node.js',
    },
  ],

  awards: [],

  selfEvaluation: '大二在读，多个个人项目并行推进且长期维护；习惯把工程化实践（文档、回归测试、自动化构建）带进个人项目；持续在 GitHub 记录学习轨迹，享受从想法到上线的完整过程。',
}
