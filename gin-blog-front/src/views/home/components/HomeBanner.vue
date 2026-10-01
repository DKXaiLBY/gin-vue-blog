<script setup>
import EasyTyper from 'easy-typer-js'
import { storeToRefs } from 'pinia'

import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useAppStore } from '@/store'
import { getOneSentence } from '@/utils'

const { blogConfig } = storeToRefs(useAppStore())

const emit = defineEmits(['scroll-down'])

// 打字机特效配置
const typer = reactive({
  output: '',
  isEnd: false,
  speed: 100,
  singleBack: false,
  sleep: 2000, // 完整输出后停留 2 秒
  type: 'normal',
  backSpeed: 80,
  sentencePause: true,
})

// 组件卸载时停掉打字器定时器, 否则离开首页后它仍在后台循环输出
let typerInstance = null
let disposed = false

onMounted(() => {
  startTyper()
})

onBeforeUnmount(() => {
  disposed = true
  typerInstance?.closeTimer()
  typerInstance = null
})

async function startTyper() {
  // 一言 + 打字机特效, 接口不通时 getOneSentence 内部会随机取一句
  const one = await getOneSentence()
  // 等待期间组件可能已被卸载(快速切换路由), 此时不再启动新的打字器
  if (disposed) {
    return
  }
  typerInstance = new EasyTyper(typer, one, () => {}, () => {})
}

function scrollDown() {
  emit('scroll-down')
}
</script>

<template>
  <!-- Hero 区: 撤掉全屏大横幅, diygod 式左文右像, 首屏直接进入状态 -->
  <section class="relative overflow-hidden">
    <!-- 背景装饰: 右上/左下靛紫光斑 + 细网格 -->
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
      <div class="absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
    </div>

    <div class="mx-auto flex max-w-[1100px] flex-col-reverse items-center gap-10 px-4 pt-32 pb-16 md:flex-row md:pt-36 md:pb-24">
      <!-- 左: 自我介绍 -->
      <div class="flex-1 text-center md:text-left">
        <p class="mb-3 inline-block rounded-full bg-primary/10 px-4 py-1 text-sm text-primary">
          👋 你好，我是
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
        <div class="mt-8 flex items-center justify-center gap-4 md:justify-start">
          <button
            class="rounded-full bg-primary px-6 py-2.5 text-sm text-white transition-300 hover:opacity-85"
            @click="scrollDown"
          >
            开始阅读 ↓
          </button>
          <RouterLink
            to="/resume"
            class="rounded-full border border-line px-6 py-2.5 text-sm transition-300 hover:border-primary hover:text-primary"
          >
            我的简历
          </RouterLink>
        </div>
        <!-- 一言打字机 -->
        <p class="mt-8 text-sm text-muted md:mt-10">
          <span class="i-mdi:format-quote-open text-primary align-middle" />
          {{ typer.output }}<span class="animate-pulse text-primary">|</span>
        </p>
      </div>

      <!-- 右: 小猫头像 -->
      <div class="relative flex-1 flex justify-center">
        <div class="absolute inset-0 m-auto h-64 w-64 rounded-full bg-primary/10 blur-2xl md:h-80 md:w-80" />
        <img
          src="/avatar.png" alt="DKXaiLBY 的头像"
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
