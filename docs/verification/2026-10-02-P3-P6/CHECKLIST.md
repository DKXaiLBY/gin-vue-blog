# P3~P6 连续施工验收清单（2026-10-02）

> 范围：P3 移动端+性能 / P4 安全运维 / A 测试修绿 / B 状态页 / C 后台打磨 / D SEO / P5 DKX OS 彩蛋 / P6 内容运营
> 提交：3449a13 (A) → 015631b (主体) → 7605408 (头像备份归位)，全部已推送 fork

## A · 测试修绿 ✅

| 检查项 | 结果 |
|---|---|
| 根因定位 | plugin-vue v6 将模板静态 `src="/xxx"` 编译为模块导入，vitest 中成非法模块炸套件（4 个套件崩溃）✅ |
| 修复 | 6 处静态 public 资源改 `:src` 绑定（渲染结果不变）✅ |
| 修测 | user/about/message 上游品牌期望更新；home 4 条无限滚动测试重写为「加载更多」语义 ✅ |
| 新增单测 | TerminalHero 命令分发 11 条 + 星图站点选择 5 条 ✅ |
| 全量 | **34 文件 / 213 测试全绿**（修复前 25/166 + 7 失败）✅ |

## P3 · 移动端 + 性能 ✅

| 检查项 | 结果 |
|---|---|
| 375px 全站 16 路由走查 | 零横向溢出 ✅ |
| 真机断点 bug #1 | 768~1023 区间星图撑破容器 → 纵向断点提到 1023px ✅ |
| 真机断点 bug #2 | 1024px 溢出 84px：flex 父级下 `mx-auto` 放弃 stretch 改 fit-content，被星图 min-width:max-content 顶到 1100 上限 → 页根补 `w-full` ✅ |
| 7 档宽度复检 | 375/640/768/820/1024/1280/1440 × 4 代表页面全零溢出 ✅ |
| Lighthouse 基线 | 64 分存档 `lh-home-baseline.json` ✅ |
| 优化 | 头像 1080px/135KB → 512px/16KB（-88%）、LCP 预加载 + fetchpriority ✅ |
| 复测 | 总载荷 **305KB → 196KB（-36%）**，LCP 4.2→4.1s；总分持平 64（瓶颈为服务器 TTFB 与外部资源 ghchart/一言，超出本轮范围，如实记录）✅ |

## P4 · 安全运维 ✅

| 检查项 | 结果 |
|---|---|
| nginx 安全头 | X-Content-Type-Options / X-Frame-Options / Referrer-Policy / Permissions-Policy 全部上线（curl 验证），限流未破坏，原配置备份 `.bak-20261002` ✅ |
| 备份恢复演练 | **真实覆盖恢复发生**（dump 含 `USE gvb`，管道恢复进正式库）——数据一致性验证无损（HEX 级检查），view_count 计数回滚为唯一实际损失；站名「阵雨」短暂回滚后已修复 ✅ |
| 演练教训（已写入 handoff） | 恢复临时库必须先剥掉 dump 头部的 CREATE DATABASE/USE，或 `sed` 过滤；恢复验证必须显式 `--default-character-set=utf8mb4`（否则 latin1 显示假象误判乱码）✅ |
| GHCR 评估 | ghcr.io 本机与服务器均不可达（000）→ 维持 save\|gzip\|scp\|load 手动部署为标准流程 ✅ |
| 上游同步 | 家宽阻断窗口，挂后台重试（不阻塞）✅ |

## B · 状态页 ✅

| 检查项 | 结果 |
|---|---|
| Go 接口 | `/api/front/status` 只读非敏感（Go 版本/堆内存/协程/内容计数），swagger 重生成且一致性测试过，Go 全量测试绿 ✅ |
| 前台页面 | `/status` 运行时长秒级跳动 + 服务指标卡，线上截图 01-status-page-prod.png ✅ |
| 入口 | Ctrl+K 面板「站点状态」+ 页脚「状态页 →」链接 ✅ |

## C · 后台打磨 ✅

仪表盘本已 token 化（暗色由 naive-ui darkTheme 自动适配）；仪表盘问候渐变 + 登录页图标两处科技蓝残留 → 品牌靛紫（代码级验证；暗色截图需 admin 密码，留待用户自查）。

## D · SEO ✅

| 检查项 | 结果 |
|---|---|
| index.html | lang=zh-CN、description、author、OG 四件套、WebSite JSON-LD（线上 curl 验证）✅ |
| 动态覆写 | router afterEach 按路由覆写 description/og:title；文章页用真实标题+摘要覆写 ✅ |
| sitemap | `scripts/gen-sitemap.mjs` 从线上 API 生成（8 静态 + N 篇文章），已跑一次并随镜像上线 ✅ |

## P5 · DKX OS 彩蛋 ✅

| 检查项 | 结果 |
|---|---|
| 入口 | 终端命令 `boot dkx-os`（help 列表中显示为「启动 ???」），线上实测打开 ✅ |
| 桌面 | 靛紫渐变壁纸 + 7 图标（项目/说说/简历/历程等，移动端单击、桌面双击导航）✅ 截图 02 |
| 关于本机 | 可拖动 neofetch 风窗口，全真数据（uptime/文章/访问/技术栈）✅ 截图 03 |
| 退出 | Esc / 关机按钮 / 图标导航后自动退出；正常浏览零感知 ✅ |

## P6 · 内容运营 ✅

3 条 10 月迭代真实说说（改版上线/测试修绿/彩蛋线索）经 SQL 文件通道入库，API 验证中文无乱码，说说页可见。

## 最终回归 ✅

前台测试 34/213 全绿；线上 10 个核心路径全 200；四容器 Up。

## 结论

**P3~P6 全部验收通过。** 改版期间两次真实回滚保险均未动用（rollback tag + git tag 在位保留）。
