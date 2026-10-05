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

  // 标签页离开彩蛋: 切走时标题卖个萌, 回来恢复原标题 (被截图传播的小心机)
  document.addEventListener('visibilitychange', onVisibilityChange)

  // 控制台彩蛋: 给打开 F12 的人一点小惊喜 (v3.46)
  // eslint-disable-next-line no-console -- 彩蛋本身就是打给控制台看的
  console.log(
    '%c\n  DKXaiLBY@blog:~$ 你都打开控制台了，这份好奇心我收下了。\n  DKXaiLBY@blog:~$ sudo hire-me\n\n  => 跳转 /resume 查看我的简历\n',
    'color:#5cff9d;font-family:monospace;font-size:13px;line-height:1.8',
  )
})

// 记住离开前的标题 (可能是文章页的动态标题), 回来时还原
let titleBeforeHide = null
function onVisibilityChange() {
  if (document.hidden) {
    titleBeforeHide = document.title
    document.title = '(´･_･`) 去哪了，回来找我呀'
  }
  else if (titleBeforeHide) {
    document.title = titleBeforeHide
    titleBeforeHide = null
  }
}

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
  transition: opacity var(--d-fast) var(--e-out), transform var(--d-fast) var(--e-out);
}

.page-leave-active {
  transition: opacity var(--d-fast) var(--e-out);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-leave-to {
  opacity: 0;
}
</style>
