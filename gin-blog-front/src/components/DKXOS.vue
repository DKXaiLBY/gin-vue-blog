<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { storeToRefs } from 'pinia'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'

import { useAppStore } from '@/store'

/**
 * DKX OS 彩蛋: 全屏"电脑桌面"世界观 (design-gallery 概念一的轻量版)。
 * 入口: 终端命令 boot dkx-os。图标 = 页面入口, 关于本机窗口可拖动, 任务栏关机退出。
 * 正常浏览完全无感知, 移动端单击图标即打开(无双击语义)。
 */

dayjs.extend(duration)

const emit = defineEmits(['exit'])
const router = useRouter()
const { blogConfig, articleCount, viewCount, isMobile } = storeToRefs(useAppStore())

const ICONS = [
  { label: 'LoveGirl.apk', icon: '💕', to: '/projects' },
  { label: '番茄专注.exe', icon: '🍅', to: '/projects' },
  { label: '博客.lnk', icon: '📝', to: '/' },
  { label: '说说.txt', icon: '💬', to: '/talks' },
  { label: '简历.pdf', icon: '📄', to: '/resume' },
  { label: '历程.map', icon: '🗺️', to: '/timeline' },
]

const winPos = ref({ x: 60, y: 90 })
const winVisible = ref(false)
const now = ref(dayjs())
let clockTimer = null
let dragging = false
let dragOff = { x: 0, y: 0 }

const uptime = (() => {
  const ct = dayjs(blogConfig.value?.website_createtime ?? '')
  return ct.isValid() ? Math.floor(dayjs.duration(dayjs().diff(ct)).asDays()) : 0
})()

function openIcon(item) {
  winVisible.value = false
  router.push(item.to)
  emit('exit')
}

function openAbout() {
  // 窗口出现在桌面中央偏上, 移动端窄屏时收进来
  const maxX = Math.max(window.innerWidth - 380, 12)
  winPos.value = { x: Math.min(120, maxX), y: 70 }
  winVisible.value = true
}

function onWinDown(e) {
  dragging = true
  dragOff = { x: e.clientX - winPos.value.x, y: e.clientY - winPos.value.y }
}

function onWinMove(e) {
  if (!dragging) {
    return
  }
  winPos.value = {
    x: Math.min(Math.max(e.clientX - dragOff.x, 0), window.innerWidth - 200),
    y: Math.min(Math.max(e.clientY - dragOff.y, 0), window.innerHeight - 120),
  }
}

function onWinUp() {
  dragging = false
}

function shutdown() {
  emit('exit')
}

function onKey(e) {
  if (e.key === 'Escape') {
    shutdown()
  }
}

onMounted(() => {
  clockTimer = setInterval(() => {
    now.value = dayjs()
  }, 1000)
  window.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  clearInterval(clockTimer)
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <Teleport to="body">
    <div class="os" role="dialog" aria-label="DKX OS 桌面彩蛋, Esc 或关机退出">
      <!-- 桌面: 靛紫渐变壁纸 + 光斑 -->
      <div class="os-wallpaper">
        <div class="os-glow os-glow-a" />
        <div class="os-glow os-glow-b" />

        <!-- 桌面图标: 移动端单击 / 桌面端双击打开, 单击选中 -->
        <div class="os-icons">
          <button
            v-for="item in ICONS" :key="item.label"
            class="os-icon" type="button"
            @click="isMobile && openIcon(item)"
            @dblclick="!isMobile && openIcon(item)"
          >
            <span class="os-icon-face">{{ item.icon }}</span>
            <span class="os-icon-label">{{ item.label }}</span>
          </button>
          <button class="os-icon" type="button" @click="openAbout">
            <span class="os-icon-face">🖥️</span>
            <span class="os-icon-label">关于本机</span>
          </button>
        </div>

        <!-- 可拖动的「关于本机」窗口 -->
        <div
          v-if="winVisible"
          class="os-window"
          :style="{ left: `${winPos.x}px`, top: `${winPos.y}px` }"
        >
          <div class="os-window-bar" @mousedown="onWinDown" @mousemove="onWinMove" @mouseup="onWinUp" @mouseleave="onWinUp">
            <i /><i /><i />
            <span>关于本机 — dkx@blog</span>
            <button class="os-window-close" type="button" aria-label="关闭窗口" @click.stop="winVisible = false">×</button>
          </div>
          <div class="os-window-body">
            <img :src="'/avatar.png'" alt="头像" class="os-avatar">
            <div class="os-spec">
              <p><span class="os-k">host</span>DKXaiLBY 的博客</p>
              <p><span class="os-k">os</span>DKX OS v3.40</p>
              <p><span class="os-k">uptime</span>已运行 {{ uptime }} 天</p>
              <p><span class="os-k">articles</span>{{ articleCount }} 篇</p>
              <p><span class="os-k">visits</span>{{ viewCount }}</p>
              <p><span class="os-k">stack</span>Vue3 + Gin + Docker</p>
              <p class="os-motto">把开源项目吃透、改造成自己的。</p>
            </div>
          </div>
        </div>

        <!-- 任务栏 -->
        <div class="os-taskbar">
          <span class="os-start">🚀 DKX OS</span>
          <span class="os-clock">{{ now.format('YYYY-MM-DD HH:mm:ss') }}</span>
          <button class="os-shutdown" type="button" @click="shutdown">
            ⏻ 关机
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.os {
  position: fixed;
  inset: 0;
  z-index: 999;
}

.os-wallpaper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background:
    radial-gradient(900px 500px at 80% -10%, rgb(99 102 241 / 30%), transparent),
    radial-gradient(700px 420px at 0% 110%, rgb(236 72 153 / 18%), transparent),
    linear-gradient(160deg, #14162b, #0d0e1a);
  font-family: 'Microsoft YaHei', system-ui, sans-serif;
}

.os-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  pointer-events: none;
}

.os-glow-a {
  right: -80px;
  top: -80px;
  width: 320px;
  height: 320px;
  background: rgb(129 140 248 / 25%);
}

.os-glow-b {
  left: -60px;
  bottom: 40px;
  width: 260px;
  height: 260px;
  background: rgb(244 114 182 / 15%);
}

.os-icons {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  gap: 14px;
  align-content: flex-start;
  padding: 22px;
  height: calc(100% - 90px);
}

.os-icon {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  width: 84px;
  padding: 8px 4px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: none;
  cursor: pointer;
}

.os-icon:hover {
  border-color: rgb(129 140 248 / 45%);
  background: rgb(129 140 248 / 12%);
}

.os-icon-face {
  font-size: 34px;
  line-height: 1.2;
}

.os-icon-label {
  font-size: 12px;
  color: #dfe3f5;
  text-shadow: 0 1px 4px rgb(0 0 0 / 60%);
  word-break: break-all;
}

.os-window {
  position: absolute;
  width: 380px;
  max-width: calc(100vw - 24px);
  border: 1px solid #3b4470;
  border-radius: 12px;
  overflow: hidden;
  background: #101223f2;
  box-shadow: 0 24px 70px rgb(0 0 0 / 55%);
}

.os-window-bar {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 9px 12px;
  background: #1a1e36;
  border-bottom: 1px solid #262c4a;
  cursor: grab;
  user-select: none;
}

.os-window-bar:active {
  cursor: grabbing;
}

.os-window-bar i {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.os-window-bar i:nth-child(1) { background: #ff5f57; }
.os-window-bar i:nth-child(2) { background: #febc2e; }
.os-window-bar i:nth-child(3) { background: #28c840; }

.os-window-bar span {
  margin-left: 8px;
  font-size: 12px;
  color: #9aa3c7;
}

.os-window-close {
  margin-left: auto;
  border: none;
  color: #9aa3c7;
  font-size: 15px;
  cursor: pointer;
  background: none;
}

.os-window-body {
  display: flex;
  gap: 16px;
  padding: 16px;
  font-family: Consolas, monospace;
  font-size: 12.5px;
}

.os-avatar {
  flex-shrink: 0;
  width: 84px;
  height: 84px;
  border-radius: 14px;
  object-fit: cover;
}

.os-spec p {
  margin: 2px 0;
  color: #c9d2f2;
}

.os-k {
  display: inline-block;
  width: 74px;
  color: #818cf8;
}

.os-motto {
  margin-top: 6px !important;
  color: #8b94ad !important;
}

.os-taskbar {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  gap: 14px;
  align-items: center;
  height: 42px;
  padding: 0 16px;
  background: #0c0e1ce8;
  border-top: 1px solid #262c4a;
  backdrop-filter: blur(8px);
  font-size: 12px;
  color: #9aa3c7;
}

.os-start {
  font-weight: bold;
  color: #aeb8ff;
}

.os-clock {
  margin-left: auto;
  font-family: Consolas, monospace;
}

.os-shutdown {
  padding: 4px 12px;
  border: 1px solid #3b4470;
  border-radius: 8px;
  color: #dfe3f5;
  cursor: pointer;
  background: none;
}

.os-shutdown:hover {
  border-color: #818cf8;
  color: #aeb8ff;
}
</style>
