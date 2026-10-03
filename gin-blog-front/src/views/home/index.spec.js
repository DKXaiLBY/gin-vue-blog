import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import api from '@/api'
import HomePage from './index.vue'

vi.mock('@/api', () => ({
  default: {
    getArticles: vi.fn(),
    // 首页还拉分类胶囊和在线人数+心跳上报, mock 里给安全返回
    getCategorys: vi.fn().mockResolvedValue({ code: 0, data: [] }),
    getOnline: vi.fn().mockResolvedValue({ code: 0, data: { online: 0 } }),
    report: vi.fn().mockResolvedValue({ code: 0 }),
  },
}))

// 无限滚动组件依赖 IntersectionObserver, 测试里用桩
vi.mock('v3-infinite-loading', () => ({
  default: { name: 'InfiniteLoading', template: '<div />' },
}))

const articles = [
  { id: 1, title: '第一篇', content: '# 标题\n正文**加粗**', img: '', created_at: '2026-09-01T00:00:00Z' },
  { id: 2, title: '第二篇', content: '正文', img: '', created_at: '2026-09-02T00:00:00Z' },
]

function mountPage() {
  return mount(HomePage, {
    global: {
      stubs: {
        HomeBanner: true,
        AuthorInfo: true,
        WebsiteInfo: true,
        Announcement: true,
        TalkingCarousel: true,
        ArticleCard: true,
        AppFooter: true,
        TerminalHero: true,
        RouterLink: { template: '<a><slot /></a>' },
      },
    },
  })
}

describe('前台首页', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    api.getArticles.mockReset().mockResolvedValue({ code: 0, data: { page_data: articles, total: 2 } })
  })

  it('首屏加载文章并去掉正文里的 Markdown 记号', async () => {
    const wrapper = mountPage()
    await vi.waitFor(() => expect(wrapper.vm.articleList).toHaveLength(2))

    // params 是 reactive 对象且会被 page_num++ 改掉, 断言调用次数而不是当时的入参快照
    expect(api.getArticles).toHaveBeenCalledTimes(1)
    expect(wrapper.vm.articleList[0].content).not.toContain('#')
    expect(wrapper.vm.articleList[0].content).not.toContain('**')
    expect(wrapper.vm.params.page_num).toBe(2)
  })

  // 回归: 无限加载靠 !loading 才会继续请求, 首屏失败后 loading 停在 true
  // 就等于首页彻底不再加载文章
  it('首屏失败时 loading 复位', async () => {
    api.getArticles.mockRejectedValue(new Error('boom'))
    const wrapper = mountPage()
    await vi.waitFor(() => expect(wrapper.vm.loading).toBe(false))

    expect(wrapper.vm.articleList).toEqual([])
  })

  it('后端返回空数据时不抛异常', async () => {
    api.getArticles.mockResolvedValue({ code: 0, data: null })
    const wrapper = mountPage()
    await vi.waitFor(() => expect(wrapper.vm.loading).toBe(false))

    expect(wrapper.vm.articleList).toEqual([])
  })

  // 首页已从无限滚动改为「加载更多」按钮, loadMore 守卫 loading/finished
  it('加载更多: 有数据时追加并翻页, 不足一页标记完成', async () => {
    const wrapper = mountPage()
    await vi.waitFor(() => expect(wrapper.vm.articleList).toHaveLength(2))

    // mock 首页只有 2 条(<8), 首屏已把 finished 置真; 模拟还有下一页的场景
    wrapper.vm.finished = false
    api.getArticles.mockResolvedValue({ code: 0, data: { page_data: [{ id: 3, title: '第三篇', content: '正文' }], total: 3 } })
    await wrapper.vm.loadMore()

    expect(wrapper.vm.articleList).toHaveLength(3)
    expect(wrapper.vm.params.page_num).toBe(3)
    expect(wrapper.vm.finished).toBe(true)
  })

  // loadMore 在首屏 loading 期间直接 return, 不会重复请求第一页
  it('加载更多在首屏还没回来时先等它, 不重复请求第一页', async () => {
    let resolveFirst
    api.getArticles.mockReturnValueOnce(new Promise((r) => {
      resolveFirst = () => r({ code: 0, data: { page_data: articles, total: 2 } })
    }))

    const wrapper = mountPage()
    api.getArticles.mockResolvedValue({ code: 0, data: { page_data: [{ id: 3, title: '第三篇', content: '正文' }], total: 3 } })

    await wrapper.vm.loadMore() // 首屏 loading 中, 应被守卫直接跳过
    expect(api.getArticles).toHaveBeenCalledTimes(1)

    resolveFirst()
    await vi.waitFor(() => expect(wrapper.vm.articleList).toHaveLength(2))

    wrapper.vm.finished = false // mock 首页不足一页已置真, 模拟还有下一页
    await wrapper.vm.loadMore()
    // 第一页 + 第二页, 各一次
    expect(api.getArticles).toHaveBeenCalledTimes(2)
    expect(wrapper.vm.articleList).toHaveLength(3)
  })

  // 一屏能放下 2~3 张卡片, 一页 5 条会频繁触发请求
  it('一页取 8 条', () => {
    const wrapper = mountPage()
    expect(wrapper.vm.params.page_size).toBe(8)
  })

  it('加载更多: 空数据标记完成, 失败时 loading 复位且不标记完成', async () => {
    const wrapper = mountPage()
    await vi.waitFor(() => expect(wrapper.vm.articleList).toHaveLength(2))

    api.getArticles.mockResolvedValue({ code: 0, data: { page_data: [], total: 2 } })
    await wrapper.vm.loadMore()
    expect(wrapper.vm.finished).toBe(true)

    // finished 后 loadMore 直接短路, 不会再发请求
    api.getArticles.mockRejectedValue(new Error('boom'))
    await wrapper.vm.loadMore()
    expect(wrapper.vm.loading).toBe(false)
  })

  it('加载更多: 返回 null 也算加载完成, 不抛异常', async () => {
    const wrapper = mountPage()
    await vi.waitFor(() => expect(wrapper.vm.articleList).toHaveLength(2))

    wrapper.vm.finished = false
    api.getArticles.mockResolvedValue({ code: 0, data: null })
    await wrapper.vm.loadMore()

    expect(wrapper.vm.finished).toBe(true)
    expect(wrapper.vm.loading).toBe(false)
  })
})
