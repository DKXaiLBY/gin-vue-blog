<script setup>
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useAppStore } from '@/store'

const { blogConfig, articleCount, viewCount } = storeToRefs(useAppStore())

// 备案号没配置(或还是占位符)时不渲染链接
const record = computed(() => blogConfig.value?.website_record ?? '')

// 实时状态徽章: 建站天数 + 文章数 + 总访问, 数据没就绪时整行不渲染。
// 只算个天数差, 不为此引入 dayjs(曾把页脚 chunk 撑到 13KB), 原生 Date 足够
const badge = computed(() => {
  const raw = String(blogConfig.value?.website_createtime ?? '')
  const ct = new Date(raw.replace(' ', 'T'))
  if (!raw || Number.isNaN(ct.getTime())) {
    return null
  }
  return {
    days: Math.max(Math.floor((Date.now() - ct.getTime()) / 86400000), 0),
    articles: articleCount.value,
    views: viewCount.value,
  }
})
</script>

<template>
  <footer class="f-c-c">
    <div class="footer-wrap w-full px-5 py-10 text-center text-muted leading-8">
      <p> &copy;{{ 2026 }} - {{ new Date().getFullYear() }} By DKXaiLBY</p>
      <a
        v-if="record && !record.includes('XXXX')"
        class="transition-300 hover:text-primary" href="https://beian.miit.gov.cn/" target="_blank"
      >
        {{ record }}
      </a>
      <!-- 实时状态徽章: 呼吸绿点 + 站点数据, 与后台数据同源 -->
      <p v-if="badge" class="f-c-c gap-1.5 text-sm">
        <span class="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
        已稳定运行 {{ badge.days }} 天 · 文章 {{ badge.articles }} 篇 · 总访问 {{ badge.views }}
      </p>
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
