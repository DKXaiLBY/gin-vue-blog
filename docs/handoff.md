# DKXaiLBY 个人博客 · 交接文档 v2

> 交接时间：2026-10-03
> 上一棒：ZCode（v3.39→v3.45.1 连续迭代）
> 本文档为当前状态的完整快照，接手前请全文读完。

---

## 一、项目是什么

**DKXaiLBY 的个人博客**——求职作品集网站，基于开源项目 gin-vue-blog 深度二开，Docker 四容器部署在阿里云 ECS。已完成从「上游项目的样子」到「DKX 世界观」的全面改造，上游作者基本认不出原貌。

- **线上地址**：http://47.121.119.191
- **管理后台**：http://47.121.119.191/admin/（密码用户已自行修改）
- **GitHub**：https://github.com/DKXaiLBY/gin-vue-blog（origin 指向 fork，upstream 指向 szluyu99 原仓库）
- **当前版本**：v3.45.1（tag `v3.45-stable` 已推送）
- **站点名**：阵雨（用户在后台改的）；作者名：DKXaiLBY

## 二、本地环境速查

| 项 | 位置/说明 |
|---|---|
| 项目根 | `D:\Projects\Personal\blog` |
| 前台 | `gin-blog-front`（Vue3+Vite+UnoCSS） |
| 后台 | `gin-blog-admin`（Vue3+naive-ui） |
| 后端 | `gin-blog-server`（Go+Gin+GORM） |
| 服务器 | 阿里云 ECS root@47.121.119.191（SSH 免密），Ubuntu 24.04，2核1.6G |
| 服务器代码 | `/opt/blog`（deploy/start 下 docker-compose：gvb-web/gvb-server/gvb-mysql/gvb-redis） |
| pnpm | `~/.local/bin`（corepack） |
| Go | `%LOCALAPPDATA%/Programs/go/bin/go.exe` |
| swag | `~/go/bin/swag.exe`（改路由注释后必须跑 `swag init -g ./cmd/main.go` 重生成 docs，否则 CI 挂） |
| 本地构建目录 | `deploy/build/web/dist_blog`（前台产物）+ `dist_admin`（后台产物） |
| 部署方式 | 本地 docker build → save\|gzip\|scp → 服务器 load → compose up（GHCR 不可达，手动部署是标准流程） |
| 换行 | .gitattributes 强制 LF |
| git 远端 | origin = DKXaiLBY fork（曾误指上游，已修正），upstream = szluyu99 |

## 三、当前功能全清单（全部已上线验收 ✓）

### 前台
- **终端 Hero**：首屏可交互终端，命令：help / ls projects / cat motto.txt / blog status / sudo hire-me（跳简历）/ play type（打字测速 WPM）/ annual（跳年度报告）/ boot dkx-os（全屏桌面彩蛋）/ clear；开场自动表演；问候语按时段变化；深色模式流星雨；头像悬停歪头+连点三次彩蛋
- **星图历程页** /timeline：19 站「开发地铁图」，大站高亮+「你在这」，点击站点出详情卡，≤1023px 转纵向
- **档案页** /archives：归档/分类/标签 三合一 Tab 页（提案 B），懒加载，深链 ?tab=xxx 已修复（初始 Tab 主动拉数据）
- **年度编程报告页** /annual：站内数据聚合 + html2canvas 生成分享 PNG
- **状态页** /status：Go /api/front/status（运行时长/内存/协程/计数）+ /api/front/online（在线人数 ZSet 5min 窗口），数字滚动动画
- **联系我页** /contact：终端风联系卡（QQ 复制/GitHub/留言板入口）
- **Ask DKX AI 助手**：右下角悬浮球，规则匹配知识库 + 文章搜索兜底；**真 AI 骨架已上线**（后端 /api/front/ai/chat：检索 MySQL → OpenAI 兼容 LLM，**等用户配智谱免费 Key**，未配自动回落规则版）
- **阅读体验**：文章图片灯箱、卡片阅读时长徽章、「上次读到哪里 N% · 继续阅读」提示条（localStorage 按文章存，保留 20 篇）、giscus 评论懒加载（IntersectionObserver）
- **微交互**：主题切换圆形扩散（View Transitions）、卡片聚光+3D 倾斜、点赞粒子爆裂、页面转场、滚动交错入场、深色模式流星雨、数字滚动、头像互动彩蛋、标签页离开彩蛋（标题变「去哪了」）、生日彩蛋（9.28 问候加🎂）
- **QQ 联系**：三处图标均为**点击复制号码**（wpa 临时会话不可靠已弃用）
- **导航扁平化**：首页/归档/项目/说说/简历/历程/留言 平铺 + 关于▾（关于我/联系我/友链/分类/标签）；**相册已并入说说**（/albums → /talks 重定向，相册页下线）
- **终端留言墙**：留言板弹幕黑底绿字命令行风（`DKXaiLBY@blog:~$ 内容`）
- SEO：OG/JSON-LD/description + router 动态覆写（setMeta 选择器属性值必须带引号！）+ 文章页真实摘要 + sitemap 生成脚本（scripts/gen-sitemap.mjs）
- RSS 2.0（/api/front/rss）、自动备份（每日 3 点 mysqldump+图片，7 天轮转，/opt/backups/）
- **宿主机监控**：cron 每分钟 /opt/blog/monitor/dkx-selfcheck（探活+内存+磁盘→Redis），状态页展示；**推送未激活**（需用户在 /opt/blog/monitor/notify.conf 填 Server酱/Bark key）

### 后台
- 项目管理（naive-ui CRUD）、登录页重设计、仪表盘靛紫主题
- 上游残留已清洗（品牌痕迹、娱乐菜单等）

### 质量基线
- 前台测试 **32 文件 / 207 用例全绿**（含 TerminalHero 11 条、档案页 11 条）
- lint 清零
- config.yml/config.docker.yml 已加 `AI:` 段（api-base/api-key/model）

## 四、Git 与回滚

```
git tags: v3.39-stable-pre-restyle → v3.40-stable → v3.41-stable → v3.42-stable
          → v3.44-stable → v3.45-stable（每个都是可回滚的稳定点）
服务器镜像 rollback tag: rollback-20261001 / rollback-v341
回滚动作: 服务器上把 compose 镜像 tag 改回 rollback-* → docker compose up -d
```
- push 遇「Failed to connect」= 家宽阻断窗口，等 150s 重试（后台 for 循环重试脚本好用）

## 五、⚠️ 陷阱清单（前几棒踩过的坑，必读）

1. **eslint --fix 会把模板 `:src="'/xxx'"` 字面量绑定转回静态 src**（vue/no-useless-v-bind fixer），静态 src 会被 plugin-vue v6 编译成模块导入 → vitest 全套件崩（file:///xxx.png 非法模块）。**public 资源一律放 script 常量再 `:src="CONST"` 绑定**（常量绑定规则不报错也不回退）
2. **Vue Transition 在被遮挡的后台标签页冻结**（rAF 节流）——Transition 卡在 *-leave-from 伪装成功能故障；先查组件是否真挂载（Vue 实例树 walk），别急着归因环境；IAB 里 setTimeout 也被钳到 1s+
3. **Vue3 setup 漏导入**（如 computed/watch）不报错不崩溃，组件静默不渲染——用「后续兄弟组件正常渲染」反常点定位；测试 mock 的 api 对象必须覆盖组件实际调用的所有方法
4. **追加 YAML 段必须确认前一行有换行**（曾把 `UseCdnDomains: falseAI:` 连写导致 YAML 解析崩、server 容器循环重启 3 分钟）
5. **mysqldump 恢复陷阱**：dump 自带 `CREATE DATABASE gvb` + `USE gvb`，直接灌进"临时库"实际覆盖正式库；恢复临时库必须剥头部；验证用 `--default-character-set=utf8mb4`（默认 latin1 中文显示乱码是假象，HEX 检查才作数）
6. **Windows 端口排除范围**（5041-5340 等）会吞 dev 端口（EACCES），换 5500 等
7. eslint Windows 段错误（exit 139）→ `node node_modules/eslint/bin/eslint.js` 直跑绕过
8. git push「Failed to connect」= 家宽阻断，等 150s 循环重试（后台 for 循环脚本好用）
9. Docker Desktop 偶尔空闲退出，重新启动等 engine ready 即可
10. 宝塔面板 SSH 频率防护：频繁 SSH 会断连，等 2 分钟
11. 服务器上 lovegirl-web/lovegirl-mysql/MongoDB//opt/tomat 是**用户另一个项目，不要动**
12. IAB（ZCode 内置浏览器）测试：Playwright fill/press 常不触发页面 keydown，用 evaluate 取坐标 → cua.click/type/keypress，或 DOM 合成事件；后台标签页 rAF/setTimeout 被节流（Transition 冻结、开场动画变慢都是假象）；jsdom 的 MouseEvent.pageX 恒 0；面板开合检测用 closest('.fixed') 的 computed visibility，别用 querySelector（hidden 时也能查到）
13. **SPA 导航中断类故障的诊断方法**：从首页注入 console.error/window.onerror/unhandledrejection hook，再用 Vue router.push 做 SPA 导航复现——整页 goto 会丢失错误现场
14. 路由 meta 深链进入时 watch 不触发初始值，需 onMounted 主动拉数据（档案页踩过）

## 六、代码规范（本项目特有）

- public 资源图片：script 常量 + `:src="CONST"` 绑定（理由见陷阱 1）
- Vue3 setup 漏导入不报错（组件静默不渲染）——新组件写完先本地跑一遍确认渲染
- 中文项目注意 IME 回车守卫：输入框 keydown.enter 处理器首行 `if (e?.isComposing || e?.keyCode === 229) return`
- eslint 配置：perfectionist 排序导入、unocss/order、vue/define-macros-order——新文件写完跑一次 lint --fix
- 前台 API 静默标记：轮询类请求传 `{ silent: true }`，拦截器不弹全局错误 toast
- 含中文/反引号的 commit message 用 `git commit -F 文件` 通道（bash -c 嵌套会炸）

## 七、待办（等用户手上的三件套）

1. **AI Key**：open.bigmodel.cn 免费申请（glm-4-flash）→ 服务器 `/opt/blog/deploy/start/config.docker.yml` 的 `AI:` 段填 ApiKey（或 .env 加 AI_API_KEY）→ `docker compose up -d gvb-server` → AI 助手即从规则版变真 AI（已检索 MySQL 数据）
2. **项目真实截图**：后台项目管理替换 4 张渐变占位图
3. **新域名**：到手后 → DNS A 记录 → 跑 `node scripts/gen-sitemap.mjs https://新域名` → HTTPS（web 镜像内置 ssl template + USE_HTTPS 开关）→ 搜索引擎提交
4. 监控推送激活：/opt/blog/monitor/notify.conf 填 Server酱/Bark key（模板 notify.conf.example）

## 八、协作偏好（必须遵守）

- 通俗中文；**方案先行，用户确认后才动代码**
- 多给选项，每个决策附推荐答案
- 动手前必须备份（git tag + 服务器镜像 rollback tag）
- 用户觉得丑时不要擅自改，先给方案讨论
- 密码类敏感操作用户自己做
- **用户喜欢「可交互原型」式提案**（docs/motion-gallery.html 模式）：做出来让他亲手玩，比文字描述有效十倍
- 长任务用户会授权「一次性做完+对抗性审查」：完成后开独立敌意审查 Agent 挑刺，修复后再部署

## 九、历史版本索引（细节见 git log 与 CHANGELOG.md）

- v3.39~41：品牌化、Hero 改版、SEO 基建、监控告警
- v3.42：12 项动效（主题扩散/聚光/爆裂/转场/AI 助手/年度报告/打字测速/计算器等）+ 对抗性审查修复
- v3.43：AI 真数据骨架、QQ 复制、giscus 懒加载、SPA 导航 P0 修复
- v3.44：导航扁平化、相册并入说说、联系我页、终端留言墙、流星雨、数字滚动、标签页彩蛋
- v3.45：阅读时长徽章、上次读到哪里、头像彩蛋、生日彩蛋、档案页三合一 + 深链修复
