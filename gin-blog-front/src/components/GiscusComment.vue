<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import siteConfig from '@/config/site'
import { useAppStore } from '@/store'

/*
 * giscus 评论: 基于 GitHub Discussions, 免费无服务器。
 * site.js 里 giscus.repo 留空则整个组件不渲染(包括脚本)。
 * 前往 https://giscus.app 按提示生成仓库需要的那四个配置值。
 *
 * 懒加载: giscus.app 在部分网络环境下很慢, 进页面就加载会拖慢整个页面
 * (评论区通常在最底部)。改成 IntersectionObserver——滚动到评论区附近才挂载脚本;
 * 观察器不可用时兜底直接挂载。
 */
const store = useAppStore()
const container = ref(null)
const rootEl = ref(null)
const MOUNTED_KEY = 'giscus-mounted'
const mounted = ref(false)
let observer = null

function mountGiscus() {
  if (mounted.value || !container.value) {
    return
  }
  mounted.value = true
  const cfg = siteConfig.giscus

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
}

onMounted(() => {
  if (!siteConfig.giscus.repo || !rootEl.value) {
    return
  }
  if (typeof IntersectionObserver === 'undefined') {
    mountGiscus()
    return
  }
  observer = new IntersectionObserver((entries) => {
    if (entries.some(e => e.isIntersecting)) {
      mountGiscus()
      observer?.disconnect()
      observer = null
    }
  }, { rootMargin: '300px' }) // 提前 300px 预加载, 滚到底部时刚好出现
  observer.observe(rootEl.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
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
  <div v-if="siteConfig.giscus.repo" ref="rootEl" class="mt-8">
    <h2 class="mb-4 flex items-center gap-1.5 text-lg font-bold">
      <span class="i-mdi:github" /> Giscus 评论
    </h2>
    <p class="mb-3 text-xs text-muted">
      使用 GitHub 账号登录后即可评论
    </p>
    <!-- 未滚到之前放一个占位, 避免布局跳动 -->
    <div v-if="!mounted" class="h-32 f-c-c rounded-lg bg-surface-soft text-sm text-muted">
      评论区将在滚动到此处时加载
    </div>
    <div ref="container" />
  </div>
</template>
