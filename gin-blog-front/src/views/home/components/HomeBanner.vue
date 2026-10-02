<script setup>
import { storeToRefs } from 'pinia'

import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import api from '@/api'

import { useAppStore } from '@/store'
import TerminalHero from './TerminalHero.vue'

const emit = defineEmits(['scrollDown'])

const { blogConfig } = storeToRefs(useAppStore())

function scrollDown() {
  emit('scrollDown')
}

// 按时段问候: 依赖 nowTick 响应式刷新 (30s 一次), 跨过时段问候语会跟着变
const nowTick = ref(Date.now())

const greeting = computed(() => {
  const h = new Date(nowTick.value).getHours()
  if (h >= 5 && h < 9) {
    return '早上好'
  }
  if (h >= 9 && h < 12) {
    return '上午好'
  }
  if (h >= 12 && h < 14) {
    return '中午好'
  }
  if (h >= 14 && h < 18) {
    return '下午好'
  }
  if (h >= 18 && h < 23) {
    return '晚上好'
  }
  return '夜深了'
})

// public 资源走常量绑定而非模板静态 src: plugin-vue v6 会把静态路径编译成
// 模块导入, 在 vitest 里变成非法模块炸掉整个套件 (vue/no-useless-v-bind 的
// --fix 又会把 :src 转回静态, 所以必须放 script 里)
const AVATAR_SRC = '/avatar.png'

// 实时在线人数: 30s 轮询一次, 拿不到就不显示;
// 顺手把 report 心跳重发一次, 让"在线名单"反映的是活跃访客而不是新开标签页
const onlineCount = ref(0)
let onlineTimer = null

async function loadOnline() {
  nowTick.value = Date.now()
  api.report().catch(() => {})
  try {
    const resp = await api.getOnline()
    if (resp.code === 0) {
      onlineCount.value = resp.data?.online ?? 0
    }
  }
  catch {
    // 静默: 在线人数拿不到就不显示
  }
}

onMounted(() => {
  loadOnline()
  onlineTimer = setInterval(loadOnline, 30000)
})

onBeforeUnmount(() => clearInterval(onlineTimer))
</script>

<template>
  <!-- Hero 区: 撤掉全屏大横幅, diygod 式左文右像, 首屏直接进入状态 -->
  <section class="relative overflow-hidden">
    <!-- 背景装饰: 右上/左下靛紫光斑 + 细网格 -->
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute h-96 w-96 rounded-full bg-primary/15 blur-3xl -right-24 -top-24" />
      <div class="absolute bottom-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl -left-32" />
    </div>

    <div class="mx-auto max-w-[1100px] flex flex-col-reverse items-center gap-10 px-4 pb-16 pt-32 md:flex-row md:pb-24 md:pt-36">
      <!-- 左: 自我介绍 -->
      <div class="flex-1 text-center md:text-left">
        <p class="mb-3 inline-block rounded-full bg-primary/10 px-4 py-1 text-sm text-primary">
          👋 {{ greeting }}，我是
        </p>
        <h1 class="text-4xl font-bold md:text-5xl">
          {{ blogConfig.website_author }}
        </h1>
        <p class="mt-4 text-muted">
          {{ blogConfig.website_intro }}
        </p>
        <!-- 社交链接: 没配置的不渲染 -->
        <div class="mt-6 flex items-center justify-center gap-5 text-2xl md:justify-start">
          <a
            v-if="blogConfig.qq"
            :href="`http://wpa.qq.com/msgrd?v=3&uin=${blogConfig.qq}&site=qq&menu=yes`"
            target="_blank" rel="noopener noreferrer" title="QQ"
          >
            <span class="i-ant-design:qq-circle-filled block transition-300 hover:text-primary" />
          </a>
          <a
            v-if="blogConfig.github"
            :href="blogConfig.github" target="_blank" rel="noopener noreferrer" title="GitHub"
          >
            <span class="i-mdi:github block transition-300 hover:text-primary" />
          </a>
        </div>
        <!-- 实时在线人数: 拿不到就不显示 -->
        <p v-if="onlineCount > 0" class="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted md:justify-start">
          <span class="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          {{ onlineCount }} 人正在浏览
        </p>
        <div class="mt-8 flex items-center justify-center gap-4 md:justify-start">
          <button
            class="rounded-full bg-primary px-6 py-2.5 text-sm text-white transition-300 hover:opacity-85"
            @click="scrollDown"
          >
            开始阅读 ↓
          </button>
          <RouterLink
            to="/resume"
            class="border border-line rounded-full px-6 py-2.5 text-sm transition-300 hover:border-primary hover:text-primary"
          >
            我的简历
          </RouterLink>
        </div>
        <!-- 迷你终端: 原一言打字机位置, 开场自动表演 + 访客可真实输入 (fortune 命令保留了一言) -->
        <TerminalHero class="mt-8 md:mt-10" />
      </div>

      <!-- 右: 小猫头像 -->
      <div class="relative flex flex-1 justify-center">
        <div class="absolute inset-0 m-auto h-64 w-64 rounded-full bg-primary/10 blur-2xl md:h-80 md:w-80" />
        <img
          :src="AVATAR_SRC" alt="DKXaiLBY 的头像"
          class="relative h-56 w-56 rounded-[2.5rem] object-cover shadow-2xl md:h-72 md:w-72"
        >
      </div>
    </div>

    <!-- 向下滚动 -->
    <div class="f-c-c pb-6" @click="scrollDown">
      <span class="i-ep:arrow-down-bold inline-block animate-bounce cursor-pointer text-2xl text-muted" />
    </div>
  </section>
</template>

<style scoped>
section {
  min-height: 62vh;
}
</style>
