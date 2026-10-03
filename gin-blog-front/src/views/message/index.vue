<script setup>
import { storeToRefs } from 'pinia'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import vueDanmaku from 'vue3-danmaku'

import api from '@/api'
import { useAppStore, useUserStore } from '@/store'

const userStore = useUserStore()
const { pageList } = storeToRefs(useAppStore())

const content = ref('')
const showBtn = ref(false)

const dmRef = ref(null) // 弹幕 ref 对象
const isHide = ref(false) // 隐藏弹幕
const isLoop = ref(false) // 循环播放

// 弹幕列表
const danmus = ref([{
  avatar: '/avatar.png',
  content: '大家好，欢迎来到我的博客！',
  nickname: 'DKXaiLBY',
}])

onMounted(async () => {
  try {
    const resp = await api.getMessages()
    await nextTick()
    danmus.value = [...danmus.value, ...(resp.data ?? [])]
  }
  catch (err) {
    console.error(err)
  }
})

async function send() {
  content.value = content.value.trim()
  if (!content.value) {
    window?.$message?.info('消息不能为空!')
    return
  }
  const data = {
    avatar: userStore.avatar,
    nickname: userStore.nickname,
    content: content.value,
  }
  // 以前是裸 await: 发送失败会留下未捕获的 rejection, 输入框也不该被清空
  try {
    await api.saveMessage(data)
  }
  catch (err) {
    console.error(err)
    return
  }
  dmRef.value?.push(data)
  content.value = ''
}

watch(isHide, val => val ? dmRef.value.hide() : dmRef.value.show())

// 根据后端配置动态获取封面
const coverStyle = computed(() => {
  const page = pageList.value.find(e => e.label === 'message')
  return page
    ? `background: url('${page?.cover}') center center / cover no-repeat;`
    : 'background: url("/covers/message.svg") center center / cover no-repeat;'
})
</script>

<template>
  <div :style="coverStyle" class="banner-fade-down absolute inset-x-0 h-screen overflow-hidden">
    <!-- 弹幕输入框: 终端风 (dkx 世界观) -->
    <div class="absolute inset-x-1 top-3/10 z-5 mx-auto w-[350px] animate-zoom-in overflow-hidden border-1 border-[#3b4470] rounded-xl bg-[#0b0d14f0] text-left text-light font-mono shadow-2xl lg:w-[460px]">
      <div class="flex items-center gap-1.5 border-b border-[#262c4a] bg-[#1a1e36] px-4 py-2.5">
        <i class="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" /><i class="h-2.5 w-2.5 rounded-full bg-[#febc2e]" /><i class="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span class="ml-2 text-xs text-[#9aa3c7]">guest@dkx-blog: ~/message</span>
      </div>
      <div class="px-5 py-4">
        <p class="text-sm text-[#9ee6a0]">
          <span class="text-[#818cf8]">guest@blog:~$</span> <span class="text-white">echo "说点什么吧？"</span>
        </p>
        <div class="mt-4 flex items-center gap-2">
          <span class="text-[#818cf8]">$</span>
          <input
            v-model="content"
            class="w-full border-0 bg-transparent text-sm text-[#e8ebf4] caret-[#818cf8] outline-none"
            placeholder="像发弹幕一样留言…"
            @click.stop="showBtn = true"
            @keyup.enter="send"
          >
          <button
            v-if="showBtn"
            class="shrink-0 border border-[#3b4470] rounded bg-[#1a1f33] px-3 py-1 text-xs text-[#aeb8ff] transition-300 hover:border-[#818cf8]"
            @click="send"
          >
            回车发送
          </button>
        </div>
        <div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#8b94ad]">
          <label class="flex cursor-pointer items-center gap-1">
            <input v-model="isLoop" type="checkbox" class="accent-[#818cf8]"> 循环
          </label>
          <button class="hover:text-[#aeb8ff]" @click="dmRef.play">
            ▶ 播放
          </button>
          <button class="hover:text-[#aeb8ff]" @click="dmRef.pause">
            ⏸ 暂停
          </button>
          <button class="hover:text-[#aeb8ff]" @click="dmRef.stop">
            ⏹ 停止
          </button>
          <label class="flex cursor-pointer items-center gap-1">
            <input v-model="isHide" type="checkbox" class="accent-[#818cf8]"> 隐藏
          </label>
        </div>
      </div>
    </div>
    <!-- 弹幕列表: 终端命令行风格 -->
    <div class="absolute inset-0 top-[60px] bg-[#0b0d1480]">
      <vue-danmaku
        ref="dmRef"
        v-model:danmus="danmus"
        class="h-full w-full font-mono"
        use-slot
        :loop="isLoop"
        :speeds="200"
        :channels="0"
        :top="5"
        :is-suspend="true"
      >
        <template #dm="{ danmu }">
          <div class="flex items-center gap-2 whitespace-nowrap border border-[#2e335066] rounded bg-[#0b0d14cc] px-3 py-1.5 text-[13px]">
            <span class="text-[#818cf8]">{{ danmu.nickname }}@blog</span>
            <span class="text-[#5f6a85]">:~$</span>
            <span class="text-[#9ee6a0]">{{ danmu.content }}</span>
          </div>
        </template>
      </vue-danmaku>
    </div>
  </div>
</template>

<style scoped>
input::-webkit-input-placeholder {
  color: #5f6a85;
}
</style>
