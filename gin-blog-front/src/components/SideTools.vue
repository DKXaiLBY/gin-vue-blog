<script setup>
import { useWindowScroll, watchThrottled } from '@vueuse/core'
import { computed, ref } from 'vue'
import { useAppStore } from '@/store'

const appStore = useAppStore()

const { y } = useWindowScroll()
const styleVal = ref('')
watchThrottled(y, () => {
  styleVal.value = (y.value > 20) ? 'opacity: 1; transform: translateX(-40px);' : ''
}, { throttle: 100 })

/*
 * 主题切换: 支持 View Transitions API 的浏览器播放「圆形扩散」动画
 * (从点击位置把新主题漾开, 2025 博客圈主流做法);
 * 不支持的浏览器/系统偏好减少动态时, 直接切换不表演。
 */
function toggleThemeWithRipple(e) {
  if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    appStore.toggleTheme()
    return
  }
  const x = e.clientX
  const y = e.clientY
  const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
  const transition = document.startViewTransition(() => appStore.toggleTheme())
  transition.ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`] },
      { duration: 500, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' },
    )
  }).catch(() => {})
}

const options = computed(() => [
  {
    // 图标名直接写成 UnoCSS 类名, 构建时就生成 CSS, 不再运行时去 iconify CDN 拉
    // (bi / fluent / ph 三个集合只为几个图标而引入不值得, 换成已加载的 mdi 里的近似图标)
    icon: appStore.isDark ? 'i-mdi:weather-sunny' : 'i-mdi:weather-night',
    fn: toggleThemeWithRipple,
  },
  {
    icon: 'i-uiw:setting',
    fn: () => window.$message?.info('设置开发中...'),
  },
  {
    icon: 'i-mdi:arrow-up-bold',
    fn: () => window.scrollTo({ behavior: 'smooth', top: 0 }),
  },
])
</script>

<template>
  <div class="fixed bottom-20 z-4 text-white transition-600 -right-9 space-y-1" :style="styleVal">
    <div
      v-for="item of options" :key="item.icon"
      class="f-c-c cursor-pointer rounded-sm bg-primary p-1 duration-300 hover:bg-accent"
    >
      <span class="block h-5 w-5" :class="item.icon" @click="item.fn($event)" />
    </div>
  </div>
</template>
