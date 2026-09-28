<script setup>
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/store'

const { blogInfo } = storeToRefs(useAppStore())
</script>

<template>
  <footer class="f-c-c">
    <div class="footer-wrap w-full px-5 py-10 text-center text-muted leading-8">
      <p> &copy;{{ 2022 }} - {{ new Date().getFullYear() }} By 阵、雨</p>
      <a class="transition-300 hover:text-primary" href="https://beian.miit.gov.cn/" target="_blank">
        {{ blogInfo.blog_config?.website_record }}
      </a>
    </div>
  </footer>
</template>

<style scoped>
/* 现代页脚: 面板色 + 细分隔线, 安静收尾, 不再用渐变动画抢戏 */
.footer-wrap {
  background: var(--c-surface);
  border-top: 1px solid var(--c-divider);
}
</style>
