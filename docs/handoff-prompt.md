# 交接提示词（复制以下全部内容给新对话即可）

---

我在阿里云服务器上有一个已经上线的个人博客，是你（或另一个 AI 对话）之前帮我从零搭建并部署的。现在我需要你接手后续的维护和迭代。

**项目基本信息：**
- 完整交接文档在我的电脑上：`D:\Projects\Personal\blog\docs\handoff.md`——请先读这份文档了解全部上下文
- 设计文档：`D:\Projects\Personal\blog\docs\specs\2026-09-28-blog-design.md`
- UI 调研报告：`D:\Projects\Personal\blog\docs\design-research.md`
- 线上地址：http://47.121.119.191
- 管理后台：http://47.121.119.191/admin/（密码我已自行修改，不是默认的 admin/123456）
- GitHub 仓库：https://github.com/DKXaiLBY/gin-vue-blog（fork 自 szluyu99，本地与远端完全同步）
- 服务器：阿里云 ECS root@47.121.119.191（SSH 免密已配），代码在 /opt/blog，Docker Compose 四容器运行中
- 本地代码：D:\Projects\Personal\blog（gin-blog-front = Vue3 前台，gin-blog-admin = Vue3 后台，gin-blog-server = Go 后端）

**技术要点（踩坑记录都在 handoff.md 里）：**
- 品牌色走 CSS 变量单一出口（gin-blog-front/src/styles/index.css 的 --c-primary/--c-accent）
- 服务器部署方式：本地构建 Docker 镜像 → save|gzip|ssh load → docker compose up（不用在服务器上构建）
- 服务器 SSH 偶尔频率防护断连，等 2 分钟重试
- GitHub 家宽间歇阻断，push 失败等 2 分钟重试即可
- 宝塔面板 nginx 反代配置在 /www/server/panel/vhost/nginx/gvb-blog.conf
- Mimosa 安全钩子会拦截含 PASSWORD 字样的脚本和 Bash 内联中文——写 SQL/运维脚本走「本地文件+scp+docker exec mysql < file」通道

**我已经完成的工作：**
品牌化全站（DKXaiLBY + 小猫头像 + 靛紫配色）、Hero 开场页、项目管理模块（自研全栈）、简历页、历程编年史页（18 条）、说说页（17 条）、RSS、打赏弹窗、giscus 评论、GitHub 热力图、搜索封面缩略图、自动备份、反代限流、CI 流水线、打字机 bug 修复、MD5 安全修复

**我接下来想做的事（按优先级）：**
1. （请帮我做）把线上博客的视觉再打磨一轮，参考 docs/design-gallery.html 里的三个创新概念
2. （需要我提供素材）LoveGirl/番茄专注的真实截图替换项目占位图
3. （等域名）注册新域名后配 HTTPS + 搜索引擎提交

请你先读 handoff.md 确认理解了上下文，然后告诉我你建议下一步做什么。
