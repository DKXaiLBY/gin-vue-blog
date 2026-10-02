<script setup>
import { onMounted, ref } from 'vue'

import AskDKX from '@/components/AskDKX.vue'
import CommandPalette from '@/components/CommandPalette.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import GlobalModal from '@/components/modal/index.vue'
import SideTools from '@/components/SideTools.vue'
import UToast from '@/components/ui/UToast.vue'

import { useAppStore, useUserStore } from '@/store'
import { reportVisit } from '@/utils/visit-report'

const appStore = useAppStore()
const userStore = useUserStore()

const messageRef = ref(null)
const notifyRef = ref(null)

onMounted(() => {
  appStore.getPageList()
  appStore.getBlogInfo()
  userStore.getUserInfo()
  reportVisit()

  // 挂载全局提示
  window.$message = messageRef.value
  window.$notify = notifyRef.value
})

// 禁止右键菜单
// document.addEventListener('contextmenu', e => e.preventDefault())
</script>

<template>
  <!-- 顶部中间的消息提示 -->
  <UToast ref="messageRef" position="top" align="center" :timeout="3000" closeable />
  <!-- 右上方的消息通知 -->
  <UToast ref="notifyRef" position="top" align="right" :timeout="3000" closeable />

  <div class="h-full w-full flex flex-col">
    <!-- 顶部导航栏 -->
    <AppHeader />
    <!-- 中间内容(包含底部信息) -->
    <article class="flex flex-1 flex-col">
      <RouterView v-slot="{ Component, route }">
        <!-- 页面转场: 快速淡入+轻微上移, out-in 避免两页同屏闪烁 -->
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>
      </RouterView>
    </article>
  </div>
  <!-- 右下角悬浮工具条: 主题切换 / 回到顶部 -->
  <SideTools />
  <!-- Ctrl+K 命令面板 -->
  <CommandPalette />
  <!-- Ask DKX AI 助手挂件 -->
  <AskDKX />
  <!-- 全局弹窗 -->
  <GlobalModal />
</template>

<style scoped>
/* 页面转场: 旧页快速淡出, 新页从下方 8px 浮入; 总时长控制在 0.3s 内不拖沓 */
.page-enter-active {
  transition: opacity 0.18s ease-out, transform 0.18s ease-out;
}

.page-leave-active {
  transition: opacity 0.12s ease-in;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-leave-to {
  opacity: 0;
}
</style>
