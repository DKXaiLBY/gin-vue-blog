<script setup>
import { debouncedWatch } from '@vueuse/core'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import api from '@/api'
import UModal from '@/components/ui/UModal.vue'
import { useAppStore } from '@/store'

/**
 * Ctrl+K / Cmd+K 命令面板: 页面直达 + 小动作 + 文章搜索。
 * 与顶栏搜索的区别: 这里偏「快速跳转与执行」, 顶栏搜索偏「翻文章内容」。
 */

const router = useRouter()
const appStore = useAppStore()

const open = ref(false)
const query = ref('')
const articles = ref([])
const activeIdx = ref(0)
const inputEl = ref(null)

const PAGES = [
  { label: '首页', icon: 'i-ep:home-filled', to: '/' },
  { label: '归档', icon: 'i-ep:collection', to: '/archives' },
  { label: '分类', icon: 'i-ep:folder-opened', to: '/categories' },
  { label: '标签', icon: 'i-ep:price-tag', to: '/tags' },
  { label: '说说', icon: 'i-ep:chat-dot-round', to: '/talks' },
  { label: '相册', icon: 'i-ep:picture', to: '/albums' },
  { label: '项目展示', icon: 'i-mdi:rocket-launch', to: '/projects' },
  { label: '我的简历', icon: 'i-ep:document', to: '/resume' },
  { label: '我的历程', icon: 'i-ep:guide', to: '/timeline' },
  { label: '友情链接', icon: 'i-ep:link', to: '/links' },
  { label: '留言板', icon: 'i-ep:edit-pen', to: '/message' },
  { label: '站点状态', icon: 'i-ep:odometer', to: '/status' },
  { label: '我的年度报告', icon: 'i-ep:data-analysis', to: '/annual' },
  { label: '关于我', icon: 'i-ep:user', to: '/about' },
]

const ACTIONS = [
  { label: '切换深色 / 浅色主题', icon: 'i-mdi:theme-light-dark', fn: () => appStore.toggleTheme() },
]

// 内置计算器: 输入 "=12*3+5" 直接出结果, 极客彩蛋
// 白名单只放数字与四则/括号, Function 求值前先把非法字符整个拒掉
const calcResult = computed(() => {
  const q = query.value.trim()
  if (!q.startsWith('=')) {
    return null
  }
  const expr = q.slice(1).replace(/\s/g, '')
  if (!expr || !/^[0-9+\-*/().]+$/.test(expr)) {
    return { expr, value: null, error: '只支持数字和 + - * / ( )' }
  }
  try {
    // 白名单正则已确保只有数字与四则括号, Function 求值在此场景可控
    // eslint-disable-next-line no-new-func
    const val = Function(`"use strict";return (${expr})`)()
    if (typeof val !== 'number' || !Number.isFinite(val)) {
      return { expr, value: null, error: '结果不是一个有限的数' }
    }
    return { expr, value: Math.round(val * 1e10) / 1e10, error: null }
  }
  catch {
    return { expr, value: null, error: '表达式不完整…' }
  }
})

// 关键词过滤页面与动作; 文章走接口异步搜; 计算器模式(=开头)时列表让位
const filteredItems = computed(() => {
  if (calcResult.value) {
    return []
  }
  const q = query.value.trim().toLowerCase()
  const hit = item => !q || item.label.toLowerCase().includes(q)
  return [
    ...PAGES.filter(hit),
    ...ACTIONS.filter(hit),
    ...articles.value.map(a => ({
      label: a.title.replaceAll('<em>', '').replaceAll('</em>', ''),
      icon: 'i-ep:document-checked',
      to: `/article/${a.id}`,
    })),
  ]
})

debouncedWatch(
  query,
  async () => {
    const kw = query.value.trim()
    if (!kw) {
      articles.value = []
      return
    }
    try {
      const resp = await api.searchArticles({ keyword: kw })
      articles.value = (resp.data ?? []).slice(0, 6)
    }
    catch {
      articles.value = []
    }
  },
  { debounce: 250 },
)

// 查询词变化后高亮项回到第一条
watch(query, () => {
  activeIdx.value = 0
})

function move(delta) {
  const total = filteredItems.value.length
  if (!total) {
    return
  }
  activeIdx.value = (activeIdx.value + delta + total) % total
}

function run(item) {
  open.value = false
  if (item.fn) {
    item.fn()
  }
  else if (item.to) {
    router.push(item.to).catch(() => {})
  }
}

function onInputKey(e) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    move(1)
  }
  else if (e.key === 'ArrowUp') {
    e.preventDefault()
    move(-1)
  }
  else if (e.key === 'Enter') {
    // IME 组合中的回车 (选字) 不当作执行
    if (e.isComposing || e.keyCode === 229) {
      return
    }
    // 计算器模式: 回车复制结果
    if (calcResult.value && calcResult.value.value !== null) {
      navigator.clipboard?.writeText(String(calcResult.value.value)).catch(() => {})
      open.value = false
      return
    }
    const item = filteredItems.value[activeIdx.value]
    if (item) {
      run(item)
    }
  }
}

function onGlobalKey(e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    open.value = !open.value
    return
  }
  if (e.key === 'Escape' && open.value) {
    open.value = false
  }
}

// 打开时清空状态并聚焦输入框
watch(open, async (val) => {
  if (val) {
    query.value = ''
    articles.value = []
    activeIdx.value = 0
    await nextTick()
    inputEl.value?.focus()
  }
})

onMounted(() => window.addEventListener('keydown', onGlobalKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onGlobalKey))
</script>

<template>
  <UModal v-model="open" :width="560" :z-index="60" :padded="false" :dismiss-button="false">
    <div class="py-2">
      <div class="flex items-center gap-2 border-b-1 border-divider border-solid px-4 pb-2">
        <span class="i-mdi:console-line block text-xl text-primary" />
        <input
          ref="inputEl" v-model="query"
          class="w-full border-0 bg-transparent py-1.5 text-main outline-none placeholder:text-muted"
          placeholder="跳转页面、执行动作或搜索文章…"
          @keydown="onInputKey"
        >
        <kbd class="rounded bg-surface-soft px-1.5 py-0.5 text-xs text-muted">Esc</kbd>
      </div>
      <!-- 内置计算器: = 开头时列表让位, 回车复制结果 -->
      <div v-if="calcResult" class="m-2 rounded-lg bg-primary/10 px-4 py-3 text-sm font-mono">
        <span class="text-muted">{{ calcResult.expr }} =</span>
        <span v-if="calcResult.value !== null" class="ml-2 text-lg text-primary font-bold">{{ calcResult.value }}</span>
        <span v-else class="ml-2 text-xs text-amber-500">{{ calcResult.error }}</span>
        <span v-if="calcResult.value !== null" class="float-right mt-1 text-xs text-muted">↵ 复制</span>
      </div>
      <ul v-else class="max-h-[46vh] overflow-y-auto px-2 py-2">
        <li v-for="(item, i) in filteredItems" :key="item.label + i">
          <button
            class="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-100"
            :class="i === activeIdx ? 'bg-primary/10 text-primary' : 'text-main hover:bg-surface-soft'"
            :data-active="i === activeIdx"
            @mouseenter="activeIdx = i"
            @click="run(item)"
          >
            <span class="block text-lg" :class="item.icon" />
            <span class="flex-1 truncate">{{ item.label }}</span>
            <span v-if="i === activeIdx" class="text-xs text-muted">↵</span>
          </button>
        </li>
        <li v-if="!filteredItems.length" class="px-4 py-6 text-center text-sm text-muted">
          没有匹配的结果
        </li>
      </ul>
      <div class="flex items-center gap-4 border-t-1 border-divider border-solid px-4 py-2 text-xs text-muted">
        <span>↑↓ 选择</span>
        <span>↵ 打开</span>
        <span>Esc 关闭</span>
        <span class="ml-auto">Ctrl+K 唤起</span>
      </div>
    </div>
  </UModal>
</template>
