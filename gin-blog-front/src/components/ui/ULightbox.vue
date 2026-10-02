<script setup>
import { onBeforeUnmount, onMounted } from 'vue'

/**
 * 图片灯箱: src 非空即显示, 点背景 / Esc / 关闭按钮退出。
 * 由文章页做事件委托唤起, 本组件只管展示与关闭。
 */
const props = defineProps({
  src: { type: String, default: '' },
})

const emit = defineEmits(['close'])

function onKey(e) {
  if (e.key === 'Escape' && props.src) {
    emit('close')
  }
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <Transition name="lb">
      <div
        v-if="src"
        data-overlay-open="true"
        class="fixed inset-0 z-999 f-c-c bg-black/80 backdrop-blur-sm"
        @click.self="emit('close')"
      >
        <img
          :src="src" alt="图片预览"
          class="max-h-[90vh] max-w-[92vw] rounded-lg shadow-2xl"
        >
        <button
          class="absolute right-5 top-5 h-9 w-9 f-c-c rounded-full bg-white/15 text-lg text-white transition-300 hover:bg-white/30"
          aria-label="关闭预览"
          @click="emit('close')"
        >
          <span class="i-mdi:close block" />
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lb-enter-active,
.lb-leave-active {
  transition: opacity 0.2s;
}

.lb-enter-active img,
.lb-leave-active img {
  transition: transform 0.2s;
}

.lb-enter-from,
.lb-leave-to {
  opacity: 0;
}

.lb-enter-from img,
.lb-leave-to img {
  transform: scale(0.92);
}
</style>
