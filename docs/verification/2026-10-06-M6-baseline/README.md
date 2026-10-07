# M6 基线 · Lighthouse 移动端（2026-10-06）

对象：http://47.121.119.191/（v3.46-stable 线上版），Lighthouse CLI + Edge headless，默认移动端模拟
原始报告：lighthouse-mobile.report.html / .json（本目录）

## 基线分数

| 类别 | 分数 |
| --- | --- |
| Performance | **60** |
| Accessibility | **82** |
| Best Practices | 78 |
| SEO | 92 |

## 指标

| 指标 | 值 |
| --- | --- |
| FCP | 2.7s |
| LCP | **4.7s** |
| Speed Index | **9.3s** |
| TBT | 430ms |
| CLS | 0.026（好） |

## 病灶清单（按预期收益排序）

1. **外部热力图拖垮 Speed Index**：右栏 GitHub 活跃图请求 ghchart.rshah.org（境外，国内服务器访客路径慢），疑似 Speed Index 9.3s 的主因 → 懒加载/自托管
2. **渲染阻塞**：index CSS 25KB（757ms）+ `/js/mathjax.js`（451ms，上游遗留脚本，站内 Markdown 渲染并不依赖它）→ 移除或 defer
3. **TBT 430ms + Style&Layout 1247ms**：非关键 JS 延后（AskDKX 悬浮球按需挂载等）
4. **unsized-images**：封面图/头像补 width/height（或 aspect-ratio）
5. **unused CSS 16KB**：UnoCSS 构建产物，purge 风险大，暂不动
6. **可访问性（82 → 90）**：3 个无名字按钮 + 1 个无名字链接补 aria-label；2 处颜色对比度不足（终端窗标题灰字、分类胶囊 muted）；1 处 h3 跳级；首页缺 main 地标

## 与终点线的关系

⑤ 要求 Performance ≥90 且 Accessibility ≥90。HTTPS/redirects 两项属于 Best Practices/SEO（不在 ⑤ 门内），仍由 M3 域名解锁。

## M6 弹药清单（侦察到行号，2026-10-06 补）

| # | 修法 | 位置 | 细节 |
| --- | --- | --- | --- |
| 1 | mathjax 配置脚本加 `defer` | gin-blog-front/index.html:43 | 它只是配置片段（真正的 MathJax 由 utils/mathjax.js 按需加载），同步阻塞渲染 451ms；defer 后仍在 DOMContentLoaded 前执行，晚于它的动态加载不受影响 |
| 2 | 热力图提速二段走 | src/components/GitHubHeatmap.vue:31 | 已有 loading=lazy 但仍拖视觉完成度；先做其余四刀后复测，SI 仍 >6s 则把 ghchart 外链换成服务器端缓存的本地图片 |
| 3 | 标题跳级 | GitHubHeatmap.vue:24 | `<h3>`GitHub 活跃`</h3>` 改 h2（样式不变） |
| 4 | 无名字按钮/链接 | TalkingCarousel.vue（chat 图标 button、/talks 箭头 link）、SideTools 两个图标按钮 | 补 aria-label |
| 5 | 对比度 | ArticleCard 卡片 .term-title 灰字、首页分类胶囊 text-muted | 提亮一档 |
| 6 | main 地标 | home/index.vue 模板根 div 换 main | 消 landmark-one-main |
| 7 | 图片尺寸 | ArticleCard 封面 img、HomeBanner 头像 img | 补 width/height 或 aspect-ratio |

## M4 前置侦察：项目线上地址盘点（供用户做兜底确认）

| 项目 | 线上地址 | 建议 |
| --- | --- | --- |
| LoveGirl | 无（repo 有） | 用户本机/模拟器截图，或博客截图兜底 |
| 个人博客 | http://47.121.119.191 ✓ | M6 性能优化后截图最佳 |
| SparkKeeper | 无、无 repo | 博客截图兜底或用户本机截图 |
| Tomato | http://47.121.119.191:3000/download ✓ | 直接截官网下载页 |
