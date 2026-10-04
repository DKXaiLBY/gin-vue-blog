# 交接提示词 v2（2026-10-03 · 复制以下全部内容发给新对话）

---

我在阿里云服务器上有一个已上线的个人博客（求职作品集网站），之前由 AI 助手从零搭建并连续迭代了十几个版本，现在上下文太长需要交接给你继续维护。

**第一件事：请先完整阅读 `D:\Projects\Personal\blog\docs\handoff.md`（交接文档 v2）**，里面有项目全貌、功能全清单、Git/回滚状态、14 条踩坑陷阱清单、代码规范和协作偏好，读完严格遵守。

**项目速览：**
- 基于开源项目 gin-vue-blog 深度二开（Vue3 前台 + Vue3 后台 + Go 后端），Docker 四容器部署在阿里云 ECS
- 线上地址：http://47.121.119.191（站点名「阵雨」，作者 DKXaiLBY）
- 管理后台：http://47.121.119.191/admin/（密码我已自行修改）
- GitHub：https://github.com/DKXaiLBY/gin-vue-blog（origin 指向 fork；upstream 才是原仓库 szluyu99，别搞混）
- 服务器：阿里云 ECS root@47.121.119.191（SSH 免密），代码在 /opt/blog，Docker 四容器运行中
- 本地代码：D:\Projects\Personal\blog（gin-blog-front 前台 / gin-blog-admin 后台 / gin-blog-server Go 后端）
- 当前版本 v3.45.1，测试 32 文件/207 用例全绿，每个稳定版有 git tag + 服务器镜像 rollback tag 可秒级回滚

**这个博客已经不是原项目的样子了**（细节看 handoff.md 第三节）：终端 Hero（可交互命令行）、星图历程页、档案页三合一、年度编程报告页、状态页、联系我页、Ask DKX AI 助手、终端留言墙、阅读体验全家桶（灯箱/继续阅读/时长徽章/懒加载）、宿主机监控、导航扁平化——上游作者基本认不出原貌，**你做新功能时请延续这套「DKX 世界观」风格，不要照搬上游设计**。

**协作规矩（必须遵守）：**
1. 通俗中文交流；方案先行，我确认后才动代码；大改动做完开「对抗性审查」（独立审查 Agent 敌意挑刺，修复后再部署）
2. 多给选项，每个决策附推荐答案；给我方案用「可交互原型」模式（像 docs/motion-gallery.html 那样做出来让我亲手玩）
3. 动代码前必须备份（git tag + 服务器镜像 rollback tag）
4. 我觉得丑的不要擅自改，先给方案讨论
5. 密码类敏感操作我自己做

**近期陷阱预警**（handoff.md 第五节有完整 14 条）：
- eslint --fix 会把模板 :src 字面量绑定转回静态 src（炸 vitest），public 资源一律 script 常量绑定
- Vue3 setup 漏导入不报错，组件静默不渲染
- Vue Transition 在后台标签页冻结是环境假象，先查组件真挂载了没
- 追加 YAML 配置段必须确认前一行有换行
- git push 失败是家宽阻断，等 150s 重试即可

**待办三件套**（都在我手上，到位后你接手）：
1. AI Key：我申请智谱免费 Key（glm-4-flash）后填入服务器 config.docker.yml 的 AI 段，Ask DKX 从规则版变真 AI（后端 /api/front/ai/chat 已就绪，检索我的 MySQL 数据）
2. 项目真实截图：我提供后替换项目页 4 张渐变占位图
3. 新域名：注册后你做 HTTPS + sitemap 重生成 + 搜索引擎提交（脚本已备好）

现在请先读交接文档，然后告诉我你理解了什么、准备怎么配合我。
