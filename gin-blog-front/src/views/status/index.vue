<script setup>
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import api from '@/api'

import { storeToRefs } from 'pinia'

import { useAppStore } from '@/store'

/**
 * 站点状态页: 数据来自 /api/front/status (只读非敏感) + store 的博客信息。
 * 接口挂掉时展示降级文案, 不影响页面骨架。
 */

dayjs.extend(duration)

const appStore = useAppStore()
const { blogConfig, articleCount, viewCount } = storeToRefs(useAppStore())

const status = ref(null)
const failed = ref(false)
const now = ref(dayjs())
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
  ]
})

onMounted(async () => {
  load()
  timer = setInterval(() => {
    now.value = dayjs()
  }, 1000)
})

onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <div class="mx-auto w-full max-w-[1100px] px-4 pb-10 pt-24">
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
        <p class="mt-2 font-mono text-3xl font-bold text-primary">
          {{ uptimeText }}
        </p>
        <p class="mt-2 text-sm text-muted">
          建站于 {{ blogConfig?.website_createtime?.slice(0, 10) }} · 总访问 {{ viewCount }} · 文章 {{ articleCount }} 篇
        </p>
      </div>

      <!-- 服务指标 -->
      <div v-if="status" class="card-view space-y-2 p-6">
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
