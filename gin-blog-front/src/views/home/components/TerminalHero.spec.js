import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import TerminalHero from './TerminalHero.vue'

// 跳转只记不用; useRoute 供导航 guard 判断当前路径
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn().mockResolvedValue(undefined) }),
  useRoute: () => ({ path: '/' }),
}))

// 一言接口返回固定句子, fortune 命令的断言才稳定
vi.mock('@/utils', async importOriginal => ({
  ...await importOriginal(),
  getOneSentence: vi.fn().mockResolvedValue('测试一言'),
}))

async function mountTerm() {
  // jsdom 没有 matchMedia(可选链安全降级为 undefined); 桩一个"偏好减少动态效果",
  // 让开场表演走 reduced-motion 分支立即摆出最终画面, 测试不用等几秒的打字动画
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }))
  const wrapper = mount(TerminalHero)
  await vi.waitFor(() => expect(wrapper.find('.t-input').exists()).toBe(true))
  return wrapper
}

async function runCmd(wrapper, cmd) {
  const input = wrapper.find('.t-input')
  await input.setValue(cmd)
  await input.trigger('keydown', { key: 'Enter' })
  await flushPromises()
}

describe('terminalHero 命令分发', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.unstubAllGlobals()
  })

  it('开场表演结束后出现输入行和提示栏', async () => {
    const wrapper = await mountTerm()
    expect(wrapper.find('.term-hints').exists()).toBe(true)
    expect(wrapper.text()).toContain('dkx@blog')
    wrapper.unmount()
  })

  it('help 列出全部命令', async () => {
    const wrapper = await mountTerm()
    await runCmd(wrapper, 'help')
    expect(wrapper.text()).toContain('可用命令')
    expect(wrapper.text()).toContain('sudo hire-me')
    wrapper.unmount()
  })

  it('ls projects 列出项目胶囊且可点击', async () => {
    const wrapper = await mountTerm()
    await runCmd(wrapper, 'ls projects')
    const pills = wrapper.findAll('.t-pill')
    expect(pills.length).toBeGreaterThanOrEqual(4)
    expect(wrapper.text()).toContain('LoveGirl')
    // 点击胶囊走 navTo → router.push(mock), 只要不抛错即认为分发正确
    await pills[0].trigger('click')
    wrapper.unmount()
  })

  it('blog status 输出运行状态行', async () => {
    const wrapper = await mountTerm()
    await runCmd(wrapper, 'blog status')
    expect(wrapper.text()).toContain('运行中')
    wrapper.unmount()
  })

  it('whoami 输出自我介绍', async () => {
    const wrapper = await mountTerm()
    await runCmd(wrapper, 'whoami')
    expect(wrapper.text()).toContain('DKXaiLBY')
    wrapper.unmount()
  })

  it('sudo hire-me 输出打开简历提示', async () => {
    const wrapper = await mountTerm()
    await runCmd(wrapper, 'sudo hire-me')
    expect(wrapper.text()).toContain('正在打开简历页')
    wrapper.unmount()
  })

  it('fortune 输出一言', async () => {
    const wrapper = await mountTerm()
    await runCmd(wrapper, 'fortune')
    await flushPromises()
    expect(wrapper.text()).toContain('测试一言')
    wrapper.unmount()
  })

  it('cat 未知文件给出友好报错', async () => {
    const wrapper = await mountTerm()
    await runCmd(wrapper, 'cat secret.txt')
    expect(wrapper.text()).toContain('No such file or directory')
    expect(wrapper.text()).toContain('cat motto.txt')
    wrapper.unmount()
  })

  it('未知命令提示 command not found', async () => {
    const wrapper = await mountTerm()
    await runCmd(wrapper, 'rm -rf /')
    expect(wrapper.text()).toContain('command not found')
    expect(wrapper.text()).toContain('试试 help')
    wrapper.unmount()
  })

  it('clear 清空历史, 只剩输入行', async () => {
    const wrapper = await mountTerm()
    await runCmd(wrapper, 'help')
    await runCmd(wrapper, 'clear')
    expect(wrapper.text()).not.toContain('可用命令')
    expect(wrapper.find('.t-input').exists()).toBe(true)
    wrapper.unmount()
  })

  it('sudo rm -rf / 触发备份玩梗回复', async () => {
    const wrapper = await mountTerm()
    await runCmd(wrapper, 'sudo rm -rf /')
    expect(wrapper.text()).toContain('备份每天凌晨 3 点自动跑')
    wrapper.unmount()
  })
})
