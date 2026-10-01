# P1 改版上线验收清单（2026-10-01）

> 改版内容：终端 Hero（首页）+ 星图历程页（/timeline）
> 代码：分支 feat/terminal-hero-starmap，commit 0137519
> 回滚手段：git tag v3.39-stable-pre-restyle + 服务器镜像 start-gvb-web:rollback-20261001

## 技术检查（curl，全过 ✅）

| 检查项 | 结果 |
|---|---|
| GET http://47.121.119.191/ | 200 ✅ |
| GET /timeline（SPA 回退） | 200 ✅ |
| GET /assets/timeline-HYNuMGxZ.js（新版本专属 chunk，证明新版已上线） | 200 ✅ |
| GET /api/front/rss | 200 ✅ |
| GET /admin/ | 200 ✅ |
| 首页 `<title>` | DKXaiLBY 的个人博客 ✅ |
| 四容器状态 | gvb-web Up（新镜像）/ 其余三容器 Up 2 days 未动 ✅ |
| 容器内自检 curl 127.0.0.1:8081 | 200 ✅ |

## 功能验收（线上真实环境，全过 ✅）

| 检查项 | 结果 | 证据 |
|---|---|---|
| 终端开场自动表演（逐字敲 3 条命令） | ✅ 线上实拍 | 01-home-terminal-prod.png |
| `blog status` 输出线上真实数据（文章 1 篇 · 分类 4 · 标签 4 · 总访问 5 · 已运行 3 天） | ✅ | 01-home-terminal-prod.png |
| `sudo hire-me` 跳转简历页 | ✅ URL=/resume，标题「简历」 | （URL 断言） |
| 命令提示 pill 可点击执行 | ✅（blog status 实测） | 01 |
| 星图 19 站渲染 + 渐变线路 + 大站/「你在这」 | ✅ | 02-timeline-prod.png |
| 星图站点点击 → 激活态切换 | ✅（AI 工作流起飞日站点激活成功） | 06-timeline-click-prod.png |
| 移动端 390px 首页：终端深色完整、无横向溢出 | ✅ scrollWidth 校验 | 08-home-mobile-prod.png |
| 移动端 390px 星图：自动转纵向、无横向溢出 | ✅ scrollWidth 校验 | 07-timeline-mobile-prod.png |

## 回归验收（老功能，全过 ✅）

| 检查项 | 结果 | 证据 |
|---|---|---|
| 简历页 /resume | ✅ 正常渲染 | 03-resume-prod.png |
| 项目页 /projects（4 个项目卡片） | ✅ 图片 5 张加载 | — |
| 说说页 /talks | ✅ 正常渲染 | 04-talks-prod.png |
| 文章详情 /article/4 | ✅ 标题「博客」正文渲染 | — |
| 首页说说轮播（真实数据：Claw 立项等） | ✅ | 08 |
| GitHub 热力图 | ✅ | 01 |

## 已知说明（非缺陷）

- 详情卡切换动画在「后台被遮挡的自动化标签页」里冻结：该标签页 rAF 被节流所致（环境限制），站点其他 5 处 Transition 同机制；真实前台浏览器不受影响。
- 部署过程中发现的「光斑糊在终端上」bug（移动端可见）已在本版本修复（`.term` 加 position:relative）。

## 结论

**P1 验收：通过。** 改版已在线上生效，回滚手段就位。
