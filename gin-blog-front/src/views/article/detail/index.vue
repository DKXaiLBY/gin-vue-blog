<script setup>
import { useWindowScroll, useWindowSize } from '@vueuse/core'
import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import go from 'highlight.js/lib/languages/go'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import { marked } from 'marked'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'

import Comment from '@/components/comment/Comment.vue'
import GiscusComment from '@/components/GiscusComment.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import ULightbox from '@/components/ui/ULightbox.vue'
import { useAppStore } from '@/store'
import { convertImgUrl, stripMarkdown } from '@/utils'
import { addCopyButtons } from '@/utils/code-block'
import { typesetMath } from '@/utils/mathjax'
import BannerInfo from './components/BannerInfo.vue'
import Catalogue from './components/Catalogue.vue'
import Copyright from './components/Copyright.vue'
import Forward from './components/Forward.vue'
import LastNext from './components/LastNext.vue'

import LatestList from './components/LatestList.vue'
import Recommend from './components/Recommend.vue'

import Reward from './components/Reward.vue'
import 'highlight.js/styles/a11y-dark.css'

hljs.registerLanguage('go', go)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('json', json)
hljs.registerLanguage('javascript', javascript)

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const data = ref({
  id: 0,
  title: '',
  content: '',
  created_at: '',
  updated_at: '',
  like_count: 0,
  view_count: 0,
  comment_count: 0,
  img: '',
  newest_articles: [],
  tags: [],
  category: {},
  next_article: {},
  last_article: {},
  recommend_articles: [],
})

// 键盘翻页监听: 组件挂载即注册, 卸载时移除 (同时兼容 keep-alive 场景靠路由 key 重建)
onMounted(() => window.addEventListener('keydown', onKeyNav))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeyNav))

// 文章内容
const previewRef = ref(null)
const loading = ref(true)

// 灯箱: 当前放大显示的图片地址, 空串 = 关闭
const lightboxSrc = ref('')

// 正文图片点击放大 (事件委托, v-html 渲染出来的 img 也能接住)
function onPreviewClick(e) {
  const img = e.target.closest('img')
  if (img?.src) {
    lightboxSrc.value = img.src
  }
}

// 键盘 ← → 翻上一篇/下一篇; 浮层(灯箱/收款码/登录/搜索)开着时、输入控件聚焦时、
// IME 组合中都不抢按键
function onKeyNav(e) {
  if (lightboxSrc.value || e.ctrlKey || e.metaKey || e.altKey || e.isComposing) {
    return
  }
  const tag = e.target?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target?.isContentEditable) {
    return
  }
  if (appStore.searchFlag || appStore.loginFlag || appStore.registerFlag) {
    return
  }
  // 任意全屏浮层开着 (收款码/灯箱) 时不翻页
  if (document.querySelector('[data-overlay-open="true"]')) {
    return
  }
  const go = a => a?.id && router.push(`/article/${a.id}`)
  if (e.key === 'ArrowLeft') {
    go(data.value.last_article)
  }
  else if (e.key === 'ArrowRight') {
    go(data.value.next_article)
  }
}

// 分享卡片 SEO: 用文章真实标题/摘要覆写站点级兜底
function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function updateShareMeta(rawMd) {
  const title = `${data.value.title} — DKXaiLBY 的个人博客`
  document.title = title
  setMeta('name', 'description', stripMarkdown(rawMd).slice(0, 120))
  setMeta('property', 'og:title', title)
}

// ---- 上次读到哪里: 进度按文章 id 存本地, 再次打开弹出「继续阅读」 ----
const RESUME_KEY = 'dkx-read-progress'
const resumePercent = ref(0)

function loadResume() {
  try {
    const all = JSON.parse(localStorage.getItem(RESUME_KEY) || '{}')
    const saved = all[route.params.id]
    // 10%~90% 之间才值得提示: 太开头没必要, 快读完的提示反而烦
    if (saved && saved.percent >= 10 && saved.percent <= 90 && saved.title === data.value.title) {
      resumePercent.value = saved.percent
    }
  }
  catch { /* 本地存储被禁就当没有 */ }
}

function saveResume() {
  if (!previewRef.value || !data.value.id) {
    return
  }
  const el = previewRef.value
  const total = el.getBoundingClientRect().height - window.innerHeight
  if (total <= 0) {
    return
  }
  const percent = Math.min(100, Math.max(0, Math.round((-el.getBoundingClientRect().top) / total * 100)))
  try {
    const all = JSON.parse(localStorage.getItem(RESUME_KEY) || '{}')
    // 只保留最近 20 篇的进度, 防止无限膨胀
    const entries = Object.entries(all).sort((a, b) => b[1].ts - a[1].ts).slice(0, 19)
    all[route.params.id] = { percent, title: data.value.title, ts: Date.now() }
    const pruned = Object.fromEntries([...entries, [route.params.id, all[route.params.id]]])
    localStorage.setItem(RESUME_KEY, JSON.stringify(pruned))
  }
  catch { /* 存储被禁随缘 */ }
}

function resumeReading() {
  const el = previewRef.value
  if (el) {
    const target = el.getBoundingClientRect().top + window.scrollY + (el.getBoundingClientRect().height * resumePercent.value / 100) - 120
    window.scrollTo({ top: target, behavior: 'smooth' })
  }
  resumePercent.value = 0
}

let resumeSaveTimer = null
// 滚动节流保存进度
function onScrollSave() {
  clearTimeout(resumeSaveTimer)
  resumeSaveTimer = setTimeout(saveResume, 800)
}

onMounted(() => {
  window.addEventListener('scroll', onScrollSave, { passive: true })
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScrollSave)
  clearTimeout(resumeSaveTimer)
})

onMounted(async () => {
  try {
    const resp = await api.getArticleDetail(route.params.id)
    if (!resp.data) {
      return
    }
    // 后端这些字段可能是 null(未分类、没有上一篇、没有推荐), 子组件里直接取 .length / .name,
    // 所以在这里统一退化成默认值, 而不是把 resp.data 整个盖上去
    data.value = {
      ...data.value,
      ...resp.data,
      tags: resp.data.tags ?? [],
      newest_articles: resp.data.newest_articles ?? [],
      recommend_articles: resp.data.recommend_articles ?? [],
      category: resp.data.category ?? {},
      last_article: resp.data.last_article ?? {},
      next_article: resp.data.next_article ?? {},
      // marked 解析 markdown 文本, 正文为空时不能直接丢给 marked
      content: await marked.parse(resp.data.content ?? '', { async: true }),
    }
    // 摘要取解析前的原始 markdown, stripMarkdown 才按 markdown 语义剥干净
    updateShareMeta(resp.data.content ?? '')
    // 检查有没有上次阅读进度
    loadResume()
    await nextTick()
    // highlight.js 代码高亮
    document.querySelectorAll('pre code').forEach(el => hljs.highlightElement(el))
    // 代码块加「复制」按钮
    addCopyButtons(previewRef.value)
    // 正文里有公式才加载 MathJax
    await typesetMath(data.value.content)
  }
  catch (err) {
    console.error(err)
  }
  finally {
    loading.value = false
  }
})

// 阅读进度: 顶部细线, 按滚动位置占可滚动高度的比例
const { y } = useWindowScroll()
const { height: windowHeight } = useWindowSize()
const readProgress = computed(() => {
  // y 必须在提前 return 之前读: 首屏正文还没渲染完时页面撑不出滚动条,
  // 一旦先 return 就没把 y 记成依赖, 之后滚动也不会重算, 进度条会永远停在 0
  const scrolled = y.value
  const total = document.documentElement.scrollHeight - windowHeight.value
  if (total <= 0) {
    return 0
  }
  return Math.min(100, Math.max(0, (scrolled / total) * 100))
})

// 太久没更新的文章给个提示: 技术文章过期得快, 免得读者照着老内容踩坑
const STALE_DAYS = 90
const staleDays = computed(() => {
  if (!data.value.updated_at) {
    return 0
  }
  const days = Math.floor((Date.now() - new Date(data.value.updated_at).getTime()) / 86400000)
  return days >= STALE_DAYS ? days : 0
})

const styleVal = computed(() =>
  data.value.img
    ? `background: url('${convertImgUrl(data.value.img)}') center center / cover no-repeat;`
    : 'background: rgba(0,0,0,0.1) center center / cover no-repeat;',
)
</script>

<template>
  <div>
    <!-- 阅读进度 -->
    <div
      class="fixed inset-x-0 top-0 z-999 h-0.5 bg-primary"
      :style="{ width: `${readProgress}%`, transition: 'width .1s linear' }"
    />
    <!-- 头部 -->
    <div :style="styleVal" class="banner-fade-down absolute inset-x-0 top-0 h-[360px] f-c-c lg:h-[400px]">
      <BannerInfo v-if="!loading" :article="data" />
    </div>
    <!-- 上次读到哪里 -->
    <Transition name="fade">
      <div
        v-if="resumePercent"
        class="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full bg-surface px-5 py-2.5 text-sm shadow-xl ring-1 ring-line"
      >
        <span class="i-mdi:book-open-page-variant text-primary" />
        上次读到 {{ resumePercent }}%
        <button class="font-bold text-primary" @click="resumeReading">
          继续阅读
        </button>
        <button class="text-muted transition-300 hover:text-main" aria-label="关闭" @click="resumePercent = 0">
          <span class="i-mdi:close" />
        </button>
      </div>
    </Transition>
    <!-- 主体内容 -->
    <main class="flex-1">
      <div class="card-fade-up grid grid-cols-12 mx-auto mb-3 mt-[380px] gap-4 px-1 lg:mt-[440px] lg:max-w-[1200px]">
        <!-- 文章主体 -->
        <div class="card-view col-span-12 mx-2 pt-7 lg:col-span-9 lg:mx-0">
          <!-- 文章内容 -->
          <!-- 老文章提示 -->
          <div
            v-if="!loading && staleDays"
            class="mb-5 border-l-4 border-#f0ad4e rounded bg-#f0ad4e/10 px-4 py-2 text-sm lg:mx-10"
          >
            本文最后更新于 {{ staleDays }} 天前，部分内容可能已经过时。
          </div>
          <article
            ref="previewRef"
            class="max-w-none prose prose-truegray lg:mx-10 dark:prose-invert"
            @click="onPreviewClick"
            v-html="data.content"
          />
          <!-- 图片灯箱 -->
          <ULightbox :src="lightboxSrc" @close="lightboxSrc = ''" />
          <!-- 版权声明 -->
          <Copyright class="my-5 lg:mx-5" />
          <!-- 标签、转发 -->
          <Forward :tag-list="data.tags" class="mb-12 lg:mx-5" />
          <!-- 点赞、打赏 -->
          <Reward
            :article-id="data.id"
            :like-count="data.like_count"
            class="mb-10"
          />
          <!-- 上一篇、下一篇 -->
          <LastNext
            :last-article="data.last_article"
            :next-article="data.next_article"
            class="lg:mx-5"
          />
          <!-- 推荐文章 -->
          <Recommend
            :recommend-list="data.recommend_articles"
            class="mt-7 lg:mx-5"
          />
          <!-- 分隔线 -->
          <hr class="my-10 border-2 border-color-divider border-dashed lg:mx-5">
          <!-- 文章评论 -->
          <Comment :type="1" class="lg:mx-5" />
          <!-- giscus 评论 (site.js 配置后生效) -->
          <GiscusComment class="lg:mx-5" />
        </div>
        <!-- 文章侧边栏 -->
        <div class="col-span-0 lg:col-span-3">
          <div class="sticky top-5 hidden lg:block space-y-4">
            <!-- 目录 -->
            <!-- TODO: v-if 的方法不太好, 想办法解决父组件接口获取数据, 子组件渲染问题 -->
            <Catalogue v-if="!loading" :preview-ref="previewRef" />
            <!-- 最新文章 -->
            <LatestList :article-list="data.newest_articles" />
          </div>
        </div>
      </div>
    </main>
    <!-- 底部 -->
    <footer>
      <AppFooter />
    </footer>
  </div>
</template>

<style scoped>
/* v-html 里的正文图片可点击放大, 给个可点击的暗示 */
article.prose :deep(img) {
  cursor: zoom-in;
}

/* 继续阅读提示条 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s, transform 0.25s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 12px);
}
</style>
