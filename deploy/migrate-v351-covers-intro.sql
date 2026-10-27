-- v3.51: 品牌化 SVG 封面 + 详情弹窗富文案 (intro ≤500)
USE gvb;
UPDATE project SET cover = '/covers/lovegirl.svg', intro = '和女朋友一起造的情侣互动 App：数字衣橱、纪念日提醒、旅行足迹地图、翻页相册与通知中心，配套 Node/Express + MySQL 接口服务。从 v1 到 170+ 次构建持续迭代中，正式版打磨完成后开放下载。' WHERE id = 1;
UPDATE project SET cover = '/covers/blog.svg', intro = '你正在看的这个网站：基于开源项目 gin-vue-blog 深度二开——修复上游 MD5 弱哈希隐患、自研项目管理模块（Go 模型 + API + 后台 + 前台四层）、终端风可交互 Hero、AI 助手与文章 AI 摘要（智谱 GLM）、207 条前端测试全绿，Docker 四容器部署在阿里云 ECS，含自动备份与一键回滚。' WHERE id = 2;
UPDATE project SET cover = '/covers/sparkkeeper.svg', intro = '本地优先、合规可控的抖音火花自动续火 Web 应用：Playwright 驱动自动给好友发私信维持火花，带实时任务看板、可配置的定时策略与本地数据存储，一切跑在你自己的电脑上，不经过任何第三方服务器。' WHERE id = 3;
UPDATE project SET cover = '/covers/tomato.svg', intro = '安卓沉浸式番茄钟：专注舱全屏白噪音（雨声/篝火/咖啡馆）、场景化任务、专注数据统计与连续打卡，配合自建分发官网直接下载安装。v1.0 正式版「沉浸专注舱」已上线。' WHERE id = 4;
SELECT id, cover, CHAR_LENGTH(intro) FROM project ORDER BY sort;
