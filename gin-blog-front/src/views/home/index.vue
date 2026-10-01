<script setup>
import { computed, onMounted, reactive, ref } from 'vue'

import api from '@/api'
import GitHubHeatmap from '@/components/GitHubHeatmap.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { stripMarkdown } from '@/utils'
import Announcement from './components/Announcement.vue'
import ArticleCard from './components/ArticleCard.vue'
import AuthorInfo from './components/AuthorInfo.vue'
import Hero from './components/HomeBanner.vue'
import TalkingCarousel from './components/TalkingCarousel.vue'

import WebsiteInfo from './components/WebsiteInfo.vue'

const articleList = ref([])
const loading = ref(false)
const finished = ref(false)

// 分类筛选: 0 = 全部
const categories = ref([])
const activeCategoryId = ref(0)

// 一页 8 条: 5 条太少, 一屏放得下 2~3 张卡片, 往下滚几下就要再请求一次,
// 每次都要等一小会儿, 滚动看着就是一顿一顿的
const params = reactive({ page_size: 8, page_num: 1, category_id: 0 })

// 追加一页, 返回这页拿到几条
async function appendPage() {
  const resp = await api.getArticles(params)
  const list = resp.data?.page_data ?? []
  // 摘要去掉 Markdown 记号
  articleList.value.push(...list.map(e => ({ ...e, content: stripMarkdown(e.content) })))
  params.page_num++
  return list.length
}

async function loadFirstPage() {
  loading.value = true
  articleList.value = []
  params.page_num = 1
  finished.value = false
  try {
    await appendPage()
    if (articleList.value.length < params.page_size) {
      finished.value = true
    }
  }
  catch (err) {
    console.error(err)
  }
  finally {
    loading.value = false
  }
}

// 加载更多按钮: 比无限滚动的 IntersectionObserver 更可控, 也符合极简风
async function loadMore() {
  if (loading.value || finished.value) {
    return
  }
  loading.value = true
  try {
    const count = await appendPage()
    if (count < params.page_size) {
      finished.value = true
    }
  }
  catch (err) {
    console.error(err)
  }
  finally {
    loading.value = false
  }
}

onMounted(async () => {
  loadFirstPage()
  try {
    const res = await api.getCategorys()
    categories.value = res.data ?? []
  }
  catch (err) {
    console.error(err)
  }
})

function selectCategory(id) {
  if (activeCategoryId.value === id) {
    return
  }
  activeCategoryId.value = id
  params.category_id = id
  loadFirstPage()
}

function scrollToArticles() {
  document.getElementById('articles')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <!-- Hero: 大字自我介绍 + 小猫头像 + 一言 (diygod 式开场) -->
  <Hero @scroll-down="scrollToArticles" />

  <!-- 内容区 -->
  <div id="articles" class="mx-auto mb-8 max-w-[1230px] px-3">
    <!-- 分类胶囊栏 -->
    <div class="mb-8 flex items-center gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <button
        class="shrink-0 rounded-full px-4 py-1.5 text-sm transition-300"
        :class="activeCategoryId === 0
          ? 'bg-primary text-white'
          : 'bg-surface text-muted hover:text-primary'"
        @click="selectCategory(0)"
      >
        最新
      </button>
      <button
        v-for="cat of categories" :key="cat.id"
        class="shrink-0 rounded-full px-4 py-1.5 text-sm transition-300"
        :class="activeCategoryId === cat.id
          ? 'bg-primary text-white'
          : 'bg-surface text-muted hover:text-primary'"
        @click="selectCategory(cat.id)"
      >
        {{ cat.name }}
      </button>
    </div>

    <div class="grid grid-cols-12 gap-4">
      <!-- 左半部分 -->
      <div class="col-span-12 space-y-5 lg:col-span-9">
        <!-- 说说轮播 -->
        <TalkingCarousel :style="{ '--i': 0 }" />
        <!-- 文章列表 -->
        <div class="space-y-5">
          <ArticleCard v-for="(item, idx) in articleList" :key="item.id" :article="item" :idx="idx" />
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="min-h-10 f-c-c">
          <span class="animate-pulse text-xl text-muted">loading...</span>
        </div>
        <div v-else-if="!finished" class="min-h-10 f-c-c mt-2 lg:mt-5">
          <button
            class="rounded-full border border-line px-8 py-2.5 text-sm transition-300 hover:border-primary hover:text-primary"
            @click="loadMore"
          >
            加载更多
          </button>
        </div>
        <div v-else-if="articleList.length" class="min-h-10 f-c-c mt-2 lg:mt-5 text-gray">
          没有更多文章啦!
          <button class="ml-2 flex items-center text-primary" @click="selectCategory(activeCategoryId)">
            回到顶部 <span class="i-mdi:arrow-up-bold-box ml-1 inline-block text-xl" />
          </button>
        </div>
      </div>

      <!-- 右半部分 -->
      <div class="col-span-0 lg:col-span-3">
        <!-- sticky 实现悬浮固定效果 -->
        <div class="sticky top-24 space-y-5">
          <!-- GitHub 提交热力图 (site.js 未配置用户名时自动隐藏) -->
          <GitHubHeatmap :style="{ '--i': 0 }" />
          <!-- 公告 -->
          <Announcement :style="{ '--i': 1 }" />
          <!-- 网站资讯 -->
          <WebsiteInfo :style="{ '--i': 2 }" />
        </div>
      </div>
    </div>
  </div>
  <!-- 底部 -->
  <AppFooter />
</template>
