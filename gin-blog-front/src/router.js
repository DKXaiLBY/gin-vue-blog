import NProgress from 'nprogress'

import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import './styles/nprogress.css'

const basicRoutes = [
  {
    name: 'Home',
    path: '/',
    component: () => import('@/views/home/index.vue'),
  },
  {
    name: 'Article',
    path: '/article/:id',
    component: () => import('@/views/article/detail/index.vue'),
  },
  {
    name: 'Archive',
    path: '/archives',
    component: () => import('@/views/discover/archive/index.vue'),
    meta: {
      title: '归档',
    },
  },
  {
    name: 'Category',
    path: '/categories',
    component: () => import('@/views/discover/category/index.vue'),
    meta: {
      title: '分类',
    },
  },
  {
    name: 'CategoryArticles',
    path: '/categories/:categoryId',
    component: () => import('@/views/article/list/index.vue'),
    meta: {
      title: '分类',
    },
  },
  {
    name: 'Tag',
    path: '/tags',
    component: () => import('@/views/discover/tag/index.vue'),
    meta: {
      title: '标签',
    },
  },
  {
    name: 'TagArticles',
    path: '/tags/:tagId',
    component: () => import('@/views/article/list/index.vue'),
    meta: {
      title: '标签',
    },
  },
  {
    name: 'Talk',
    path: '/talks',
    component: () => import('@/views/entertainment/talking/index.vue'),
    meta: {
      title: '说说',
    },
  },
  {
    // 说说详情单独一页: 评论组件按 route.params.id 取 topic_id, 沿用文章那套
    name: 'TalkDetail',
    path: '/talk/:id',
    component: () => import('@/views/entertainment/talking/detail.vue'),
    meta: {
      title: '说说',
    },
  },
  {
    name: 'Album',
    path: '/albums',
    component: () => import('@/views/entertainment/album/index.vue'),
    meta: {
      title: '相册',
    },
  },
  {
    name: 'Projects',
    path: '/projects',
    component: () => import('@/views/project/index.vue'),
    meta: {
      title: '项目',
    },
  },
  {
    name: 'Resume',
    path: '/resume',
    component: () => import('@/views/resume/index.vue'),
    meta: {
      title: '简历',
    },
  },
  {
    name: 'Timeline',
    path: '/timeline',
    component: () => import('@/views/timeline/index.vue'),
    meta: {
      title: '历程',
    },
  },
  {
    name: 'Status',
    path: '/status',
    component: () => import('@/views/status/index.vue'),
    meta: {
      title: '站点状态',
    },
  },
  {
    name: 'Annual',
    path: '/annual',
    component: () => import('@/views/annual/index.vue'),
    meta: {
      title: '年度报告',
    },
  },
  {
    name: 'Link',
    path: '/links',
    component: () => import('@/views/link/index.vue'),
    meta: {
      title: '友情链接',
    },
  },
  {
    name: 'About',
    path: '/about',
    component: () => import('@/views/about/index.vue'),
    meta: {
      title: '关于我',
    },
  },
  {
    name: 'MessageBoard',
    path: '/message',
    component: () => import('@/views/message/index.vue'),
    meta: {
      title: '留言',
    },
  },
  {
    name: 'User',
    path: '/user',
    component: () => import('@/views/user/index.vue'),
    meta: {
      title: '个人中心',
    },
  },
  {
    name: 'Notification',
    path: '/notifications',
    component: () => import('@/views/notification/index.vue'),
    meta: {
      title: '站内通知',
    },
  },
  {
    name: '404',
    path: '/404',
    component: () => import('@/views/error-page/404.vue'),
  },
  // 无匹配路由跳转 404
  {
    name: 'NotFound',
    path: '/:pathMatch(.*)*',
    redirect: '/404',
    isHidden: true,
  },
]

export const router = createRouter({
  // 静态托管（如 GitHub Pages）下直接访问子路径会 404, 故 mock 构建走 hash 路由
  history: import.meta.env.VITE_USE_HASH_ROUTER === 'true'
    ? createWebHashHistory()
    : createWebHistory(import.meta.env.VITE_PUBLIC_PATH || '/'),
  routes: basicRoutes,
  // 带 ?comment= 的跳转是站内通知定位到某条评论, 位置交给评论组件自己滚 ——
  // 这里再返回 top: 0 会把它刚滚到的位置拉回顶部(同一篇文章内点通知时尤其明显)
  scrollBehavior: to => (to.query.comment ? false : { left: 0, top: 0 }),
})

// 属性值必须带引号: meta[og:title] 这种选择器里冒号会让 querySelector 直接抛
// SyntaxError, 且异常发生在 router.afterEach 里会中断 SPA 导航 —— 页面就"点不开"了
function setMeta(attr, key, content) {
  const sel = `${attr}="${key}"`
  let el = document.head.querySelector(`meta[${sel}]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

router.afterEach((to) => {
  // 文章标题路由里没有, 由文章页自己覆写; 这里兜底路由级标题
  document.title = `${to.meta?.title ?? import.meta.env.VITE_APP_TITLE}`
  // 分享卡片与搜索摘要: 路由有 title 就覆写, 没有则保持 index.html 的站点级兜底
  if (to.meta?.title) {
    setMeta('name', 'description', `${to.meta.title} — DKXaiLBY 的个人博客`)
    setMeta('property', 'og:title', `${to.meta.title} — DKXaiLBY 的个人博客`)
  }
  NProgress.done()
})

NProgress.configure({ showSpinner: false })

// 路由组件是懒加载的, 进度条要跟着导航结束(afterEach / onError)收尾。
// 以前是 start() 之后固定 setTimeout 300ms 就 done(), 网速慢时进度条早走完了 chunk 还在下载
router.beforeEach((to, from, next) => {
  NProgress.start()
  next()
})

router.onError(() => {
  NProgress.done()
})
