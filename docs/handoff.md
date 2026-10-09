# DKXaiLBY 个人博客 · 交接文档 v3

> 交接时间：2026-10-07（深夜）
> 上一棒：ZCode（v3.46/v3.48 两个版本上线 + v3.47 完成待部署）
> 状态基准 commit：`9adfed8`（已推送，工作区干净）
> 本文档替代 v2（docs/handoff.md 旧版内容已并入，git 历史可查）
> 接手后第一件事：通读本文 + docs/roadmap.md，然后按「交接提示词」行动

---

## 一、项目是什么

**DKXaiLBY 的个人博客**——求职作品集网站，基于开源项目 gin-vue-blog（szluyu99）深度二开，Docker 四容器部署在阿里云 ECS。已从「上游的样子」改造为「DKX 世界观」：终端 Hero、星图历程页、AI 助手（真模型）、AI 文章摘要、年度报告、状态页等。

- **线上地址**：http://47.121.119.191（IP 直访，正常服务中）
- **新域名**：lbyaidkx.top（已购、实名已过、A 记录已解析指向服务器；**ICP 备案未生效，外部访问被阿里云拦截页 403**，见 M3）
- **管理后台**：http://47.121.119.191/admin/（密码用户自改）
- **GitHub**：https://github.com/DKXaiLBY/gin-vue-blog（origin=用户 fork，upstream=szluyu99）
- **当前版本**：线上 v3.48（AI 觉醒）；本地 HEAD 含 v3.47（性能冲分，**已构建未部署**）

## 二、路径与工具速查

| 项 | 位置 |
|---|---|
| 项目根 | `D:\Projects\Personal\blog` |
| 前台 | `gin-blog-front`（Vue3+Vite+UnoCSS）；后台 `gin-blog-admin`；后端 `gin-blog-server`（Go+Gin） |
| **进度权威** | `docs/roadmap.md`（v2，里程碑/终点线/工作协议/提示词/进度日志） |
| 陷阱清单 | 本文档 §六（14+9 条，动工前必读） |
| 文章草稿 | `docs/article-drafts/`（3 篇定稿 + khazix-writer skill 副本在 references/） |
| v3.49 域名作战图 | `docs/m3-domain-prep.md` |
| M6 基线+弹药清单 | `docs/verification/2026-10-06-M6-baseline/README.md` |
| 部署产物目录 | `deploy/build/web/dist_blog`（前台）+ `dist_admin`（后台） |
| pnpm | `~/.local/bin/pnpm`（corepack） |
| Go | `%LOCALAPPDATA%/Programs/go/bin/go.exe`；swag：`~/go/bin/swag.exe` |
| Docker Desktop | `C:\Users\DKX\AppData\Local\Programs\DockerDesktop\Docker Desktop.exe`（**不在 Program Files**；空闲会自动退出，用 PowerShell `Start-Process` 拉起，引擎就绪约 40s） |
| Lighthouse | `npx lighthouse` + `CHROME_PATH` 指向 Edge（`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`）headless |
| 服务器 | root@47.121.119.191（SSH 免密），Ubuntu 24.04，2核1.6G |
| 服务器代码 | `/opt/blog`；compose：`/opt/blog/deploy/start`；密钥：同目录 `.env.secrets`（含 AI_API_*，**不进仓库**） |
| 宝塔 nginx vhost | `/www/server/panel/vhost/nginx/`（gvb-blog.conf=80 反代限流；lbyaidkx.top.conf=域名 80 段，443 段待备案后启用） |
| 服务器监控 | `/opt/blog/monitor/dkx-selfcheck`（cron 每分钟；推送分支已删，仅探活+写 Redis） |

## 三、秋招就绪计划（长期目标，七项清单制）

终点线：①HTTPS 新域名可访问 ②AI 助手真数据+摘要 ③项目截图全部真实 ④技术文章≥5 篇 ⑤Lighthouse≥90 ⑥测试全绿+lint 零错误 ⑦3 分钟演示脚本。**状态以 docs/roadmap.md 为准（当前 1/7）**。

### 里程碑状态

| # | 版本 | 内容 | 状态 |
|---|---|---|---|
| M1 | v3.46 | 动效质感版（token/骨架屏/减法/彩蛋/删推送/站名 DKXaiLBY） | ✅ 上线 |
| M2 | v3.48 | AI 觉醒（glm-4.7-flash 真模型 + prompt 收紧 + 文章 AI 摘要 + desc 保留字旧账修复） | ✅ 上线 |
| M6 | **v3.47** | 性能冲分 + a11y（五刀已全部施工，敌意审查 1P1+4P2 已修，镜像已构建） | 🟡 **代码就绪，部署被 SSH 封禁卡住**（见 §四） |
| M3 | v3.49 | 域名与门面（DNS 已就位，等 ICP 备案生效 → certbot webroot 重签 → 443 conf → sitemap → 搜索提交） | ⬜ 阻塞：等备案 |
| M4 | v3.50 | 项目截图（LoveGirl/SparkKeeper 未做好，搁置；博客/Tomato 可截） | ⬜ 搁置 |
| M5 | v3.51 | 内容管线（3 篇定稿等用户校准发布；搁置中） | ⬜ 搁置 |
| M7 | v3.52 | 演示脚本+终局打磨（建议 ⑤ 出分后启动） | ⬜ |

**版本纪律**：里程碑=新版本，授权即发布（CHANGELOG+tag vX.Y-stable+部署+验收）。v3.47 号段已被 M6 占用，下一个新版本从 v3.49 起算。

## 四、⚠️ 当前最大卡点：SSH 被宝塔长惩罚期拦截

v3.47 部署时因当日 SSH 连接过频，触发宝塔 SSH 防护**长惩罚期**：50 分钟内 6 次稀疏重试（10 分钟间隔）全部「Connection closed」。

- **镜像已构建待传**：本地 `C:\Users\DKX\AppData\Local\Temp\gvb-web-v347.tar.gz`（20MB）
- **一键部署脚本已备**：`bash scripts/deploy-v347-retry.sh`（传输+远端部署+验证全自动，稀疏重试可复用）
- **解封途径（用户做，2 分钟）**：浏览器打开宝塔面板 → 安全 → SSH 管理/防爆破 → 清空拦截记录；或宝塔自带终端执行 `iptables -nL | grep 47` 类自查
- 解封后接手 AI 只需：`bash scripts/deploy-v347-retry.sh` → 线上验收 → Lighthouse 复测 → `git tag v3.47-stable` → 回填 roadmap

## 五、立即待办（按优先级）

1. **等用户解封 SSH** → 部署 v3.47（§四）→ Lighthouse 复测移动端（目标性能 ≥90 / 可访问性 ≥90；基线 60/82，病灶与七刀计划见 docs/verification/2026-10-06-M6-baseline/）→ 达标打 v3.47-stable；**不达标如实报告**：首屏终端打字动画是 Speed Index 大头（刻意保留的标志性设计，未动），届时向用户摆「动画 vs 分数」选项
2. **催用户看 ICP 备案状态**（阿里云 App → ICP 备案 → lbyaidkx.top 那条：未提交则提交 / 管局审核中则等短信 / 显示已备案则立即开跑 v3.49）
3. **催 AI key 安全事项**：用户贴过智谱 key 原文，等站内功能稳定后建议用户去智谱后台轮换一次（免费档零成本）
4. M4/M5 维持搁置，等用户重启；重启前不要加码

## 六、⚠️ 陷阱清单（23 条，动工前必读）

### v3.45.1 前旧账（精华版，全文见 git 历史里 handoff v2）

1. eslint --fix 会把 `:src="'/xxx'"` 字面量绑定转回静态 src → vitest 全崩；public 资源一律 script 常量再 `:src="CONST"`
2. Vue Transition 在被遮挡的后台标签页冻结（rAF 节流）；IAB 里 setTimeout 被钳 1s+；**排查环境先于排查代码**
3. Vue3 setup 漏导入不报错、组件静默不渲染——用「后续兄弟组件正常渲染」反常点定位
4. 追加 YAML/配置段必须确认前一行有换行（曾有 `falseAI:` 连写炸掉 server 循环重启）
5. mysqldump 恢复：dump 自带 CREATE DATABASE+USE，灌「临时库」实际覆盖正式库；验证用 utf8mb4（latin1 乱码是假象，HEX 才作数）
6. Windows 端口排除范围吞 dev 端口（EACCES）→ 换 5500/5199 等
7. eslint Windows 段错误（exit 139）→ `node node_modules/eslint/bin/eslint.js` 直跑，整目录跑随机崩就按改动文件清单逐个跑
8. git push 失败=家宽阻断 → `bash scripts/push-retry.sh`（150s×10）
9. Docker Desktop 空闲自动退出 → PowerShell Start-Process 拉起等引擎
10. 宝塔 SSH 频率防护：高频连接触发**长惩罚期**（本次实测 1h+），解封走宝塔面板；部署连发时用稀疏重试脚本
11. 服务器上 lovegirl-web/lovegirl-mysql/MongoDB//opt/tomat 是用户另一个项目，不要动
12. IAB（内置浏览器）测试：Playwright fill/press 常不触发页面 keydown，用 evaluate→cua；后台标签页动画冻结是假象；**clip 截图坐标系是文档级**，验证用整页截图
13. SPA 导航中断类故障：首页注入 console.error/window.onerror/unhandledrejection hook，再用 router.push 复现——整页 goto 会丢现场
14. 路由 meta 深链进入时 watch 不触发初始值，需 onMounted 主动拉数据

### 2026-10-05~07 新增（本会话实战产出）

15. **本站是 history 路由**：文章 URL 是 `/article/:id` **没有 # 前缀**；用 `#/article/4` 会停在首页且 SPA 不响应 hash 变化（曾因此空转排查数轮）
16. **MySQL `desc` 是保留字**：GORM 手写 Select/Where 列名必须反引号，否则 SQL 1064 被 `if err == nil` 吞掉静默失败（aiRetrieve 曾因此从未生效）
17. **推理模型（glm-4.7-flash）思维链计入 max_tokens**：500 会被思考吃光返回空 content；现值 1200 且空摘要不写缓存；模型切换改服务器 `.env.secrets` 的 AI_MODEL 即可
18. **bash heredoc 转义会丢层**：含 `\n` 字面量的 JS/Go 字符串修改必须用 Edit 工具，python-heredoc 写入会把 `\\n` 打成真换行
19. **Lighthouse 无需装 Chrome**：`CHROME_PATH=Edge` + `npx lighthouse` headless 可跑；shell 直连站点 IP 是通的（curl 200）
20. **本机 curl 对域名解析失败但对 IP 可通**（含 dangerouslyDisableSandbox）；要测域名用 PowerShell Resolve-DnsName 或 IAB 浏览器
21. **用户贴的长 hex.secret 格式字符串 = 智谱 API key**（不是 DNS 凭证），先问清用途再定性
22. **版本 tag 必须在部署完成后立即打**（v3.48-stable 曾忘打，次日补在 13063b3）；文档回填与 tag 同一提交
23. 部署重试模式：SSH 被封时用 `scripts/deploy-v347-retry.sh` 模板（稀疏 10min×6，传输+远端部署一体），禁止高频硬试延长惩罚

## 七、协作偏好（用户特性，必须遵守）

- 通俗中文；**方案先行**，动代码前用户确认；**多选项+每个决策附推荐答案**
- 用户觉得丑/花里胡哨立即停（v3.45 视觉终态；动效只做调音与反馈）
- **可交互原型式提案**最有效（docs/motion-tune-gallery.html 模式：做出来让他亲手玩）
- 长任务用户会给「一次性做完+对抗性审查」授权：完成后开独立敌意 Agent 挑刺，修复后再部署
- 密码类敏感操作与后台设置用户自己做；AI key 类凭证只进服务器 .env.secrets，仓库零字面量
- 文章一律 khazix-writer 文风（skill 副本 docs/article-drafts/references/，写前重读跑四层自检）；用户贴的长 hex.secret 字符串大概率是智谱 key
- 用户会临时插话更正方向，mid-turn 消息优先级最高；他说「先讨论」就绝不动代码

## 八、交接提示词（新会话直接粘贴）

```
【DKX 博客 · 秋招就绪计划 · 交接提示词 v4】

你是 DKXaiLBY 博客项目（D:\Projects\Personal\blog）的长期执行者，刚从上一棒 AI 接手。总目标与进度已全部文档化，先读文档再动手：

◆ 阅读顺序（5 分钟）
1. docs/roadmap.md —— 终点线七项、里程碑状态、版本发布纪律、进度日志（唯一进度权威）
2. docs/handoff.md §四~§六 —— 当前最大卡点、立即待办、23 条陷阱清单
3. 本提示词剩余部分

◆ 总目标
把博客（gin-vue-blog 深度二开，线上 http://47.121.119.191，站名 DKXaiLBY，与 GitHub 和新域名 lbyaidkx.top 三统一）打造成面试里能讲 30 分钟、每个细节经得起追问的求职作品集。灵魂原则：好看过剩、有用欠账——一切以「有用」优先，拒绝装饰性花活。

◆ 当前进度锚点（2026-10-07 交接时）
- 线上运行 v3.48：AI 助手真模型（glm-4.7-flash）+ 文章 AI 摘要已上线；IP 访问正常
- lbyaidkx.top 已解析指向服务器，但 ICP 备案未生效，域名访问被阿里云拦截 403（等用户备案完成）
- **v3.47 性能冲分代码完成、镜像已构建、部署被宝塔 SSH 防护长惩罚期卡住**——第一优先任务是等用户解封 SSH 后执行 `bash scripts/deploy-v347-retry.sh` 完成部署，再跑 Lighthouse 复测（基线移动端性能 60/可访问性 82，目标双 90；病灶与计划见 docs/verification/2026-10-06-M6-baseline/）
- 终点线 1/7：⑥达标；②已上线待稳定；①③④⑦待推进

◆ 节奏与授权
每个里程碑 = 一次 2~5 小时冲刺，一次授权内一口气做完（备份→施工→自验→敌意审查 Agent→修复→部署→线上验收→打 tag→回填 roadmap）。里程碑间需向用户申请授权；用户已交付的依赖（AI key ✓）对应里程碑直接推进。

◆ 铁律
动代码前 git tag + 服务器镜像 rollback 双备份；动效只做调音与反馈不加花活；文章按 khazix-writer 文风（副本在 docs/article-drafts/references/）；密码与后台操作用户自己做；push 失败用 scripts/push-retry.sh；服务器上 lovegirl 系容器和 /opt/tomat 是用户另一个项目不要动；lbyaidkx.top 备案生效前不做任何域名实验；23 条陷阱见 docs/handoff.md §六。
```
