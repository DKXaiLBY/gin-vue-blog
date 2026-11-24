# v3.49 · 域名与门面 · 施工图纸 v2（香港新机，免备案）

> **2026-11-24 方案变更**：博客迁往**香港**新服务器。境外服务器不需要 ICP 备案，域名解析切过去后即可签发 HTTPS 证书。
> 原路径（内地 ECS + ICP 备案）作废：备案自 10-06 起始终未通过，且现有服务器（47.121.119.191）即将到期。
> 新机地址未定（用户购买中）。**新机到位前，旧机保持现状不动**（铁律 #8 仍然有效）。

## 第一段 · 用户侧（买机器时注意）

1. 地域选**香港**；系统 **Ubuntu 24.04**；系统盘 **≥60G**；内存 **≥2G**
2. 防火墙/安全组只放行 **22 / 80 / 443**（数据库端口不要对公网开）
3. 把本机 SSH 公钥绑定到新机（公钥在本机 `~/.ssh/id_rsa.pub`），或买完后在控制台执行一条命令加入
4. 把新机公网 IP 发我；**先不要改域名解析**（等我通知切换）
5. 旧机在切换完成并稳定一周前不要释放（回滚兜底）

## 第二段 · 我接手（新机到位后一次冲刺 v3.49）

### A. 备份与传输（旧机 → 新机）

1. 旧机执行 `/opt/blog/backup.sh` 做全量备份；打包 `/opt/blog`（**必须带上 `deploy/start/.env.secrets`**，AI 密钥只在服务器上有）
2. 导出博客四个容器**实际正在使用的镜像**（按容器的镜像 ID 导出，不要按 tag——`start-gvb-web:latest` 的归属与 v3.51 对不上，tag 不可信）
3. 传输到新机 `/opt/blog`

### B. 新机初始化

4. 安装 Docker + compose，导入镜像，`docker compose up -d`
5. 恢复数据库（mysqldump 恢复要剥掉头部的 CREATE DATABASE/USE 并显式指定 utf8mb4，见 docs/handoff.md 陷阱清单）与上传文件
6. 验证 `127.0.0.1:8081` 首页是 v3.51 产物（入口 `index-D9QrvFT-.js`）；AI 问答 `use_rules=false`（**香港出口访问智谱 API 是否可达未知，必须第一时间实测**）

### C. 接入层

7. 系统 nginx（systemd 管理、开机自启）：80/443 → `127.0.0.1:8081`，保留 limit_req 与安全头；**不装宝塔**
8. 通知用户改域名解析：A 记录 `@` / `www` → 新 IP
9. 证书：Let's Encrypt（certbot --nginx 或 acme.sh），HTTP → HTTPS 301，自动续期

### D. 域名收尾

10. 去掉 IP 硬编码（仓库内 7 文件 19 处）：`public/robots.txt`、`public/sitemap.xml`×9、`scripts/gen-sitemap.mjs` 默认值×2、`link/components/AddLink.vue` 示例、`deploy/tomato-download.html`×2、`deploy/content/project-blog.json` 与 `project-tomato.json`（线上数据库 project.url 同步改）
11. `.env` 设 `USE_HTTPS=true`；重跑 `node gin-blog-front/scripts/gen-sitemap.mjs https://lbyaidkx.top`
12. OG 分享图 1200×630 + `index.html` OG 标签
13. 搜索引擎提交：Google Search Console / Bing Webmaster / 百度站长

### E. 定时任务

14. 每日 3:00 备份、每分钟自检（cron）；备份定期拉到本机（`D:\Projects\Personal\blog-server-backups\`，仓库外）

### F. 验收与发布

15. HTTPS 访问 / www 跳转 / HTTP 301 / sitemap 可拉 / 分享卡片 → 打 tag v3.49-stable → 回填 roadmap

## 风险与注意

- **智谱 API（open.bigmodel.cn）从香港出口的可达性未知**——迁移后第一件事验证；不通则 AI 退回规则版，需另想办法
- 香港到内地延迟略高（几十毫秒），Lighthouse 性能分可能略降
- **切换顺序**：新机全通 → 改解析 → 旧机保留兜底。回滚 = 把解析改回旧 IP
- **数据库最终同步**：改解析前在旧机停写导出一次，避免丢最后几分钟的留言/说说
- **旧机上有其他操作者**（LoveGirl 项目活跃、11-24 00:19 有人重启过博客容器）——动旧机前确认没人在用
- LoveGirl 与番茄官网是用户的另外两个项目，默认不迁不动，等用户明确指令
