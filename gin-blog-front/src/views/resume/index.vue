<script setup>
import { onMounted, ref } from 'vue'

import resume from '@/config/resume'

const printing = ref(false)

function printResume() {
  printing.value = true
  // 下一帧再打印: 让按钮先从视口消失, 避免被打进 PDF
  requestAnimationFrame(() => {
    window.print()
    printing.value = false
  })
}

// 打印场景下没有 hover, 日期格式也保持原样即可
onMounted(() => {})
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 pb-10 pt-24">
    <!-- 打印按钮: 打印时隐藏 -->
    <div class="mb-4 flex justify-end print:hidden">
      <button
        class="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm text-white transition-300 hover:bg-accent"
        @click="printResume"
      >
        <span class="i-mdi:printer" /> 打印 / 导出 PDF
      </button>
    </div>

    <main class="resume-sheet rounded-xl bg-surface p-8 shadow-md space-y-6">
      <!-- 基本信息 -->
      <header class="border-b border-divider pb-6 text-center">
        <h1 class="text-3xl font-bold">
          {{ resume.name }}
        </h1>
        <p class="mt-1 text-muted">
          {{ resume.slogan }}
        </p>
        <div class="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
          <a
            v-for="c in resume.contacts" :key="c.label"
            :href="c.link || undefined" :target="c.link ? '_blank' : undefined"
            class="inline-flex items-center gap-1.5 hover:text-primary"
            :class="c.link ? 'text-primary' : 'text-muted'"
          >
            <span :class="c.icon" /> {{ c.label }}: {{ c.value }}
          </a>
        </div>
      </header>

      <!-- 教育经历 -->
      <section>
        <h2 class="mb-3 flex items-center gap-2 text-lg font-bold">
          <span class="i-mdi:school-outline text-primary" /> 教育经历
        </h2>
        <div v-for="e in resume.educations" :key="e.school" class="mb-2">
          <div class="flex flex-wrap justify-between gap-2 font-bold">
            <span>{{ e.school }}</span>
            <span class="text-sm text-muted font-normal">{{ e.time }}</span>
          </div>
          <p class="text-sm text-muted">
            {{ e.major }}
          </p>
          <p class="mt-1 text-sm">
            {{ e.desc }}
          </p>
        </div>
      </section>

      <!-- 专业技能 -->
      <section>
        <h2 class="mb-3 flex items-center gap-2 text-lg font-bold">
          <span class="i-mdi:code-braces text-primary" /> 专业技能
        </h2>
        <p class="mb-1 text-sm">
          <span class="font-bold">熟练:</span>
          <span
            v-for="s in resume.skills.proficient" :key="s"
            class="mr-1.5 inline-block rounded bg-surface-soft px-2 py-0.5 text-xs"
          >{{ s }}</span>
        </p>
        <p class="text-sm">
          <span class="font-bold">了解:</span>
          <span
            v-for="s in resume.skills.familiar" :key="s"
            class="mr-1.5 inline-block rounded bg-surface-soft px-2 py-0.5 text-xs text-muted"
          >{{ s }}</span>
        </p>
      </section>

      <!-- 项目经历 -->
      <section>
        <h2 class="mb-3 flex items-center gap-2 text-lg font-bold">
          <span class="i-mdi:rocket-launch-outline text-primary" /> 项目经历
        </h2>
        <div v-for="p in resume.projects" :key="p.name" class="mb-4">
          <div class="flex flex-wrap justify-between gap-2 font-bold">
            <span>{{ p.name }}</span>
            <span class="text-sm text-muted font-normal">{{ p.time }}</span>
          </div>
          <p class="mt-1 text-sm leading-6">
            {{ p.desc }}
          </p>
          <p class="mt-1 text-xs text-muted">
            {{ p.tech }}
          </p>
        </div>
      </section>

      <!-- 荣誉奖项 -->
      <section v-if="resume.awards.length">
        <h2 class="mb-3 flex items-center gap-2 text-lg font-bold">
          <span class="i-mdi:trophy-outline text-primary" /> 荣誉奖项
        </h2>
        <ul class="text-sm space-y-1">
          <li v-for="a in resume.awards" :key="a.text" class="flex gap-3">
            <span class="w-20 shrink-0 text-muted">{{ a.time }}</span>
            <span>{{ a.text }}</span>
          </li>
        </ul>
      </section>

      <!-- 自我评价 -->
      <section>
        <h2 class="mb-3 flex items-center gap-2 text-lg font-bold">
          <span class="i-mdi:account-heart-outline text-primary" /> 自我评价
        </h2>
        <p class="text-sm leading-7">
          {{ resume.selfEvaluation }}
        </p>
      </section>
    </main>
  </div>
</template>

<style>
/* 打印态: 隐藏站点框架, 白底黑字还原成一张干净简历 */
@media print {
  header nav,
  footer,
  .nav,
  .nav-fixed,
  .side-tools {
    display: none !important;
  }

  body {
    background: #fff !important;
  }

  .resume-sheet {
    box-shadow: none !important;
    border-radius: 0 !important;
    padding: 0 !important;
  }
}
</style>
