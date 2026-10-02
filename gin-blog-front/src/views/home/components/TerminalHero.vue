<script setup>
import dayjs from 'dayjs'
import { storeToRefs } from 'pinia'

import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import DKXOS from '@/components/DKXOS.vue'
import { useAppStore } from '@/store'
import { getOneSentence } from '@/utils'

/**
 * Hero 迷你终端: 原一言打字机升级而来, 开场自动表演 3 条命令, 之后访客可真实输入。
 * 命令集都在 CMD 表里, 想加新命令改 exec() 的分发即可; 面板配色固定深色(终端本体观感),
 * 提示色跟随品牌靛紫。
 */

const router = useRouter()
const route = useRoute()
const { blogConfig, articleCount, categoryCount, tagCount, viewCount, isMobile } = storeToRefs(useAppStore())

const MOTTO = '把开源项目吃透、改造成自己的——这个过程学到的东西，比看十篇教程都多。'
const PROJECTS = [
  { label: 'LoveGirl', to: '/projects' },
  { label: '番茄专注', to: '/projects' },
  { label: '博客', to: '/' },
  { label: 'SparkKeeper', to: '/projects' },
]
const HINTS = ['help', 'ls projects', 'cat motto.txt', 'blog status', 'sudo hire-me']
const HELP_ROWS = [
  ['help', '列出可用命令'],
  ['ls projects', '看看我在做什么项目'],
  ['cat motto.txt', '读读我的座右铭'],
  ['blog status', '博客实时状态'],
  ['whoami', '我是谁'],
  ['fortune', '随机一言'],
  ['sudo hire-me', '打开我的简历 ⭐'],
  ['play type', '打字测速 🎮'],
  ['boot dkx-os', '启动 ???'],
  ['clear', '清屏'],
]

// 输出流: cmd = 一条命令行, out = 一段富文本(v-html, 内容来自常量或 esc() 后的输入),
// pills = 可点击跳转的项目胶囊
const entries = ref([])
const booted = ref(false)
const input = ref('')
const inputEl = ref(null)
const bodyEl = ref(null)
const history = ref([])
const histIdx = ref(0)
// DKX OS 桌面彩蛋开关 (boot dkx-os 唤起)
const osOpen = ref(false)
// 打字测速模式: 非空时输入行变成测速专用 (play type 唤起, exit 退出)
const typeTest = ref(null) // { target, startTime }
const TYPE_PHRASES = [
  'the quick brown fox jumps over the lazy dog',
  'code is read more often than it is written',
  'talk is cheap show me the code',
  'premature optimization is the root of all evil',
  'there are two hard things in computer science',
]
// localStorage 在隐私模式/企业策略下会抛 SecurityError, 读写都要包
const bestWpm = ref((() => {
  try {
    return Number(localStorage.getItem('dkx-best-wpm')) || 0
  }
  catch {
    return 0
  }
})())

// 测速时输入行实时变色: 前缀全对=绿, 打错=粉
const inputOk = computed(() => {
  if (!typeTest.value) {
    return null
  }
  return input.value === typeTest.value.target.slice(0, input.value.length)
})

function scrollToBottom() {
  bodyEl.value.scrollTop = bodyEl.value.scrollHeight
}

// 测速输入处理: 第一个字符起表; 打对整句结算 WPM; exit 退出
function onTestInput() {
  if (typeTest.value && input.value && !typeTest.value.startTime) {
    typeTest.value.startTime = Date.now()
  }
}

function handleTypeInput(v) {
  if (v === 'exit') {
    entries.value.push(outHtml('<span class="t-dim">已退出打字测速</span>'))
    typeTest.value = null
    return
  }
  const tt = typeTest.value
  if (!tt.startTime && v) {
    tt.startTime = Date.now()
  }
  if (v === tt.target) {
    settleTypeTest(v)
    return
  }
  // 打错给明确反馈, 不让界面像死机
  let wrong = 0
  for (let i = 0; i < Math.max(v.length, tt.target.length); i++) {
    if (v[i] !== tt.target[i]) {
      wrong++
    }
  }
  entries.value.push(outHtml(`<span class="t-pink">✗ 有 ${wrong} 处不符 — 照着目标句重新输入 (输入 exit 退出)</span>`))
}

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

function outHtml(html) {
  return { kind: 'out', html }
}

function helpEntry() {
  return outHtml(`<span class="t-dim">可用命令：</span><br>${HELP_ROWS.map(
    ([c, d]) => `  <span class="t-cmd">${c}</span><span class="t-dim"> — ${d}</span><br>`,
  ).join('')}`)
}

function statusEntry() {
  const ct = dayjs(blogConfig.value.website_createtime)
  const days = ct.isValid() ? ` · 已运行 ${Math.max(Math.floor(dayjs().diff(ct, 'day', true)), 0)} 天` : ''
  return outHtml(`<span class="t-amber">▶ 运行中</span> · 文章 ${articleCount.value} 篇 · 分类 ${categoryCount.value} 个 · 标签 ${tagCount.value} 个 · 总访问 ${viewCount.value}${days}`)
}

function navTo(to) {
  router.push(to).catch(() => {})
}

// 命令分发: 返回 true 表示已识别
async function dispatch(low) {
  if (low === 'help') {
    entries.value.push(helpEntry())
  }
  else if (low === 'ls' || low === 'ls projects') {
    entries.value.push({ kind: 'pills', items: PROJECTS })
  }
  else if (low === 'cat motto.txt' || low === 'cat motto') {
    entries.value.push(outHtml(`<span class="t-dim">${MOTTO}</span>`))
  }
  else if (low === 'blog status' || low === 'status') {
    entries.value.push(statusEntry())
  }
  else if (low === 'whoami') {
    entries.value.push(outHtml(`<span class="t-dim">DKXaiLBY · 二本大二 CS · AI 对抗式开发实践者</span>`))
  }
  else if (low === 'sudo hire-me' || low === 'hire-me' || low === 'cat resume.pdf') {
    entries.value.push(outHtml(`<span class="t-amber">▸ 正在打开简历页… ✔</span>`))
    // 600ms 后跳转, 但用户若已自己点去别处就不再拽人
    setTimeout(() => {
      if (route.currentRoute.value.path === '/') {
        navTo('/resume')
      }
    }, 600)
  }
  else if (low === 'fortune') {
    // 一言接口在这里找到了新家: 原来横幅上的打字机一句话
    const one = await getOneSentence()
    entries.value.push(outHtml(`<span class="t-dim">“${esc(one)}”</span>`))
  }
  else if (low === 'sudo rm -rf /') {
    entries.value.push(outHtml(`<span class="t-amber">⚠ 想得美 —— 备份每天凌晨 3 点自动跑（数据库 + 图片，7 天轮转）</span>`))
  }
  else if (low === 'boot dkx-os' || low === 'dkx-os' || low === 'startx') {
    entries.value.push(outHtml(`<span class="t-amber">▸ DKX OS 引导中… ✔</span>`))
    setTimeout(() => {
      osOpen.value = true
    }, 700)
  }
  else if (low === 'play type' || low === 'play') {
    startTypeTest()
  }
  else if (low === 'annual' || low === 'cat annual.report') {
    entries.value.push(outHtml(`<span class="t-amber">▸ 正在生成你的年度编程报告… ✔</span>`))
    setTimeout(() => {
      if (route.currentRoute.value.path === '/') {
        navTo('/annual')
      }
    }, 600)
  }
  else if (low.startsWith('cat ')) {
    entries.value.push(outHtml(`cat: ${esc(low.slice(4))}: No such file or directory<br><span class="t-dim">试试 cat motto.txt</span>`))
  }
  else {
    entries.value.push(outHtml(`<span class="t-dim">command not found: ${esc(low)} — 试试 help</span>`))
  }
  return true
}

// ---- 打字测速 (play type): 输入行变成测速通道, 打对整句即出 WPM, exit 退出 ----
function startTypeTest() {
  const target = TYPE_PHRASES[Math.floor(Math.random() * TYPE_PHRASES.length)]
  typeTest.value = { target, startTime: 0 }
  entries.value.push(outHtml(`<span class="t-dim">打字测速开始 —— 照着下面这句打, 打对自动结算 (WPM), 输入 exit 退出:</span>`))
  entries.value.push(outHtml(`<span class="t-cmd">${target}</span>`))
  input.value = ''
}

function settleTypeTest(typed) {
  const tt = typeTest.value
  const seconds = Math.max((Date.now() - tt.startTime) / 1000, 1)
  // WPM 标准算法: 每5个字符折算1个词
  const wpm = Math.round(typed.length / 5 / (seconds / 60))
  let line = `<span class="t-amber">▸ ${wpm} WPM</span> · 用时 ${seconds.toFixed(1)}s`
  if (wpm > bestWpm.value) {
    bestWpm.value = wpm
    line += ` <span class="t-cmd">🏆 新纪录!</span>`
    try {
      localStorage.setItem('dkx-best-wpm', String(wpm))
    }
    catch { /* 隐私模式随缘 */ }
  }
  else if (bestWpm.value > 0) {
    line += ` <span class="t-dim">(个人最佳 ${bestWpm.value} WPM)</span>`
  }
  entries.value.push(outHtml(line))
  typeTest.value = null
}

async function exec(raw) {
  const cmd = raw.trim()
  if (!cmd) {
    return
  }
  history.value.push(cmd)
  histIdx.value = history.value.length
  entries.value.push({ kind: 'cmd', cmd })
  if (cmd.toLowerCase() === 'clear') {
    entries.value = []
    await nextTick()
    bodyEl.value.scrollTop = bodyEl.value.scrollHeight
    return
  }
  await dispatch(cmd.toLowerCase())
  await nextTick()
  bodyEl.value.scrollTop = bodyEl.value.scrollHeight
  if (!isMobile.value) {
    inputEl.value?.focus()
  }
}

// IME 组合中的回车 (选字) 不当作执行
function onEnter(e) {
  if (e?.isComposing || e?.keyCode === 229) {
    return
  }
  const v = input.value
  input.value = ''
  if (typeTest.value) {
    handleTypeInput(v)
    nextTick(scrollToBottom)
    return
  }
  exec(v)
}

// 上下方向键翻历史命令, 真终端的手感; 测速模式下禁用 (避免历史灌进测速输入)
function onKeydown(e) {
  if (typeTest.value) {
    return
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (histIdx.value > 0) {
      histIdx.value--
      input.value = history.value[histIdx.value]
    }
  }
  else if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (histIdx.value < history.value.length - 1) {
      histIdx.value++
      input.value = history.value[histIdx.value]
    }
    else {
      histIdx.value = history.value.length
      input.value = ''
    }
  }
}

function focusInput() {
  // 移动端不抢焦点, 否则键盘直接弹起糊住半个屏幕
  if (isMobile.value || window.getSelection()?.toString()) {
    return
  }
  inputEl.value?.focus()
}

// ---- 开场自动表演 ----
const BOOT = [
  { cmd: 'ls projects', entry: { kind: 'pills', items: PROJECTS } },
  { cmd: 'cat motto.txt', entry: outHtml(`<span class="t-dim">${MOTTO}</span>`) },
  { cmd: 'sudo hire-me', entry: outHtml(`<span class="t-amber">▸ 正在打开简历页… ✔</span>`) },
]

let disposed = false

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function playBoot() {
  // 尊重系统"减少动态效果"偏好: 直接摆好最终画面
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    for (const b of BOOT) {
      entries.value.push({ kind: 'cmd', cmd: b.cmd }, b.entry)
    }
    booted.value = true
    return
  }
  for (const b of BOOT) {
    const line = { kind: 'cmd', cmd: '' }
    entries.value.push(line)
    for (const ch of b.cmd) {
      if (disposed) {
        return
      }
      line.cmd += ch
      await sleep(80)
    }
    if (disposed) {
      return
    }
    await sleep(420)
    entries.value.push(b.entry)
    await sleep(260)
  }
  booted.value = true
  await nextTick()
  if (!isMobile.value) {
    inputEl.value?.focus()
  }
}

onMounted(() => {
  playBoot()
})

onBeforeUnmount(() => {
  disposed = true
})
</script>

<template>
  <div class="term" role="application" aria-label="博客迷你终端, 输入 help 查看命令" @click="focusInput">
    <div class="term-bar">
      <i /><i /><i />
      <span class="term-title">dkx@blog — zsh</span>
    </div>
    <div ref="bodyEl" class="term-body">
      <template v-for="(en, i) in entries" :key="i">
        <div v-if="en.kind === 'cmd'" class="t-line">
          <span class="t-prompt">dkx@blog ~ %</span>
          <span class="t-cmd">{{ en.cmd }}</span>
        </div>
        <div v-else-if="en.kind === 'pills'" class="t-line">
          <button
            v-for="p in en.items" :key="p.label"
            class="t-pill" type="button" @click.stop="navTo(p.to)"
          >
            {{ p.label }}
          </button>
        </div>
        <!-- v-html 内容全部来自本组件常量或 esc() 转义后的访客输入 -->
        <div v-else class="t-line" v-html="en.html" />
      </template>
      <div v-if="booted" class="t-line t-inrow">
        <span class="t-prompt">dkx@blog ~ %</span>
        <input
          ref="inputEl" v-model="input" class="t-input" :class="typeTest ? (inputOk ? 't-ok' : 't-bad') : ''" type="text"
          autocomplete="off" autocapitalize="off" spellcheck="false"
          aria-label="输入命令, help 查看可用命令"
          @input="onTestInput"
          @keydown.enter="onEnter($event)" @keydown.up.prevent="onKeydown" @keydown.down.prevent="onKeydown"
        >
      </div>
    </div>
    <div v-if="booted" class="term-hints" @click.stop>
      <button v-for="h in HINTS" :key="h" class="t-hint" type="button" @click="exec(h)">
        {{ h }}
      </button>
    </div>
  </div>
  <!-- DKX OS 桌面彩蛋 -->
  <DKXOS v-if="osOpen" @exit="osOpen = false" />
</template>

<style scoped>
/* 终端本体固定深色 —— 终端就该长这样, 明暗主题下都是一块"嵌进页面的屏幕" */
.term {
  /* 有 position 才能盖过 Hero 区的绝对定位光斑背景, 否则光斑会糊在屏幕上 */
  position: relative;
  border: 1px solid #313852;
  border-radius: 14px;
  background: #0b0d14;
  overflow: hidden;
  box-shadow: 0 14px 40px rgb(0 0 0 / 25%);
  text-align: left;
  font-family: Consolas, 'Courier New', monospace;
}

.term-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px;
  background: #131725;
  border-bottom: 1px solid #20263a;
}

.term-bar i {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.term-bar i:nth-child(1) { background: #ff5f57; }
.term-bar i:nth-child(2) { background: #febc2e; }
.term-bar i:nth-child(3) { background: #28c840; }

.term-title {
  margin-left: 8px;
  font-size: 11px;
  color: #5f6a85;
}

.term-body {
  padding: 14px 18px;
  font-size: 13px;
  line-height: 1.9;
  color: #9ee6a0;
  min-height: 150px;
  max-height: 250px;
  overflow-y: auto;
}

.t-line {
  min-height: 1.9em;
  word-break: break-all;
}

.t-prompt {
  color: #818cf8;
  margin-right: 8px;
}

.t-cmd {
  color: #e8ebf4;
}

.t-dim {
  color: #8b94ad;
}

.t-amber {
  color: #fbbf24;
}

.t-pink {
  color: #f472b6;
}

.t-pill {
  display: inline-block;
  background: #1a1f33;
  color: #aeb8ff;
  border: 1px solid #2e3350;
  border-radius: 6px;
  padding: 1px 9px;
  font-size: 12px;
  margin: 2px 4px 2px 0;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.2s, color 0.2s;
}

.t-pill:hover {
  border-color: #818cf8;
  color: #c3c9ff;
}

.t-inrow {
  display: flex;
  align-items: center;
}

.t-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #e8ebf4;
  font: inherit;
  caret-color: #818cf8;
  padding: 0;
  transition: color 0.12s;
}

/* 打字测速: 前缀全对=绿, 打错=粉 */
.t-input.t-ok { color: #9ee6a0; }
.t-input.t-bad { color: #f472b6; }

.term-hints {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 10px 18px 14px;
  border-top: 1px dashed #20263a;
}

.t-hint {
  background: #141828;
  color: #8f96c8;
  border: 1px solid #262c44;
  border-radius: 6px;
  padding: 2px 10px;
  font-size: 11px;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.2s, color 0.2s;
}

.t-hint:hover {
  color: #aeb8ff;
  border-color: #818cf8;
}
</style>
