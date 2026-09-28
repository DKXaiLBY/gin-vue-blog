<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import siteConfig from '@/config/site'
import { useAppStore } from '@/store'

/*
 * giscus 评论: 基于 GitHub Discussions, 免费无服务器。
 * site.js 里 giscus.repo 留空则整个组件不渲染(包括脚本)。
 * 前往 https://giscus.app 按提示生成仓库需要的那四个配置值。
 */
const store = useAppStore()
const container = ref(null)
const MOUNTED_KEY = 'giscus-mounted'

onMounted(() => {
  const cfg = siteConfig.giscus
  if (!cfg.repo || !container.value) {
    return
  }

  const script = document.createElement('script')
  script.src = 'https://giscus.app/client.js'
  script.setAttribute('data-repo', cfg.repo)
  script.setAttribute('data-repo-id', cfg.repoId)
  script.setAttribute('data-category', cfg.category)
  script.setAttribute('data-category-id', cfg.categoryId)
  script.setAttribute('data-mapping', 'pathname')
  script.setAttribute('data-strict', '0')
  script.setAttribute('data-reactions-enabled', '1')
  script.setAttribute('data-emit-metadata', '0')
  script.setAttribute('data-input-position', 'top')
  script.setAttribute('data-theme', store.isDark ? 'dark' : 'light')
  script.setAttribute('data-lang', 'zh-CN')
  script.setAttribute('crossorigin', 'anonymous')
  script.async = true
  // 路由复用同一组件时防止重复挂载
  script.dataset.mountKey = MOUNTED_KEY
  container.value.appendChild(script)
})

// 明暗切换时同步 giscus 主题: giscus 暴露 postMessage 协议
watch(() => store.isDark, (dark) => {
  const iframe = document.querySelector('iframe.giscus-frame')
  iframe?.contentWindow?.postMessage(
    { giscus: { setConfig: { theme: dark ? 'dark' : 'light' } } },
    'https://giscus.app',
  )
})

onBeforeUnmount(() => {
  if (container.value) {
    container.value.innerHTML = ''
  }
})
</script>

<template>
  <div v-if="siteConfig.giscus.repo" class="mt-8">
    <h2 class="mb-4 flex items-center gap-1.5 text-lg font-bold">
      <span class="i-mdi:github" /> Giscus 评论
    </h2>
    <p class="mb-3 text-xs text-muted">
      使用 GitHub 账号登录后即可评论
    </p>
    <div ref="container" />
  </div>
</template>
