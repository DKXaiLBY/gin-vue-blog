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
            class="h-full w-full object-cover transition-500 group-hover:scale-105"
          >
        </div>
        <div class="p-5 space-y-3">
          <h2 class="text-xl font-bold">
            {{ p.name }}
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
          <div class="flex gap-3 pt-1">
            <a
              v-if="p.url"
              :href="p.url" target="_blank" rel="noopener"
              class="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm text-white transition-300 hover:bg-accent"
            >
              <span class="i-mdi:open-in-new" /> 在线预览
            </a>
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
