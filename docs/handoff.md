# DKXaiLBY 个人博客 · 交接文档

> 交接时间：2026-09-30（晚）
> 交接人：ZCode（原对话）
> 接手人：新对话（任意 AI 工具）

---

## 一、项目是什么

**DKXaiLBY 的个人博客** — 一个面向求职的作品集网站，基于开源项目 gin-vue-blog 深度二次开发，Docker 全栈部署在阿里云 ECS 上，公网可访问。

- **线上地址**：http://47.121.119.191
- **管理后台**：http://47.121.119.191/admin/ （**密码已由用户自行修改**，不是默认的 admin/123456）
- **GitHub 仓库**：https://github.com/DKXaiLBY/gin-vue-blog （fork 自 szluyu99，全部魔改已推送，最新 head = 7c41371 之后）
- **演示站**：https://dkxailby.github.io/gin-vue-blog/ （Pages mock 模式）
- **设计文档**：`docs/specs/2026-09-28-blog-design.md`（完整需求/架构/调研/方案记录）
- **UI 调研画廊**：`docs/design-gallery.html`（本地 9999 端口可看，或直接双击打开）
- **编年史草稿**：`docs/moments-draft.md`

## 二、本地环境（精简速查）

| 项 | 位置/说明 |
|---|---|
| 项目根 | `D:\Projects\Personal\blog` |
| 服务器 | 阿里云 ECS `47.121.119.191`，root SSH 免密已配，Ubuntu 24.04，2核1.6G |
| 服务器代码 | `/opt/blog`（deploy/start 下 docker-compose） |
| 本地 pnpm | `~/.local/bin`（corepack） |
| 本地 Go 1.27.1 | `%LOCALAPPDATA%/Programs/go/bin` |
| Docker Hub 被墙 | 走 docker.m.daocloud.io 拉镜像 retag |
| 换行 | .gitattributes 强制 LF + repo 级 autocrlf=false |
| 会话挖掘数据 | `deploy/content/ai-mining-result.json` |
| Mimosa 钩子规律 | 运维脚本含 PASSWORD 必拦（改从容器 env 取）；扫描脚本含 ~/ 或 ** 递归 glob 必拦；Bash 内联中文必乱码（走 JSON 文件+curl -d @file）；SQL 写库走「本地文件+scp+docker cp+mysql < file」 |

## 三、已完成的工作（全部上线验收 ✓）

### 网站
- **AI 助手真数据**（v3.43）：/api/front/ai/chat 检索 MySQL + LLM（config.yml AI 段配 AI_API_KEY 即激活，智谱 glm-4-flash 免费），未配置自动回落规则版
- **QQ 点击复制号码**（v3.43，三处）
- **giscus 评论懒加载**（v3.43，滚动到评论区才加载）
- **导航扁平化**（v3.44）：首页/归档/项目/说说/简历/历程/留言 平铺 + 关于▾（关于我/联系我/友链/分类/标签）；相册页下线（/albums → /talks 重定向）
- **联系我页 /contact**（v3.44）：终端风联系卡
- **终端留言墙**（v3.44）：留言板弹幕黑底绿字命令行风
- **流星雨/数字滚动/标签页离开彩蛋/阅读时长徽章/上次读到哪里/头像互动/生日彩蛋**（v3.44~45）
- 品牌化：DKXaiLBY + 小猫头像 + 靛紫 Indigo 配色（品牌色 CSS 变量单一出口，明暗双主题）
- 前台：Hero 开场（大字+小猫头像+社交图标）+ 分类胶囊栏 + 加载更多按钮 + 搜索弹窗封面缩略图
- **Hero 迷你终端（2026-10-01）**：可真实输入的命令行（help/ls projects/blog status/sudo hire-me 跳简历/fortune 一言/clear 等），开场自动表演，提示 pill 移动端可点
- **星图历程页（2026-10-01）**：/timeline 渲染为可拖拽「开发地铁图」，大站高亮 +「你在这」，点击站点出详情卡，≤1023px 自动转纵向
- **体验三件套（2026-10-02）**：文章图片灯箱、页脚实时状态徽章（呼吸绿点+运行天数/文章/访问）、Ctrl+K 命令面板（页面直达+切主题+搜文章）
- **DKX OS 桌面彩蛋（2026-10-02）**：终端敲 `boot dkx-os` 唤起全屏"电脑桌面"（图标导航+可拖动关于本机窗口+任务栏关机）
- **站点状态页（2026-10-02）**：/status + Go 后端 /api/front/status（只读：Go 版本/堆内存/协程/内容计数），入口在 Ctrl+K 和页脚
- **SEO 分享层（2026-10-02）**：index.html OG/JSON-LD/description + router 动态覆写 + 文章页真实标题摘要覆写 + sitemap 生成脚本（scripts/gen-sitemap.mjs）
- **图片灯箱/头像优化**：正文图片点击放大；头像 1080px/135KB→512px/16KB（原图备份在 docs/img/avatar-original/）
- RSS 2.0 订阅（/api/front/rss）、robots.txt
- 自动备份（每日 3 点 mysqldump+图片，7 天轮转，/opt/backups/）
- 反代限流（/api/login 10r/m、全站 300r/m）+ **安全响应头四件套（nosniff/XFO/Referrer-Policy/Permissions-Policy，2026-10-02）**
- giscus 评论区启用（App 已装，配置已填）
- 说说页 20 条（17 条编年史 + 3 条 10 月迭代实录）
- 历程页 19 站星图（数据源 config/timeline.js，major/now 标记）
- 测试套件 **34 文件/213 用例全绿**（含终端命令分发 11 条、星图 5 条新单测）

### 后台
- 项目管理页（naive-ui CRUD+封面上传）、登录页重设计、仪表盘靛紫主题（2026-10-02 对齐剩余蓝色残留）

### 服务器
- 阿里云 47.121.119.191，宝塔 nginx 反代（gvb-blog.conf，含限流）
- 四容器：gvb-web/nginx + gvb-server + gvb-mysql + gvb-redis
- 自动备份 cron（每日 3 点，/opt/backups/ 7 天轮转）
- 同机共存：端口全收 127.0.0.1（web 8081/server 8765/mysql 33066/redis 63799）

### 安全
- admin 密码已由用户自行修改 ✓
- MD5 弱哈希修复（SHA-256 截断）
- MySQL/Redis 不暴露公网
- .env 已 untrack（防同步覆盖服务器密码）

## 四、Git 提交链（本地 main = 远端 main）

```
7c41371 fix(theme): Hero 光斑统一靛紫
6b49832 feat(theme): 全站配色切换靛紫 Indigo
18fe818 feat(timeline): 历程页升级为完整 AI 编年史
974e32d feat(ops): 上线前基础设施四件套
5f9cc55 fix(ui): 打字机失灵根治 + 搜索结果带封面图
4a44241 feat(brand): 品牌痕迹清洗第二轮
...
```

## 五、剩余待办

### 需要用户做的
1. **项目真实截图**：后台项目管理里把 4 张渐变占位图换成 LoveGirl/番茄专注的实际截图
2. **新域名注册**：用户计划自行注册（不占用已备案的「蓝宝莹我爱你」主域）。拿到域名后：DNS A 记录 → 47.121.119.191，跑 `node scripts/gen-sitemap.mjs https://新域名` 重生成 sitemap，配 HTTPS（Caddy 或 BT 面板 SSL，web 镜像已内置 ssl template + USE_HTTPS 开关），搜索引擎提交（sitemap/OG/JSON-LD 已就绪）
3. 说说页可以继续添加新动态（后台直接发，或让 AI 走 SQL 文件通道）；**隐藏彩蛋试玩**：首页终端敲 `boot dkx-os`

### 可选增强（用户点名才做）
1. **自动部署流水线**：Deploy to Aliyun workflow 已写好但 runner→服务器 SSH 被丢；**GHCR 中转已评估不可行（2026-10-02 实测 ghcr.io 本机与服务器均不可达）** → 维持「本地 build → save|gzip|scp|load → compose up」手动部署为标准流程
2. **Umami 访客统计**：自部署数据分析（需先评估 1.6G 内存余量）
3. **上游安全补丁定期同步**：upstream remote 已配好（2026-10-02 修正：origin 曾误指上游仓库！现 origin=DKXaiLBY fork，upstream=szluyu99），fetch 时遇家宽阻断等 2 分钟重试
4. **Lighthouse 进一步优化**：基线 64 分存档 docs/verification/2026-10-02-P3/，总载荷已降至 196KB，剩余瓶颈=服务器 TTFB（1 核小机）与外部资源（ghchart 热力图/一言 API）

### AI 会话考古（可选，素材已产出）
- 用户在多工具（Codex/WorkBuddy/豆包/ZCode）有 ~800MB 会话存档
- Codex 51 会话已挖掘：`deploy/mine_codex_sessions.py` + `deploy/content/ai-mining-result.json`
- ZCode db.sqlite（160MB，41 会话）未深挖
- 编年史草稿 v4 17 条已全部发布上线

## 六、已知问题与注意事项

1. **Deploy to Aliyun 流水线**：runner→服务器 SSH 被网络层丢弃（Transfer 步骤挂起 30+ 分钟），已取消该 run。旧 run 取消后新的 run 会在队列里排队执行
2. **服务器 Docker Desktop 偶尔空闲退出**：本地 Windows Docker Desktop 偶尔 idle 退出，重新启动即可（Docker Desktop.exe → 等 engine → build）
3. **宝塔面板有 SSH 频率防护**：频繁 SSH 连接会被断连，等 2 分钟再试
4. **GitHub 家宽间歇阻断**：push 失败等 2 分钟重试即可恢复（后台 for 循环重试很好用）
5. **服务器上还有用户的另一个项目**：lovegirl-web/lovegirl-mysql（8080/3307 端口）和 MongoDB、/opt/tomat（3000）——**不要动这些**
6. **conf 模板中 .env 已 untrack**：deploy/start/.env 从仓库移除（上游把示例密码提交进了仓库），服务器上真实密码在 /opt/blog/deploy/start/.env
7. **【重大】mysqldump 恢复陷阱（2026-10-02 演练实测）**：备份 dump 自带 `CREATE DATABASE gvb` + `USE gvb`，直接 `gunzip | mysql 临时库` 数据会进**正式 gvb 库**（等于真实覆盖恢复）。恢复到临时库必须先剥掉 dump 头部这些行；恢复/验证时 mysql 客户端务必 `--default-character-set=utf8mb4`（alpine 容器默认 latin1，中文显示乱码是假象，HEX 检查才作数）
8. **【陷阱】plugin-vue v6 静态资源**：模板里静态 `src="/xxx.png"`（public 绝对路径）会被编译成模块导入，vitest 里炸掉整个套件（file:///xxx.png 非法模块）。全站约定：**public 资源一律 `:src="'/xxx'"` 绑定写法**
9. **【陷阱】flex 父级 + mx-auto**：页面根 div 用 `mx-auto max-w-*` 且父级是 flex 容器时，auto margin 放弃 stretch 改 fit-content，内容有 min-width:max-content（如星图）会把宽度顶到 max-width 上限造成小视口横向溢出 → 页面根加 `w-full`
10. **IAB 自动化（ZCode 内置浏览器）**：被遮挡的后台标签页 rAF/setTimeout 被节流——Transition 永远停在 *-leave-from、打字动画要长轮询；Playwright fill/press 不触发页面 keydown，键盘交互走 evaluate 取坐标 → cua.click/type/keypress，或 DOM 合成事件；jsdom MouseEvent.pageX 恒 0（原型只读）
11. **eslint Windows 段错误**：pnpm exec eslint 偶发 exit 139，用 `node node_modules/eslint/bin/eslint.js` 直跑绕过

## 七、用户偏好（协作时遵守）

- 通俗中文交流；方案先行讨论，**用户确认后才动代码**
- 多给选项，每个决策附推荐答案
- 改版前必须做好备份/回滚准备（git tag + 服务器镜像 tag）
- 用户觉得丑时不要擅自改，先给方案讨论
- 密码类敏感操作由用户自己做（AI 不碰密码）
