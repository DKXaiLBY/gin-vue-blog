<script setup>
import { computed, ref } from 'vue'

import siteConfig from '@/config/site'

/*
 * GitHub 提交热力图: 用 ghchart.rshah.org 的公开服务渲染, 零依赖零配置。
 * site.js 里 githubUsername 留空则整个组件不渲染;
 * 图片加载失败(服务挂了/被墙)也自动隐藏, 不留破图。
 */
const username = computed(() => siteConfig.githubUsername.trim())
const failed = ref(false)
</script>

<template>
  <div v-if="username" class="card-view">
    <h3 class="mb-3 flex items-center gap-1.5 font-bold">
      <span class="i-mdi:github" />
      GitHub 活跃
      <a
        :href="`https://github.com/${username}`"
        target="_blank" rel="noopener"
        class="ml-auto text-xs text-muted font-normal hover:text-primary"
      >@{{ username }}</a>
    </h3>
    <img
      v-if="!failed"
      :src="`https://ghchart.rshah.org/818cf8/${username}`"
      :alt="`${username} 的 GitHub 提交热力图`"
      loading="lazy"
      class="w-full"
      @error="failed = true"
    >
    <p v-else class="py-2 text-center text-xs text-muted">
      热力图加载失败, 去 GitHub 看我吧
    </p>
  </div>
</template>
