<script setup>
import { onMounted, ref } from 'vue'

import api from '@/api'
import { useTiltSpotlight } from '@/composables/useTiltSpotlight'
import { convertImgUrl } from '@/utils'

const projects = ref([])
const loading = ref(true)

// 项目卡聚光 + 3D 倾斜
const { bindTilt } = useTiltSpotlight({ tilt: false })

onMounted(async () => {
  try {
    const res = await api.getProjects()
    projects.value = res.data ?? []
  }
  catch {
    projects.value = []
  }
  finally {
    loading.value = false
  }
})

// App 类项目二维码: 桌面访客扫码直达, qrcode 库动态加载不进首屏包
const qrShow = ref(false)
const qrLoading = ref(false)
const qrFailed = ref(false)
const qrDataUrl = ref('')
const qrProject = ref(null)

async function showQR(p) {
  qrProject.value = p
  qrShow.value = true
  qrLoading.value = true
  qrFailed.value = false
  try {
    const QRCode = await import('qrcode')
    const url = await QRCode.toDataURL(p.url, {
      width: 240,
      margin: 2,
      color: { dark: '#1a1a2e', light: '#ffffff' },
    })
    // 慢链路竞态守卫: await 期间用户已关窗或切看别的项目, 本次结果作废
    if (qrProject.value !== p || !qrShow.value) {
      return
    }
    qrDataUrl.value = url
  }
  catch (err) {
    console.error(err)
    qrFailed.value = true
  }
  finally {
    qrLoading.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 pb-10 pt-24">
    <header class="mb-8 text-center">
      <h1 class="text-3xl font-bold">
        我的项目
      </h1>
      <p class="mt-2 text-muted">
        记录我做过的每一个作品, 点击卡片可查看源码与在线演示
      </p>
    </header>

    <!-- 加载骨架 -->
    <div v-if="loading" class="grid gap-6 md:grid-cols-2">
      <div v-for="i in 2" :key="i" class="h-72 animate-pulse rounded-xl bg-surface" />
    </div>

    <!-- 空状态 -->
    <div v-else-if="projects.length === 0" class="card-view py-20 text-center">
      <span class="i-mdi:rocket-launch-outline mx-auto mb-4 block text-5xl text-muted" />
      <p class="text-muted">
        博主正在憋大招, 第一个项目马上就来
      </p>
    </div>

    <!-- 项目卡片网格 -->
    <div v-else class="grid gap-6 md:grid-cols-2">
      <article
        v-for="(p, i) in projects" :key="p.id"
        class="tilt-card project-card card-enter group relative overflow-hidden rounded-xl bg-surface shadow-md transition-shadow duration-300 hover:shadow-xl"
        :style="{ '--i': i }"
        v-bind="bindTilt"
      >
        <div class="h-44 overflow-hidden bg-surface-soft">
          <img
            :src="convertImgUrl(p.cover)"
            :alt="p.name"
            loading="lazy"
            class="h-full w-full object-cover transition-400 group-hover:scale-105"
          >
        </div>
        <div class="p-5 space-y-3">
          <h2 class="flex items-center gap-2 text-xl font-bold">
            {{ p.name }}
            <span
              v-if="p.is_app" aria-hidden="true"
              class="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary font-normal"
            >
              <span class="i-mdi:cellphone" /> 移动端应用
            </span>
          </h2>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="t in (p.tech_stack || '').split(',').map(s => s.trim()).filter(Boolean)"
              :key="t"
              class="rounded bg-surface-soft px-2 py-0.5 text-xs text-muted"
            >
              {{ t }}
            </span>
          </div>
          <p class="min-h-6 text-sm text-muted leading-6">
            {{ p.intro }}
          </p>
          <div class="flex flex-wrap gap-3 pt-1">
            <a
              v-if="p.url"
              :href="p.url" target="_blank" rel="noopener"
              class="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm text-white transition-300 hover:bg-accent"
            >
              <span :class="p.is_app ? 'i-mdi:cellphone-arrow-down' : 'i-mdi:open-in-new'" />
              {{ p.is_app ? '获取 App' : '在线预览' }}
            </a>
            <!-- 二维码: 手机扫码直达, 桌面看手机应用的最顺路径 -->
            <button
              v-if="p.is_app && p.url"
              type="button"
              class="hidden items-center gap-1 border border-line rounded-lg px-3 py-1.5 text-sm transition-300 md:inline-flex hover:border-primary hover:text-primary"
              @click="showQR(p)"
            >
              <span class="i-mdi:qrcode" /> 扫码获取
            </button>
            <a
              v-if="p.repo_url"
              :href="p.repo_url" target="_blank" rel="noopener"
              class="inline-flex items-center gap-1 border border-line rounded-lg px-3 py-1.5 text-sm transition-300 hover:border-primary hover:text-primary"
            >
              <span class="i-mdi:github" /> 源码
            </a>
          </div>
        </div>
      </article>
    </div>

    <!-- App 项目二维码弹窗 -->
    <Transition name="fade">
      <div
        v-if="qrShow"
        role="dialog" aria-modal="true" :aria-label="`${qrProject?.name ?? ''}扫码直达`"
        class="fixed inset-0 z-50 f-c-c bg-black/50"
        @click.self="qrShow = false"
        @keydown.esc="qrShow = false"
      >
        <div class="card-view w-72 p-6 text-center">
          <p class="mb-1 text-lg font-bold">
            {{ qrProject?.name }}
          </p>
          <p class="mb-4 break-all text-xs text-muted">
            手机扫码直达 · {{ qrProject?.url }}
          </p>
          <div v-if="qrLoading" class="h-60 f-c-c">
            <span class="animate-pulse text-muted">生成中…</span>
          </div>
          <div v-else-if="qrFailed" class="h-60 f-c-c text-sm text-muted">
            二维码生成失败，稍后再试
          </div>
          <img
            v-else
            :src="qrDataUrl"
            :alt="`${qrProject?.name ?? ''}下载链接二维码`"
            class="mx-auto h-60 w-60 rounded-lg bg-white p-2"
          >
          <button
            type="button"
            class="mt-4 text-sm text-muted transition-300 hover:text-main"
            @click="qrShow = false"
          >
            关闭
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* 聚光层: 光斑跟随 --mx/--my (useTiltSpotlight 写入) */
.project-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(340px circle at var(--mx, 50%) var(--my, 50%), rgb(129 140 248 / 12%), transparent 45%);
  opacity: 0;
  transition: opacity var(--d-norm) var(--e-out);
  pointer-events: none;
}

.project-card:hover::after {
  opacity: 1;
}
</style>
