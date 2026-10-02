<script setup>
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import api from '@/api'

import { useAppStore } from '@/store'

/**
 * 站点状态页: 数据来自 /api/front/status (只读非敏感) + store 的博客信息。
 * 接口挂掉时展示降级文案, 不影响页面骨架。
 */

dayjs.extend(duration)

const { blogConfig, articleCount, viewCount } = storeToRefs(useAppStore())

const status = ref(null)
const failed = ref(false)
const now = ref(dayjs())
const online = ref(null)
let timer = null

async function load() {
  try {
    const resp = await api.getStatus()
    if (resp.code === 0) {
      status.value = resp.data
      return
    }
  }
  catch {
    // fallthrough
  }
  failed.value = true
}

async function loadOnline() {
  try {
    const resp = await api.getOnline()
    if (resp.code === 0) {
      online.value = resp.data?.online ?? 0
    }
  }
  catch {
    online.value = null
  }
}

// 运行时长每秒跳动, 有"活着"的感觉
const uptimeText = computed(() => {
  if (!status.value) {
    return '-'
  }
  const d = dayjs.duration(now.value.diff(dayjs().subtract(status.value.uptime_seconds, 'second')))
  return `${Math.floor(d.asDays())} 天 ${d.hours()} 时 ${d.minutes()} 分 ${d.seconds()} 秒`
})

const rows = computed(() => {
  if (!status.value) {
    return []
  }
  return [
    ['Go 版本', status.value.go_version],
    ['堆内存', `${status.value.heap_mb} MB`],
    ['协程数', status.value.goroutines],
    ['文章 / 说说 / 项目', `${status.value.articles} / ${status.value.talks} / ${status.value.projects}`],
    ['当前在线', online.value === null ? '-' : `${online.value} 人`],
  ]
})

// 宿主机每分钟自检 (monitor.sh 写入 Redis): 有标记才显示, 没装监控就整行隐藏
const monitorText = computed(() => {
  const m = status.value
  if (!m || !m.monitor_ts) {
    return null
  }
  const age = Math.max(0, Math.floor((now.value.valueOf() - m.monitor_ts * 1000) / 1000))
  const ago = age < 90 ? `${age} 秒前` : `${Math.floor(age / 60)} 分钟前`
  return {
    ok: m.monitor_ok,
    text: m.monitor_ok ? `自检通过 · ${ago}` : `自检异常 · ${ago} · ${m.monitor_note}`,
  }
})

let tick = 0

onMounted(async () => {
  load()
  loadOnline()
  // 时钟每秒走; 每 30 个 tick 顺手刷新一次在线人数
  timer = setInterval(() => {
    now.value = dayjs()
    tick++
    if (tick % 30 === 0) {
      loadOnline()
    }
  }, 1000)
})

onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <div class="mx-auto max-w-[1100px] w-full px-4 pb-10 pt-24">
    <header class="mb-8 text-center">
      <h1 class="text-3xl font-bold">
        站点状态
      </h1>
      <p class="mt-2 text-muted">
        服务器的实时心跳 · 数据来自只读接口, 不含任何敏感信息
      </p>
    </header>

    <div class="mx-auto max-w-xl space-y-4">
      <!-- 运行时长大卡 -->
      <div class="card-view p-6 text-center">
        <p class="text-sm text-muted">
          持续运行中
          <span class="ml-1.5 inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
        </p>
        <p class="mt-2 text-3xl text-primary font-bold font-mono">
          {{ uptimeText }}
        </p>
        <p class="mt-2 text-sm text-muted">
          建站于 {{ blogConfig?.website_createtime?.slice(0, 10) }} · 总访问 {{ viewCount }} · 文章 {{ articleCount }} 篇
        </p>
        <!-- 宿主机每分钟自检结果 (monitor.sh → Redis → status 接口) -->
        <p v-if="monitorText" class="mt-1 text-xs" :class="monitorText.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'">
          {{ monitorText.ok ? '✓' : '✗' }} {{ monitorText.text }}
        </p>
      </div>

      <!-- 服务指标 -->
      <div v-if="status" class="card-view p-6 space-y-2">
        <p v-for="[k, v] in rows" :key="k" class="flex justify-between text-sm">
          <span class="text-muted">{{ k }}</span>
          <span class="font-mono">{{ v }}</span>
        </p>
      </div>
      <div v-else-if="failed" class="card-view p-6 text-center text-sm text-muted">
        状态接口暂时不可用, 稍后再来看看
      </div>
      <div v-else class="card-view f-c-c p-8 text-muted">
        <span class="animate-pulse">loading...</span>
      </div>
    </div>
  </div>
</template>
