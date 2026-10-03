<script setup>
import dayjs from 'dayjs'
import { computed, onMounted, ref, watch } from 'vue'

import api from '@/api'
import BannerPage from '@/components/BannerPage.vue'
import UPagination from '@/components/ui/UPagination.vue'

/*
 * 档案页: 归档/分类/标签 三合一 (提案 B)。
 * 上游的三个独立页面在这里合并为一个 Tab 页, 旧路由重定向过来。
 */

const TABS = ['时间轴', '分类', '标签']

// 支持 /archives?tab=标签 深链: 从 URL 读初始 Tab (避免引入 router 依赖, 测试更稳)
const initialTab = new URLSearchParams(window.location.search).get('tab')
const tab = ref(TABS.includes(initialTab) ? initialTab : '时间轴')

function switchTab(t) {
  tab.value = t
}

// ---- 时间轴 (原归档页) ----
const loading = ref(true)
const total = ref(0)
const archiveList = ref([])

// 一页 50 条: 归档条目很轻(只有日期和标题), 一页多放一些翻页次数少
const PAGE_SIZE = 50
const current = ref(1)
const pageCount = computed(() => Math.ceil(total.value / PAGE_SIZE))

watch(current, () => {
  getArchives()
  window.scrollTo({ behavior: 'smooth', top: 0 })
})

async function getArchives() {
  // 以前失败时 loading 永远停在 true, 页面卡在加载态;
  // resp.data 为空时直接取 .page_data 还会抛
  try {
    const resp = await api.getArchives({
      page_num: current.value,
      page_size: PAGE_SIZE,
    })
    archiveList.value = resp.data?.page_data ?? []
    total.value = resp.data?.total ?? 0
  }
  catch (err) {
    console.error(err)
  }
  finally {
    loading.value = false
  }
}

// 按年月分组: 归档页的意义就是时间轴, 平铺一长串看不出节奏
// 接口已经按发布时间倒序返回, 所以直接按出现顺序建组, 不用再排一次
const monthGroups = computed(() => {
  const groups = []
  for (const item of archiveList.value) {
    const key = dayjs(item.created_at).format('YYYY-MM')
    const last = groups[groups.length - 1]
    if (last?.key === key) {
      last.items.push(item)
      continue
    }
    groups.push({
      key,
      label: dayjs(item.created_at).format('YYYY 年 M 月'),
      items: [item],
    })
  }
  return groups
})

// ---- 分类 ----
const categoryLoading = ref(true)
const categoryList = ref([])

async function getCategorys() {
  try {
    const resp = await api.getCategorys()
    categoryList.value = resp.data ?? []
  }
  catch (err) {
    console.error(err)
  }
  finally {
    categoryLoading.value = false
  }
}

// ---- 标签 ----
const tagLoading = ref(true)
const tagList = ref([])

async function getTags() {
  try {
    const resp = await api.getTags()
    tagList.value = resp.data || []
  }
  catch (err) {
    console.error(err)
  }
  finally {
    tagLoading.value = false
  }
}

// 字号按文章数映射
const MIN_SIZE = 15
const MAX_SIZE = 30

const countRange = computed(() => {
  const counts = tagList.value.map(t => t.article_count ?? 0)
  return { min: Math.min(...counts), max: Math.max(...counts) }
})

function fontSize(tag) {
  const { min, max } = countRange.value
  if (!Number.isFinite(min) || max === min) {
    return Math.round((MIN_SIZE + MAX_SIZE) / 2)
  }
  const ratio = ((tag.article_count ?? 0) - min) / (max - min)
  return Math.round(MIN_SIZE + (MAX_SIZE - MIN_SIZE) * ratio)
}

const COLORS = [
  '#3b82f6',
  '#f97316',
  '#7c5cff',
  '#00a97f',
  '#e0508a',
  '#0e7fd4',
  '#c9971c',
  '#00a3a3',
]

function color(tag) {
  return COLORS[tag.id % COLORS.length]
}

// 切 Tab 时懒加载对应数据 (只拉一次); 深链进入时初始 Tab 的数据也要拉
const loadedTabs = new Set(['时间轴'])
function loadTabData(t) {
  if (loadedTabs.has(t)) {
    return
  }
  loadedTabs.add(t)
  if (t === '分类') {
    getCategorys()
  }
  else if (t === '标签') {
    getTags()
  }
}
watch(tab, loadTabData)

onMounted(() => {
  getArchives()
  loadTabData(tab.value)
})

onMounted(() => {
  getArchives()
})
</script>

<template>
  <!-- 骨架屏只在首屏显示, 翻页时保留旧内容, 见 article/list 里的同一处说明 -->
  <BannerPage title="档案" label="archive" :loading="loading && !archiveList.length && tab === '时间轴'" card>
    <!-- Tab 切换 -->
    <div class="mb-6 flex justify-center gap-2">
      <button
        v-for="t of TABS" :key="t"
        class="rounded-full px-5 py-1.5 text-sm transition-300"
        :class="tab === t ? 'bg-primary text-white' : 'bg-surface-soft text-muted hover:text-primary'"
        @click="switchTab(t)"
      >
        {{ t }}
      </button>
    </div>

    <!-- ===== 时间轴 ===== -->
    <div v-show="tab === '时间轴'">
      <p class="pb-5 text-lg lg:text-2xl">
        目前共计 {{ total }} 篇文章，继续加油！
      </p>

      <section v-for="group of monthGroups" :key="group.key" class="mb-7 last:mb-0">
        <h3 class="mb-3 flex items-center gap-2 text-lg font-bold">
          <span class="i-mdi:calendar-blank-outline text-primary" />
          {{ group.label }}
          <span class="text-sm text-muted font-normal">{{ group.items.length }} 篇</span>
        </h3>
        <ul class="ml-1.5 border-l-2 border-color-divider pl-6 space-y-3">
          <li v-for="item of group.items" :key="item.id" class="relative">
            <span class="absolute left-[-31px] top-2.5 h-2.5 w-2.5 rounded-full bg-primary ring-3 ring-surface" />
            <RouterLink
              :to="`/article/${item.id}`"
              class="flex flex-wrap items-baseline gap-x-3 transition-300 hover:text-primary"
            >
              <span class="text-sm text-muted">{{ dayjs(item.created_at).format('MM-DD') }}</span>
              <span class="lg:text-lg">{{ item.title }}</span>
            </RouterLink>
          </li>
        </ul>
      </section>

      <div v-if="!loading && !archiveList.length" class="py-10 text-center text-muted">
        还没有文章
      </div>

      <div v-if="tab === '时间轴' && pageCount > 1" class="mt-10 flex justify-center">
        <UPagination v-model:page="current" :page-count="pageCount" />
      </div>
    </div>

    <!-- ===== 分类 ===== -->
    <div v-show="tab === '分类'">
      <p class="pb-5 text-center text-muted">
        共 {{ categoryList.length }} 个分类
      </p>
      <ul class="grid grid-cols-1 mt-2 gap-4 lg:grid-cols-3 sm:grid-cols-2">
        <li v-for="c of categoryList" :key="c.id">
          <RouterLink
            :to="`categories/${c.id}?name=${c.name}`"
            class="group flex items-center justify-between gap-3 rounded-xl bg-surface-soft px-4 py-3 shadow-sm transition-300 hover:shadow-md hover:-translate-y-0.5"
          >
            <span class="flex items-center gap-2 truncate">
              <span class="h-3 w-3 shrink-0 rounded-full bg-primary transition-300 group-hover:bg-accent" />
              <span class="truncate text-lg group-hover:text-primary">{{ c.name }}</span>
            </span>
            <span class="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
              {{ c.article_count ?? 0 }}
            </span>
          </RouterLink>
        </li>
      </ul>

      <div v-if="!categoryLoading && !categoryList.length" class="py-10 text-center text-muted">
        还没有分类
      </div>
    </div>

    <!-- ===== 标签 ===== -->
    <div v-show="tab === '标签'">
      <p class="pb-5 text-center text-muted">
        共 {{ tagList.length }} 个标签
      </p>
      <div class="mt-2 text-center">
        <RouterLink
          v-for="t of tagList" :key="t.id" :to="`tags/${t.id}?name=${t.name}`"
          :style="{ 'font-size': `${fontSize(t)}px`, 'color': color(t) }"
          :title="`${t.name} - ${t.article_count ?? 0} 篇`"
          class="inline-block px-2 leading-11 transition-300 hover:scale-110 !hover:text-accent"
        >
          {{ t.name }}
        </RouterLink>
      </div>

      <div v-if="!tagLoading && !tagList.length" class="py-10 text-center text-muted">
        还没有标签
      </div>
    </div>
  </BannerPage>
</template>
