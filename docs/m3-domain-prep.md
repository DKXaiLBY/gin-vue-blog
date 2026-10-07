# v3.49 · 域名与门面 · 预备作战清单（备案通过后执行）

> 域名已定稿：**lbyaidkx.top**（用户已购，实名/备案审核中，2026-10-06）
> 本文是 M3/v3.49 冲刺的施工图纸，**备案通过前不做任何线上域名操作**（铁律 #8）
> 用户随消息贴出的疑似 DNS API 凭证已提醒重置，本流程全程手动控制台操作，不使用 API

## 第一段 · 用户侧（现在就可以做的）

1. **等实名认证通过**（.top 注册后必须实名才能解析，用户说约两天）
2. **提交 ICP 备案**：阿里云 App → ICP 备案 → 新增网站
   - 主体：用户本人（和 ECS 同一账号）
   - 网站域名：lbyaidkx.top
   - 服务器：选现有 ECS（产品核验码在 ECS 控制台「备案】授权」处生成）
   - 网站内容选「博客/个人空间」，备注如实写个人技术博客
   - 周期：初审 1~2 天 + 管局审核 1~13 个工作日（短信通知结果）
3. **备案通过前**：站点保持 http://47.121.119.191 不动，不加解析、不开 HTTPS
4. （可选）注销旧域名的动作不急，等新域名 HTTPS 稳定跑一周后再办

## 第二段 · 我接手（备案通过后，一次冲刺 v3.49）

按序执行，每步验证：

1. **DNS 解析**（阿里云控制台，用户或我远程指挥手动加）
   - `A 记录：@ → 47.121.119.191`
   - `A 记录：www → 47.121.119.191`
   - TTL 默认 10 分钟
2. **验证解析生效**：`ping lbyaidkx.top` 与 `dig` 双地确认
3. **TLS 证书**：用 Let's Encrypt / 免费证书（宝塔或 acme.sh 在宿主机签），证书文件落位 `/opt/blog/deploy/start/server.crt|key`（compose 已挂载）
4. **开启 HTTPS**：`/opt/blog/deploy/start` 的 `.env` 设 `USE_HTTPS=true`、`SERVER_NAME=lbyaidkx.top` → `docker compose up -d gvb-web` → 验证 https://lbyaidkx.top 与 www 跳转
5. **HTTP→HTTPS 跳转**：nginx conf 已带 ssl template 分支，确认 301
6. **全站资源检查**：文章图片/头像/封面都是相对或同域路径，无 http://47.121.119.191 硬编码（grep 验证）
7. **sitemap 重生成**：`node gin-blog-front/scripts/gen-sitemap.mjs https://lbyaidkx.top` → 提交进 web 镜像 → 重新部署
8. **搜索引擎提交**：Google Search Console（HTTPS 前缀资源）、Bing Webmaster、百度站长（备案域名才能收）逐个提交 sitemap
9. **OG 分享图**：制作 1200×630 品牌分享图（DKXaiLBY 终端风），落 `public/og-image.png`，index.html OG 标签更新 → 部署
10. **验收**：HTTPS 访问 / www 跳转 / sitemap 可拉 / 分享卡片预览（微信/QQ 调试）→ 打 tag v3.49-stable → 回填 roadmap

## 风险与注意

- **.top 无 HSTS 预载**，HTTP 阶段可访问，无 .dev/.app 的强制 HTTPS 坑，选型安全 ✓
- 证书续期：acme.sh 自动续（80 端口验证需在续期时临时放行或用 DNS 验证）
- 备案号必须挂网站页脚（AppFooter 加一行「X ICP 备 XXXXXXXX 号」）——备案通过后拿到号我来加
- 切换当天可能在搜索引擎侧出现短暂双源（IP + 域名），sitemap 提交后 1~2 周收敛
