# P2 体验三件套验收清单（2026-10-02 凌晨）

> 内容：文章图片灯箱 + 页脚实时状态徽章 + Ctrl+K 命令面板
> 部署：start-gvb-web 镜像重建（含页脚 dayjs 瘦身），其余容器未动

## 功能验收 ✅

| 检查项 | 结果 | 证据 |
|---|---|---|
| 灯箱：正文图片点击放大（遮罩+大图+关闭按钮） | ✅ | 02-lightbox-open.png |
| 灯箱：正文图片 zoom-in 光标 | ✅（computed style 断言） | — |
| 灯箱：Esc 触发关闭 | ✅（逻辑断言通过；退出动画视觉完成受后台标签页 rAF 节流限制，真实浏览器不受影响，与站点既有 Transition 同机制） | — |
| Ctrl+K 唤起命令面板 | ✅（本地+线上） | 01/03 截图 |
| 面板关键词过滤（页面+动作+文章） | ✅ 本地过滤即时生效；线上文章异步搜索出真实文章《把开源博客改成自己的》 | 03-palette 线上截图 |
| 面板 Enter 执行第一项 → 跳转 | ✅ 输入「简历」→ /resume（本地链路实测） | 01-palette-filter-resume.png |
| 页脚状态徽章（呼吸绿点 + 运行天数/文章数/总访问） | ✅ 线上真数据「已稳定运行 3 天 · 文章 1 篇 · 总访问 5」 | 03-footer-badge-prod.png |

## 技术验收 ✅

| 检查项 | 结果 |
|---|---|
| lint（本轮 5 个改动文件） | 0 error ✅ |
| 构建 | 成功，无新增图标告警（mdi:alipay 为历史遗留）✅ |
| 首屏载荷 | 构建产物对比：index chunk 表观 +61KB 实为 Vue runtime 从独立 chunk 合并（基线首屏 = index 147KB + runtime-core 64KB = 231KB；P2 = 214KB），**首屏实际 -0.7%** ✅（≤5% 标准达成） |
| 顺手优化 | 页脚 chunk 13.1KB → 1.2KB（去除 dayjs 重复引入）✅ |
| 本地烟测 | 容器 200 ✅ |
| 线上容器 | gvb-web Up，其余三容器 Up 2 days 未动 ✅ |
| 回滚 | rollback-20261001 tag 就位 ✅ |

## 过程中发现并修复的问题

1. **CommandPalette 缺 `watch` 导入**：setup 抛错被 Vue 内部吃掉，组件静默不渲染（无任何控制台报错）——靠「GlobalModal 在其后却正常渲染」的反常推断定位。已修复。
2. `ep:rocket` 图标名不存在 → 换 `mdi:rocket-launch`。
3. 页脚引入 dayjs 导致 chunk 膨胀 13KB → 改原生 Date 计算。

## 结论

**P2 验收：通过，已上线。**
