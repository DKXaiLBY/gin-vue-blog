<script setup>
import html2canvas from 'html2canvas'
import { onMounted, ref } from 'vue'

import api from '@/api'

/**
 * 年度编程报告页: 聚合站内数据生成一张可分享的开发者报告卡片。
 * 数据全部来自现有只读接口 (home/status/projects), 生成图用 html2canvas。
 */

const stats = ref(null)
const failed = ref(false)
const generating = ref(false)
const cardEl = ref(null)

onMounted(async () => {
  try {
    const [home, status, projects] = await Promise.all([
      api.getHomeData(),
      api.getStatus(),
      api.getProjects(),
    ])
    stats.value = {
      articles: home.data?.article_count ?? 0,
      views: home.data?.view_count ?? 0,
      users: home.data?.user_count ?? 0,
      talks: status.data?.talks ?? 0,
      projects: (projects.data ?? []).length,
      uptimeDays: Math.floor((status.data?.uptime_seconds ?? 0) / 86400),
    }
  }
  catch {
    failed.value = true
  }
})

const uptimeText = computed(() => {
  const d = stats.value?.uptimeDays ?? 0
  return d > 0 ? `${d} 天` : '刚刚起步'
})

// 开发者画像: 根据数据规模换称呼, 数据不全时用通用文案
const persona = computed(() => {
  if (!stats.value) {
    return ''
  }
  if (stats.value.projects >= 4) {
    return '多线并行的「对抗式开发」实践者 —— 让 AI 互相挑刺, 自己只做拍板的人。'
  }
  return '一位正在用 AI 对抗式开发快速成长的 CS 学生。'
})

async function saveCard() {
  if (!cardEl.value || generating.value) {
    return
  }
  generating.value = true
  try {
    const canvas = await html2canvas(cardEl.value, { backgroundColor: '#0d0e1a', scale: 2 })
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = 'dkx-annual-2026.png'
    a.click()
  }
  catch (err) {
    console.error(err)
  }
  finally {
    generating.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-[1100px] w-full px-4 pb-10 pt-24">
    <header class="mb-8 text-center">
      <h1 class="text-3xl font-bold">
        年度编程报告
      </h1>
      <p class="mt-2 text-muted">
        数据全部来自本站真实统计 · 生成卡片可保存分享
      </p>
    </header>

    <div v-if="failed" class="card-view f-c-c py-16 text-muted">
      数据加载失败, 稍后再试
    </div>

    <div v-else-if="!stats" class="card-view f-c-c py-16 text-muted">
      <span class="animate-pulse">正在汇总数据…</span>
    </div>

    <div v-else class="mx-auto max-w-xl">
      <!-- 报告卡片: 固定深色底, 截图分享时观感一致 -->
      <div
        id="annualCard"
        class="rounded-2xl p-8 text-white shadow-2xl"
        style="background: radial-gradient(600px 300px at 85% -10%, rgb(99 102 241 / 30%), transparent), radial-gradient(500px 280px at 0% 110%, rgb(236 72 153 / 16%), transparent), #0d0e1a"
      >
        <p class="text-sm text-white/60">
          📊 DKXaiLBY 的 2026 编程年报 · 已生成
        </p>
        <div class="grid grid-cols-2 mt-5 gap-x-6 gap-y-5">
          <div
            v-for="s in [
              { n: stats.projects, l: '个项目', c: '#818cf8' },
              { n: stats.talks, l: '条说说', c: '#ec4899' },
              { n: stats.articles, l: '篇文章', c: '#34d399' },
              { n: stats.views, l: '次访问', c: '#fbbf24' },
            ]" :key="s.l"
          >
            <div class="text-4xl font-bold font-mono" :style="{ color: s.c }">
              {{ s.n }}
            </div>
            <div class="mt-1 text-xs text-white/50">
              {{ s.l }}
            </div>
          </div>
        </div>
        <p class="mt-6 text-sm text-white/85 leading-7">
          {{ persona }}
        </p>
        <p class="mt-3 text-xs text-white/40">
          站点已运行 {{ uptimeText }} · 技术栈 Vue3 + Gin + Docker
        </p>
        <div class="mt-5 border-t border-white/10 pt-4 text-xs text-white/40">
          dkxailby 的个人博客 · 让 AI 互相挑刺的开发者
        </div>
      </div>

      <div class="mt-6 text-center">
        <button
          class="rounded-full bg-primary px-8 py-2.5 text-sm text-white transition-300 disabled:opacity-50 hover:opacity-85"
          :disabled="generating"
          @click="saveCard"
        >
          {{ generating ? '正在生成…' : '📸 生成分享卡片' }}
        </button>
        <p class="mt-3 text-xs text-muted">
          生成 PNG 后自动下载, 可以发朋友圈或贴在简历附件里
        </p>
      </div>
    </div>
  </div>
</template>
