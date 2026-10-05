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
