<script setup>
import timelineData from '@/config/timeline'

// 圆点/边框颜色按事件类型区分
const typeStyles = {
  study: 'bg-primary',
  project: 'bg-emerald-500',
  award: 'bg-accent',
  other: 'bg-gray-400',
}
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 pb-10 pt-24">
    <header class="mb-10 text-center">
      <h1 class="text-3xl font-bold">
        我的历程
      </h1>
      <p class="mt-2 text-muted">
        一路走来的脚印, 按时间倒序排列
      </p>
    </header>

    <div class="relative ml-3 border-l-2 border-line pl-8">
      <div
        v-for="item in timelineData" :key="item.date + item.title"
        class="relative mb-10"
      >
        <!-- 时间轴圆点 -->
        <span
          class="absolute top-1 block h-4 w-4 border-4 border-surface rounded-full -left-[41px]"
          :class="typeStyles[item.type] ?? typeStyles.other"
        />
        <div class="rounded-xl bg-surface p-5 shadow-md transition-500 hover:shadow-lg">
          <span class="text-sm text-muted">{{ item.date }}</span>
          <h2 class="mt-1 text-lg font-bold">
            {{ item.title }}
          </h2>
          <p class="mt-2 text-sm text-muted leading-6">
            {{ item.desc }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
