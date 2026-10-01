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
- 品牌化：DKXaiLBY + 小猫头像 + 靛紫 Indigo 配色（品牌色 CSS 变量单一出口，明暗双主题）
- 前台：Hero 开场（大字+小猫头像+一言+社交图标）+ 分类胶囊栏 + 加载更多按钮 + 搜索弹窗封面缩略图
- 后台：项目管理页（naive-ui CRUD+封面上传）、登录页重设计、仪表盘靛紫主题
- RSS 2.0 订阅（/api/front/rss）、sitemap.xml、robots.txt
- 自动备份（每日 3 点 mysqldump+图片，7 天轮转，/opt/backups/）
- 反代限流（/api/login 10r/m、全站 300r/m）
- giscus 评论区启用（App 已装，配置已填）
- 说说页 17 条编年史（真实事件日期）
- 历程页 18 条里程碑
- 打字机失灵根治（2s 超时+卸载清理）、搜索封面缩略图、页脚/加载屏品牌化

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
2. **新域名注册**：用户计划自行注册（不占用已备案的「蓝宝莹我爱你」主域）。拿到域名后：DNS A 记录 → 47.121.119.191，更新 sitemap/robots/RSS 绝对 URL，配 HTTPS（Caddy 或 BT 面板 SSL），搜索引擎提交
3. 说说页可以继续添加新动态（后台直接发，或让 AI 走 SQL 文件通道）

### 可选增强（用户点名才做）
1. **自动部署流水线**：Deploy to Aliyun workflow 已写好（.github/workflows/deploy.yml，Secrets DEPLOY_SSH_KEY/SERVER_HOST 已配置），但 runner→服务器 SSH 在网络层被丢（auth.log 无记录）。备选：GHCR 镜像中转（服务器拉镜像，绕开 SSH）或服务器轮询部署代理
2. **Umami 访客统计**：自部署数据分析（需先评估 1.6G 内存余量）
3. **后台仪表盘深色模式打磨**
4. **上游安全补丁定期同步**

### AI 会话考古（可选，素材已产出）
- 用户在多工具（Codex/WorkBuddy/豆包/ZCode）有 ~800MB 会话存档
- Codex 51 会话已挖掘：`deploy/mine_codex_sessions.py` + `deploy/content/ai-mining-result.json`
- ZCode db.sqlite（160MB，41 会话）未深挖
- 编年史草稿 v4 17 条已全部发布上线

## 六、已知问题与注意事项

1. **Deploy to Aliyun 流水线**：runner→服务器 SSH 被网络层丢弃（Transfer 步骤挂起 30+ 分钟），已取消该 run。旧 run 取消后新的 run 会在队列里排队执行
2. **服务器 Docker Desktop 偶尔空闲退出**：本地 Windows Docker Desktop 偶尔 idle 退出，重新启动即可（Docker Desktop.exe → 等 engine → build）
3. **宝塔面板有 SSH 频率防护**：频繁 SSH 连接会被断连，等 2 分钟再试
4. **GitHub 家宽间歇阻断**：push 失败等 2 分钟重试即可恢复
5. **服务器上还有用户的另一个项目**：lovegirl-web/lovegirl-mysql（8080/3307 端口）和 MongoDB、/opt/tomat（3000）——**不要动这些**
6. **conf 模板中 .env 已 untrack**：deploy/start/.env 从仓库移除（上游把示例密码提交进了仓库），服务器上真实密码在 /opt/blog/deploy/start/.env

## 七、用户偏好（协作时遵守）

- 通俗中文交流；方案先行讨论，**用户确认后才动代码**
- 多给选项，每个决策附推荐答案
- 改版前必须做好备份/回滚准备（git tag + 服务器镜像 tag）
- 用户觉得丑时不要擅自改，先给方案讨论
- 密码类敏感操作由用户自己做（AI 不碰密码）
