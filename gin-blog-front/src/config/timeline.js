/**
 * 历程时间线: /timeline 页面从这里渲染, 改这个文件即可
 * type 只影响圆点颜色: study 蓝 / project 绿 / award 橙 / other 灰
 * major: true → 星图"大站"(高亮); now: true → "你在这"当前站
 * 本文件 = DKXaiLBY 的 AI 辅助开发编年史 (2025.09 入学 → 至今)
 */
export default [
  {
    date: '2025.09',
    title: '开启大学生活',
    desc: '进入广州理工学院计算机科学与技术专业，开始系统学习编程。',
    type: 'study',
  },
  {
    date: '2026.05',
    title: 'LeetCode 算法练习起步',
    desc: '用 Java 手写 TwoSum、求多数元素……为校招打底，一切的开始。',
    type: 'study',
  },
  {
    date: '2026.06.01',
    title: '连连看小游戏双版本',
    desc: '两天写完连连看：经典版 + 现代版。小项目的乐趣在于当天能玩上。',
    type: 'project',
  },
  {
    date: '2026.04-06',
    title: 'LoveGirl 情侣 App 深度演进',
    desc: '从 v3.2.0 (build79) 一路迭代到 v3.6.5 (build99)：情侣互动、纪念日、相册与通知中心等模块逐步成型。这个项目后来变成了马拉松。',
    type: 'project',
  },
  {
    date: '2026.06.10',
    title: 'LoveGirl v3.4.0 大版本',
    desc: '建立 git 基线（v3.3.9）并于当天发布 v3.4.0：16 个 CRUD 端点、经期管理深度优化、生活工具、投喂站全链路。',
    type: 'project',
  },
  {
    date: '2026.06.23',
    title: 'LoveGirl Flutter 仓库独立',
    desc: 'Flutter 仓库独立成库（v3.10.0 build110），从此开启 192 个 commit 的长跑——一直跑到现在。',
    type: 'project',
    major: true,
  },
  {
    date: '2026.06.25',
    title: '个人主页初版',
    desc: '第一版个人主页上线，后来推翻重做了几次——完美主义者的宿命。',
    type: 'other',
  },
  {
    date: '2026.06.29',
    title: 'AI 工作流起飞日 🚀',
    desc: 'Codex 首日爆发：一天开出 25 个会话——情侣 App 与番茄专注的产品第一性原理推演、五维度 QA 自动化检测协议、灵动岛与博客项目同日开工。',
    type: 'project',
    major: true,
  },
  {
    date: '2026.07.06',
    title: 'ZCode 时代开启',
    desc: '首任指挥中心是「三国杀项目」目录——名字与实际工作无关，LoveGirl v3.27→v3.31 的连续施工都在这里完成。',
    type: 'project',
  },
  {
    date: '2026.07-09',
    title: '自研「对抗式开发流程」',
    desc: '豆包/Codex/WorkBuddy 出方案 → 主力 AI 施工 → 独立会话扮演敌意代码审查员专门挑刺 → 攻不破才合并。这套流程贯穿了之后所有项目。',
    type: 'other',
    major: true,
  },
  {
    date: '2026.07.12',
    title: '番茄专注正式发版期',
    desc: 'WorkBuddy/豆包工作台 12 个工作区：自习室重写为沉浸专注室、对抗式 QA 审查、每版配发版总览文档——工程化拉满的一段。',
    type: 'project',
    major: true,
  },
  {
    date: '2026.07.20',
    title: '效率工具折腾日',
    desc: 'Obsidian 改造为自动知识库 + Windows 软件数据迁移全方案。',
    type: 'other',
  },
  {
    date: '2026.07.30',
    title: '「灵阅」AI 采集员上线',
    desc: '为 60 秒旗舰手机评测短视频自动采集素材并产出分析报告——AI 内容工作流的第一次尝试。',
    type: 'other',
  },
  {
    date: '2026.08.20',
    title: '修复罢工的 Claude Code',
    desc: 'Claude Code 突然无法使用，手动排查环境问题。用 AI 用得多了，修 AI 也成了技能。',
    type: 'other',
  },
  {
    date: '2026.08.22',
    title: 'Claw（抖音保活自动化）立项',
    desc: 'Node.js/TypeScript 定时自动化工具：每日随机调度、干跑演练、Docker 容器化部署。',
    type: 'project',
  },
  {
    date: '2026.08.29',
    title: 'LoveGirl 地图攻坚',
    desc: '高德真地图定位蓝点、方向箭头、精度圈，旅行地图乱码与闪退全修——地图类开发的水比想象中深。',
    type: 'project',
  },
  {
    date: '2026.09',
    title: '多线并行期',
    desc: 'SparkKeeper 自动化工具交付、wxxcx 小程序立项规划——多项目并行的日子。',
    type: 'project',
  },
  {
    date: '2026.09.20-28',
    title: 'LoveGirl 高频迭代周',
    desc: '美食手账（共同餐桌+品尝评分+新菜图鉴+爱心豆奖励闭环）、拍立得手账（和纸胶带+相纸白框）、愿望兑换券（爱心豆经济）、时光轴批量管理——v3.28→v3.39 连续 6 个大版本，回归测试兜底的高频发版节奏。',
    type: 'project',
  },
  {
    date: '2026.09.28',
    title: '博客深度二开上线 ✨',
    desc: '基于 gin-vue-blog 深度二开：修复上游安全漏洞、主题系统重构、自研项目展示与简历模块、Docker 全栈部署上阿里云——你正在看的这个网站。',
    type: 'project',
    major: true,
    now: true,
  },
]
