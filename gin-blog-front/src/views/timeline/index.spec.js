import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import timelineData from '@/config/timeline'
import TimelinePage from './index.vue'

async function mountPage() {
  const wrapper = mount(TimelinePage, {
    global: {
      stubs: {
        RouterLink: { props: ['to'], template: '<a><slot /></a>' },
      },
    },
  })
  await flushPromises()
  return wrapper
}

describe('星图历程页', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('渲染全部站点, 数量与配置一致', async () => {
    const wrapper = await mountPage()
    expect(wrapper.findAll('.stop')).toHaveLength(timelineData.length)
  })

  it('默认选中「你在这」的站点, 没有标记时选中最后一站', async () => {
    const wrapper = await mountPage()
    const active = wrapper.find('.stop.active .n').text()
    const nowItem = timelineData.find(s => s.now)
    expect(active).toBe(nowItem ? nowItem.title : timelineData[timelineData.length - 1].title)
  })

  it('点击站点切换激活态和详情卡', async () => {
    const wrapper = await mountPage()
    const target = wrapper.findAll('.stop').find(s => s.text().includes('连连看'))
    await target.trigger('click')
    await flushPromises()

    expect(target.classes()).toContain('active')
    // 详情卡显示该里程碑的日期与描述
    const card = wrapper.find('.card-view')
    expect(card.text()).toContain(timelineData.find(s => s.title.includes('连连看')).date)
  })

  it('大站渲染 major 类名, 当前站渲染 now 类名', async () => {
    const wrapper = await mountPage()
    const majors = timelineData.filter(s => s.major).length
    const nows = timelineData.filter(s => s.now).length
    expect(wrapper.findAll('.stop.major')).toHaveLength(majors)
    expect(wrapper.findAll('.stop.now')).toHaveLength(nows)
  })

  it('拖拽标记超过阈值时吞掉 click, 不误选站点', async () => {
    const wrapper = await mountPage()
    const track = wrapper.find('.overflow-x-auto')
    const before = wrapper.find('.stop.active .n').text()

    // jsdom 的 MouseEvent.pageX 是恒 0 的原型只读 getter, VTU 的属性注入覆盖不了;
    // 用 defineProperty 强行遮蔽派发, 模拟一次真实的按下-拖动-松开
    const fire = (type, pageX) => {
      const ev = new MouseEvent(type, { bubbles: true })
      Object.defineProperty(ev, 'pageX', { value: pageX })
      track.element.dispatchEvent(ev)
    }
    fire('mousedown', 300)
    fire('mousemove', 100)
    fire('mouseup')

    // 拖过的距离超过阈值, 紧跟的 click 应被吞掉
    const target = wrapper.findAll('.stop').find(s => s.text().includes('连连看'))
    await target.trigger('click')
    await flushPromises()

    expect(wrapper.find('.stop.active .n').text()).toBe(before)
  })
})
