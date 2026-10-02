<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import api from '@/api'

/**
 * Ask DKX · 本站 AI 助手挂件 (规则版)
 * 基于关键词匹配站内知识库 + 文章搜索兜底, 零外部依赖零成本;
 * 以后要接真 LLM, 只需把 answer() 换成 API 调用, 面板 UI 不用动。
 */

const router = useRouter()

const open = ref(false)
const messages = ref([{ role: 'bot', text: '你好，我是 DKX 的 AI 分身 🤖 关于本站、项目、技术栈都可以问我。试试：你用了什么技术栈？' }])
const input = ref('')
const inputEl = ref(null)
const bodyEl = ref(null)
const thinking = ref(false)

// 知识库: 关键词 → 回答 (命中越多关键词优先级越高)
const KB = [
  {
    keys: ['技术栈', '技术', 'stack', '怎么做的', '什么框架'],
    text: '前台 Vue3 + Vite + UnoCSS，后端 Gin + GORM + Redis，Docker 全栈部署在阿里云（4 容器）。整个站是从开源项目 gin-vue-blog 深度二开来的——终端、星图、状态页都是自己加的。',
    to: '/projects',
  },
  {
    keys: ['lovegirl', '情侣'],
    text: 'LoveGirl 是我的情侣 App，Flutter 写的，192 个 commit 的长跑项目：纪念日、相册、美食手账、高德真地图……最早能追溯到 v3.2.0，现在还在更新。',
    to: '/projects',
  },
  {
    keys: ['番茄', '专注', 'tomato'],
    text: '番茄专注 App：自习室重写成沉浸专注室、对抗式 QA 审查、每版配发版总览文档——工程化程度最高的一段开发期。',
    to: '/projects',
  },
  {
    keys: ['对抗', '方法论', '流程'],
    text: '「对抗式开发流程」是我自研的方法论：一个 AI 出方案 → 主力 AI 施工 → 再开一个完全独立的会话扮演敌意代码审查员，专门挑刺，攻不破才合并。这个站的前后端都跑过这套流程。',
  },
  {
    keys: ['简历', 'hire', '招人', '实习'],
    text: '简历在这边 📄 广州理工学院 CS 2029 届，项目经历有 LoveGirl / 博客二开 / SparkKeeper / 番茄专注。',
    to: '/resume',
  },
  {
    keys: ['联系', 'qq', '微信', '邮箱'],
    text: '页脚有 QQ 链接（3047902923），或者去留言板给我留言也行。',
    to: '/message',
  },
  {
    keys: ['彩蛋', '隐藏', 'egg'],
    text: '既然你诚心问了：这个终端本身就是彩蛋入口——试试 boot dkx-os，还有 play type 打字测速。别处找不到第二家。',
  },
  {
    keys: ['历程', '编年史', '时间线'],
    text: '历程页是一张可拖拽的「开发地铁图」：19 站从 2025.09 入学铺到现在，大站是关键里程碑。',
    to: '/timeline',
  },
  {
    keys: ['监控', '状态', '在线'],
    text: '/status 页有服务器实时心跳：运行时长、内存、在线人数——每分钟自检一次，挂了我自己会先知道。',
    to: '/status',
  },
]

// 兜底: 站内文章搜索
async function fallback(query) {
  try {
    const resp = await api.searchArticles({ keyword: query })
    const first = (resp.data ?? [])[0]
    if (first) {
      return { text: `站内找到一篇可能相关的文章，给你带路 →`, to: `/article/${first.id}`, linkText: first.title }
    }
  }
  catch { /* 搜索挂了就走通用兜底 */ }
  return { text: '这个问题超出了我的规则库 🤔（本助手是零成本规则版）。你可以去留言板问我本人，或者在终端里逛逛。', to: '/message' }
}

function matchKB(q) {
  let best = null
  let bestScore = 0
  for (const item of KB) {
    const score = item.keys.filter(k => q.includes(k)).length
    if (score > bestScore) {
      bestScore = score
      best = item
    }
  }
  return best
}

async function ask(q) {
  thinking.value = true
  messages.value.push({ role: 'user', text: q })
  await scrollBottom()
  // 模拟思考停顿, 回答不至于瞬间弹出显得假
  const kb = matchKB(q)
  const answer = kb ? { text: kb.text, to: kb.to } : await fallback(q)
  setTimeout(() => {
    messages.value.push({ role: 'bot', text: answer.text, to: answer.to, linkText: answer.linkText })
    thinking.value = false
    scrollBottom()
  }, 450)
}

function send() {
  const q = input.value.trim()
  if (!q || thinking.value) {
    return
  }
  input.value = ''
  ask(q)
}

function goLink(msg) {
  open.value = false
  if (msg.to) {
    router.push(msg.to).catch(() => {})
  }
}

async function scrollBottom() {
  await nextTick()
  bodyEl.value.scrollTop = bodyEl.value.scrollHeight
}

function toggle() {
  open.value = !open.value
  if (open.value) {
    nextTick(() => inputEl.value?.focus())
  }
}

function onGlobalKey(e) {
  if (e.key === 'Escape' && open.value) {
    open.value = false
  }
}

onMounted(() => window.addEventListener('keydown', onGlobalKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onGlobalKey))
</script>

<template>
  <div>
    <!-- 会话面板 -->
    <Transition name="ai-slide">
      <div v-if="open" class="ai-panel">
        <div class="ai-head">
          <span class="i-mdi:robot-happy-outline mr-1 align-middle" /> Ask DKX · 本站 AI 助手
          <button class="ai-close" type="button" aria-label="关闭助手" @click="toggle">
            ×
          </button>
        </div>
        <div ref="bodyEl" class="ai-body">
          <div
            v-for="(m, i) in messages" :key="i"
            class="ai-msg" :class="m.role === 'user' ? 'ai-msg-user' : 'ai-msg-bot'"
          >
            {{ m.text }}
            <button
              v-if="m.to && m.role === 'bot'"
              class="ai-link" type="button"
              @click="goLink(m)"
            >
              {{ m.linkText || '去看看 →' }}
            </button>
          </div>
          <div v-if="thinking" class="ai-msg ai-msg-bot ai-thinking">
            正在翻站内资料<span class="ai-dots">…</span>
          </div>
        </div>
        <div class="ai-inputrow">
          <input
            ref="inputEl" v-model="input" type="text"
            placeholder="问我任何关于本站的问题…"
            autocomplete="off" spellcheck="false"
            @keydown.enter="send"
          >
          <button class="ai-send" type="button" aria-label="发送" @click="send">
            <span class="i-mdi:send block" />
          </button>
        </div>
      </div>
    </Transition>
    <!-- 悬浮球 -->
    <button class="ai-fab" type="button" aria-label="打开 Ask DKX AI 助手" @click="toggle">
      <span class="i-mdi:robot-happy-outline block text-2xl" />
    </button>
  </div>
</template>

<style scoped>
.ai-fab {
  position: fixed;
  right: 18px;
  bottom: 118px;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #ec4899);
  color: #fff;
  cursor: pointer;
  box-shadow: 0 8px 24px rgb(99 102 241 / 40%);
  transition: transform 0.2s;
}

.ai-fab:hover {
  transform: scale(1.1) rotate(-6deg);
}

.ai-panel {
  position: fixed;
  right: 18px;
  bottom: 176px;
  z-index: 30;
  width: 300px;
  max-width: calc(100vw - 36px);
  border: 1px solid #313852;
  border-radius: 14px;
  overflow: hidden;
  background: #101223f7;
  box-shadow: 0 18px 50px rgb(0 0 0 / 45%);
}

.ai-head {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  background: #1a1e36;
  border-bottom: 1px solid #262c4a;
  font-size: 12.5px;
  color: #aeb8ff;
}

.ai-close {
  margin-left: auto;
  border: none;
  color: #9aa3c7;
  font-size: 16px;
  cursor: pointer;
  background: none;
}

.ai-body {
  max-height: 300px;
  min-height: 90px;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 12.5px;
}

.ai-msg {
  max-width: 92%;
  padding: 8px 11px;
  border-radius: 10px;
  line-height: 1.7;
  word-break: break-word;
}

.ai-msg-bot {
  align-self: flex-start;
  background: #1a1f33;
  color: #c9d2f2;
}

.ai-msg-user {
  align-self: flex-end;
  background: #6366f1;
  color: #fff;
}

.ai-thinking {
  color: #8b94ad;
}

.ai-dots {
  animation: ai-dots 1.2s steps(3) infinite;
}

@keyframes ai-dots {
  from { content: ''; }
}

.ai-link {
  display: block;
  margin-top: 6px;
  padding: 0;
  border: none;
  color: #818cf8;
  font-size: 12px;
  cursor: pointer;
  background: none;
  text-align: left;
}

.ai-link:hover {
  text-decoration: underline;
}

.ai-inputrow {
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  border-top: 1px solid #262c4a;
}

.ai-inputrow input {
  flex: 1;
  padding: 6px 4px;
  border: none;
  outline: none;
  color: #e8ebf4;
  font-size: 12.5px;
  background: transparent;
  caret-color: #818cf8;
}

.ai-send {
  display: flex;
  align-items: center;
  border: none;
  color: #818cf8;
  font-size: 17px;
  cursor: pointer;
  background: none;
}

.ai-send:hover {
  color: #aeb8ff;
}

.ai-slide-enter-active,
.ai-slide-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.ai-slide-enter-from,
.ai-slide-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.97);
}
</style>
