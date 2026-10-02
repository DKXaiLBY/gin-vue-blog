# 更新日志

## v3.42 — 2026-10-02（动效交互 12 项 + 对抗性审查）

### 新增
- ① 主题切换圆形扩散（View Transitions API，降级安全）② 卡片聚光+3D 倾斜 ③ 点赞粒子爆裂 ④ 交错入场补齐 ⑤ 页面转场 ⑧ 时间问候语 ⑨ 实时在线人数（新接口 /api/front/online，ZSet 5 分钟窗口）
- ⑩ Ask DKX AI 助手挂件（规则匹配知识库 + 文章搜索兜底，右下角悬浮球）
- ㉒ 年度编程报告页 /annual（站内真实数据聚合 + html2canvas 生成分享卡片）
- ㉑' 终端打字测速（play type，WPM 本地排行）㉔ 文章页键盘 ←→ 翻页 ㉗ Ctrl+K 内置计算器（=表达式，回车复制）

### 修复（对抗性审查产出）
- **P0** annual 页 computed 未导入必白屏（审查员抓出；浏览器验收曾误诊为环境问题）
- **P1** 请求失败 toast 与"静默降级"设计冲突（http.js 增加 silent 标记）；TerminalHero 顶层裸读 localStorage 可崩首页；在线人数语义修正（report 心跳，活跃访客不再被漏计）
- **P2** 转场多根组件失效（home/article 单根包裹）；键盘翻页浮层守卫（收款码/灯箱/登录/搜索）；IME 回车守卫×3；打字测速打错反馈 + 假准确率移除；html2canvas rgba 兼容；Go pipeline + 告警 + TTL；AI 匹配大小写

### 已知限制
- 点赞爆裂需登录后触发（未登录走登录弹窗，属既有逻辑）
- Lighthouse 总分维持 64（瓶颈为服务器 TTFB 与外链资源）

## v3.41 — 2026-10-02（真·心跳监控）

### 新增
- **宿主机自检监控**：cron 每分钟探活 HTTP/内存/磁盘，状态翻转才告警（不刷屏）；结果写 Redis 并在 /status 页显示「✓ 自检通过 · N 秒前」
- **推送钩子**：Server酱/Bark 二选一，填 /opt/blog/monitor/notify.conf 即可让告警上手机（默认仅日志）
- 宕机演练验证：停服 78s → FAIL+NOTIFY，重启 → RECOVER，全链路通过

## v3.40 — 2026-10-02（P3~P6 连续施工）

### 新增
- **DKX OS 桌面彩蛋**：首页终端敲 `boot dkx-os` 唤起全屏"电脑桌面"——项目图标导航、可拖动的关于本机窗口（neofetch 风格真数据）、任务栏时钟 + 关机（Esc 也可）
- **站点状态页** `/status`：运行时长秒级跳动 + Go 版本/堆内存/协程数/内容计数（新后端接口 `/api/front/status`，只读非敏感），入口在 Ctrl+K 面板和页脚
- **SEO 分享层**：OG 标签 + WebSite JSON-LD + description（QQ/微信分享出卡片的基础）；路由级动态覆写；文章页用真实标题/摘要覆写；`scripts/gen-sitemap.mjs` sitemap 自动生成
- **测试**：终端命令分发 11 条 + 星图站点选择 5 条单测；全站测试修至 **34 文件 / 213 用例全绿**

### 修复
- 根治 vitest 套件崩溃（4 个套件）：plugin-vue v6 把静态 `src="/xxx"` 编译成模块导入所致，6 处 public 资源改 `:src` 绑定
- 移动端两处断点溢出：星图纵向断点提到 1023px；flex 父级 `mx-auto` fit-content 陷阱补 `w-full`
- 首页 4 条无限滚动旧测试重写为「加载更多」语义；user/about/message 的上游品牌期望更新为 DKXaiLBY 现状
- 头像原图备份误放 public/ → 移至 docs/img/avatar-original/

### 优化
- 头像 1080px/135KB → 512px/16KB（-88%），LCP 预加载 + fetchpriority；Lighthouse 总载荷 305KB → 196KB（-36%）
- 后台仪表盘问候渐变 + 登录图标从科技蓝对齐品牌靛紫
- nginx 增加安全响应头四件套（nosniff / XFO / Referrer-Policy / Permissions-Policy）

### 运维
- 备份恢复演练（真实覆盖恢复事故级）：验证备份完整可用；mysqldump 含 `USE gvb` 陷阱与 charset 验证规范已写入 handoff
- GHCR 中转评估：ghcr.io 不可达，维持 save|gzip|scp|load 手动部署为标准流程
- git 远端修正：origin 曾误指上游 szluyu99 → 现 origin=DKXaiLBY fork、upstream=szluyu99

### 内容
- 说说 +3 条（10 月迭代实录：改版上线 / 测试修绿 / 彩蛋线索），说说页共 20 条

## v3.39 — 2026-10-01（P1~P2）

### 新增
- **终端 Hero**：首页一言打字机升级为可交互终端（命令分发/历史记录/fortune 一言/sudo hire-me 跳简历）
- **星图历程页**：/timeline 改造为横向「开发地铁图」（19 站、拖拽滚动、点击详情、移动端纵排）
- **图片灯箱**：文章正文图片点击放大（Esc/点背景关闭）
- **页脚实时状态徽章**：呼吸绿点 + 运行天数/文章数/总访问
- **Ctrl+K 命令面板**：页面直达 + 切主题 + 文章搜索

### 修复
- git origin 误指上游仓库 → 修正并推送 fork
- 终端被 Hero 光斑遮挡（position:relative）
- CommandPalette 漏导入 watch 导致静默不渲染
- 页脚 dayjs 依赖撑爆 chunk 13KB → 1.2KB

详细验收证据见 docs/verification/。
