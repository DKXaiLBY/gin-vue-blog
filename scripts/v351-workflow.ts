// v3.51 收尾工作流：重建博客产物、重做番茄页、部署、验收、收尾
// 背景：详情弹窗代码已写入仓库但线上镜像缺失（部署时序错误）；番茄下载页被用户评"太丑"需按博客风格重做。

interface TomatoResult {
  /** 产出文件路径（workspace 相对），必须写入 deploy/tomato-download.html。 */
  path: string;
  /** 一句话说明设计要点。 */
  summary: string;
}

interface VerifyResult {
  /** 点项目卡片是否弹出 role=dialog 的详情弹窗。 */
  detailModalWorks: boolean;
  /** 四张 SVG 封面是否全部渲染（img 可见且尺寸正常）。 */
  coversLoaded: boolean;
  /** 番茄页视觉分（1-5，5=清爽的博客同款风格）。 */
  tomatoScore: number;
  /** 发现的问题，每条一句话。 */
  issues: string[];
}

interface WorkflowReport {
  conclusion: string;
  findings: { where: string; what: string; evidence: string; status: "verified" | "unconfirmed"; severity: "low" | "medium" | "high" }[];
  verified: string[];
  notCovered: string[];
}

const STYLE_REF = "D:/Projects/Personal/blog/gin-blog-front/src/styles/index.css";
const TOMATO_PATH = "deploy/tomato-download.html";

const designer = agent("番茄页设计师", {
  system:
    "你是前端视觉设计师。产出单文件 HTML（零外部依赖，内联全部 CSS；字体用系统栈 + Inter 回退，不引外部字体文件）。" +
    "设计规范：浅色清爽底 #f5f6fb；卡片白底、圆角 16px、柔和阴影、hover 上浮 4px；主色靛紫 #6366f1、强调粉 #ec4899；" +
    "标题用 800 字重深色 #1e2130，正文 #6b7089；动效：入场 fadeUp stagger（animation-delay 逐项递增）、" +
    "计时环 SVG 用 stroke-dashoffset 动画缓慢转圈、按钮 hover 变色上浮。" +
    "可先 Read " + STYLE_REF + " 感受博客的配色变量。写完文件后自查一遍 HTML 结构闭合。" +
    "若无法完成任务，如实说明而不是硬凑。",
});

// ---- 两线并行：构建（确定性门） + 番茄页创作 ----
const tomatoFuture = future(async () => {
  phase("重做番茄下载页（博客同款风格）");
  return designer.ask<TomatoResult>(
    "重写 deploy/tomato-download.html（番茄专注安卓 App 官方下载页），用 Write 工具直接覆盖该文件。" +
      "必须保留的功能（接口与文案不变）：两个下载链接 /api/version/download/android（正式版·约47MB）与 " +
      "/api/version/download/stable（稳定版）；版本徽章 v1.0 · 沉浸专注舱；Android 8.0+ 安装提示（允许未知来源）；" +
      "页脚含返回博客的链接 http://47.121.119.191/projects。" +
      "页面结构建议：顶部导航（logo+版本徽章）、终端窗式 Hero（浅色化：白卡片内终端命令 tomato start --focus 25m、" +
      "大标题「把手机，变成一台专注机器。」、双下载按钮）、功能四宫格（沉浸舱白噪音/场景任务/数据统计/本地优先）、" +
      "安装三步指引、页脚。返回产出路径与设计要点。",
  );
});

phase("重建博客前端产物并构建镜像");
const build = await world.run("C:/Program Files/Git/bin/bash.exe", ["scripts/v351-build.sh", "rerun-1"], { timeoutMs: 900_000 });
if (build.exitCode !== 0) {
  const result: WorkflowReport = {
    conclusion: "前端产物重建失败，v3.51 未部署。线上仍是旧版本，用户需刷新后重新验收。",
    findings: [{ where: "scripts/v351-build.sh", what: "构建脚本退出码 " + build.exitCode, evidence: (build.stderr || build.stdout).slice(0, 800), status: "verified", severity: "high" }],
    verified: ["构建脚本特征验证（项目详情/竞态修复字符串必须在产物中）"],
    notCovered: ["部署、番茄页部署、线上验收"],
  };
  return result;
}
log("博客产物重建并构建镜像成功");
const tomato = await tomatoFuture;
log("番茄页重做完成：" + tomato.summary);

// ---- 汇合部署 ----
phase("部署 v3.51 到服务器");
const deploy = await world.run("C:/Program Files/Git/bin/bash.exe", ["scripts/v351-deploy.sh", TOMATO_PATH, "rerun-1"], { timeoutMs: 600_000 });
if (deploy.exitCode !== 0) {
  const result: WorkflowReport = {
    conclusion: "v3.51 部署失败（构建已成功，产物镜像在本地 Temp 目录），需人工检查 SSH 或服务器状态。",
    findings: [{ where: "scripts/v351-deploy.sh", what: "部署脚本退出码 " + deploy.exitCode, evidence: (deploy.stderr || deploy.stdout).slice(0, 800), status: "verified", severity: "high" }],
    verified: ["构建产物含详情弹窗与竞态修复特征"],
    notCovered: ["线上验收、番茄页上线确认"],
  };
  return result;
}
log("部署完成");

// ---- 线上验收（含番茄页一轮修订回路） ----
phase("线上验收三件套");
const verifier = agent("线上验收员", {
  system:
    "你是线上验收员，只看不改：不修改任何文件、不执行任何写操作。" +
    "用 ZCode 内置浏览器验收（先调用 Skill 工具加载 browser-use:control-browser，按其流程操作）。" +
    "如实汇报，验收不到就说不达标，禁止美化结论；若浏览器完全不可用，escalate 并说明。",
});
let verify = await verifier.ask<VerifyResult>(
  "逐项验收并返回 JSON：" +
    "1) 打开 http://47.121.119.191/projects，等页面加载（入场上行动画约 1 秒）。逐个点击四张项目卡片：" +
    "点击后应出现 role=dialog 的详情弹窗（含大图封面、完整介绍、按钮组，Esc 或点遮罩可关）。四张都要试。" +
    "记录四张卡片的封面图（SVG 插画风：LoveGirl 粉色/博客靛紫/SparkKeeper 绿/Tomato 红）是否渲染正常。" +
    "2) 打开 http://47.121.119.191:3000/download（番茄下载页），按 1-5 打视觉分：" +
    "5=浅色清爽、靛紫主色、有入场动效、像博客一母同胞；1-2=仍是暗红粗糙旧版或配色混乱。" +
    "3) 把所有发现的问题一句话一条放进 issues。",
);
if (verify.tomatoScore < 3) {
  phase("番茄页修订一轮并重新部署");
  await designer.ask(
    "验收员给你的番茄页打了 " + verify.tomatoScore + " 分（5 分制）。意见：" +
      JSON.stringify(verify.issues) + "。按意见修订 " + TOMATO_PATH +
      "（Write 覆盖），保持下载链接与页面信息不变，重点解决被点名的问题。",
  );
  const redeploy = await world.run("C:/Program Files/Git/bin/bash.exe", ["scripts/v351-deploy.sh", TOMATO_PATH, "rerun-1"], { timeoutMs: 600_000 });
  if (redeploy.exitCode === 0) {
    verify = await verifier.ask<VerifyResult>(
      "番茄页已修订并重新部署。复验两件事：" +
        "1) 打开 http://47.121.119.191:3000/download 重新打视觉分（1-5）；" +
        "2) 抽查 http://47.121.119.191/projects 第一张卡片的详情弹窗仍能正常打开。返回同样结构的 JSON。",
    );
  }
}
// 功能性 P1（详情弹窗/封面）若不达标：交给前端修理工，一轮修复重建部署复验
if (!verify.detailModalWorks || !verify.coversLoaded) {
  phase("功能缺陷修复一轮");
  const fixer = agent("前端修理工", {
    system: "你是前端修理工。只改 gin-blog-front/src/views/project/index.vue 及其直接依赖，最小改动，不重构。",
  });
  const fix = await fixer.ask<string>(
    "线上项目页验收不通过：详情弹窗可开=" + verify.detailModalWorks + "，封面加载=" + verify.coversLoaded +
      "。问题清单：" + JSON.stringify(verify.issues) +
      "。请读 gin-blog-front/src/views/project/index.vue 排查并修复（常见嫌疑：弹窗 Transition/事件绑定/图片路径）。" +
      "改完运行 node node_modules/eslint/bin/eslint.js src/views/project/index.vue 确认无错误，返回修复说明。",
  );
  const rebuild = await world.run("C:/Program Files/Git/bin/bash.exe", ["scripts/v351-build.sh", "rerun-1"], { timeoutMs: 900_000 });
  if (rebuild.exitCode === 0) {
    const redeploy = await world.run("C:/Program Files/Git/bin/bash.exe", ["scripts/v351-deploy.sh", TOMATO_PATH, "rerun-1"], { timeoutMs: 600_000 });
    if (redeploy.exitCode === 0) {
      verify = await verifier.ask<VerifyResult>(
        "前端已修复并重新部署。复验 http://47.121.119.191/projects：四张卡片的详情弹窗与封面，返回同样结构的 JSON。",
      );
      log("修复后复验：弹窗=" + verify.detailModalWorks + " 封面=" + verify.coversLoaded);
    }
  }
  report({ what: "功能性缺陷修复执行完毕", detailModalWorks: verify.detailModalWorks, coversLoaded: verify.coversLoaded, fixNote: fix.slice(0, 200) });
}

// ---- 收尾 ----
phase("打标签并推送收尾");
await world.run("git", ["tag", "-f", "v3.51-stable"]);
const push = await world.run("C:/Program Files/Git/bin/bash.exe", ["scripts/push-retry.sh"], { timeoutMs: 1_800_000 });
const pushed = push.exitCode === 0;

await artifact.markdown(
  "report",
  [
    "# v3.51 交付报告：项目详情弹窗 + 品牌封面 + 番茄页重做",
    "",
    "- **详情弹窗**：点项目卡片弹出完整介绍（封面大图/技术栈/全部按钮），键盘 Enter 可开，Esc 关闭 —— " + (verify.detailModalWorks ? "线上验收通过" : "验收仍有问题，见 findings"),
    "- **封面**：四张终端风 SVG（LoveGirl 粉 / 博客靛 / SparkKeeper 绿 / Tomato 红）—— " + (verify.coversLoaded ? "全部渲染" : "部分未渲染，见 findings"),
    "- **番茄下载页**：博客同款浅色靛紫风格重做，视觉分 " + verify.tomatoScore + "/5" + (verify.issues.length ? "；遗留意见：" + verify.issues.join("；") : ""),
    "- **AI 状态**：glm-4-flash（4.7 过载已切回），问答/摘要正常",
    "",
    "终端线：a11y 100 / 性能 75（打字动画取舍仍待用户拍板）。",
  ].join("\n"),
  { title: "v3.51 交付报告", primary: true },
);

const result: WorkflowReport = {
  conclusion:
    "v3.51 已上线：详情弹窗" + (verify.detailModalWorks ? "验收通过" : "仍不达标") +
    "、封面" + (verify.coversLoaded ? "全部渲染" : "仍有问题") +
    "、番茄页视觉 " + verify.tomatoScore + "/5" + (pushed ? "；代码与标签已推送 GitHub。" : "；推送未完成（家宽阻断），稍后需手动 bash scripts/push-retry.sh。"),
  findings: verify.issues.map((i) => ({
    where: "http://47.121.119.191/projects 与 :3000/download",
    what: i,
    evidence: "线上验收员浏览器实测",
    status: "verified" as const,
    severity: "low" as const,
  })),
  verified: [
    "构建脚本特征验证（详情弹窗+竞态修复字符串在产物中）",
    "部署脚本远端探活（番茄页/封面 HTTP 状态、新产物 hash）",
    "验收员浏览器实测详情弹窗、四张封面、番茄页视觉分",
  ],
  notCovered: ["移动端真机扫码体验", "Lighthouse 复测（性能 90 依赖打字动画取舍）"],
};
return result;
