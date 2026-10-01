<script setup>
import { computed, ref } from 'vue'

import timelineData from '@/config/timeline'

/**
 * 星图历程页: 18+ 条编年史渲染成一张横向"开发地铁图"。
 * 线路渐变是纯装饰, 圆点颜色仍按 type 区分(与 config/timeline.js 注释一致);
 * 桌面端按住拖拽横向滑动, 移动端媒体查询自动转纵向。
 */

// 圆点/边框颜色按事件类型区分
const typeColors = {
  study: 'var(--c-primary)',
  project: '#34d399',
  award: 'var(--c-accent)',
  other: '#9ca3af',
}

const stations = timelineData

// 默认选中"你在这"那一站, 没标 now 就落在最后一站
const activeIdx = ref(Math.max(stations.findIndex(s => s.now), stations.length - 1))
const active = computed(() => stations[activeIdx.value])

// 鼠标拖拽横向滑动(触屏走原生滚动); 拖过的距离超过阈值时吞掉紧跟的 click, 避免拖完误选站
const trackEl = ref(null)
let dragging = false
let startX = 0
let startLeft = 0
let moved = 0

function onDown(e) {
  dragging = true
  moved = 0
  startX = e.pageX
  startLeft = trackEl.value.scrollLeft
}

function onMove(e) {
  if (!dragging) {
    return
  }
  const dx = e.pageX - startX
  moved = Math.max(moved, Math.abs(dx))
  trackEl.value.scrollLeft = startLeft - dx
}

function onUp() {
  dragging = false
}

function select(i) {
  if (moved > 6) {
    return
  }
  activeIdx.value = i
}
</script>

<template>
  <!-- w-full 必须显式: 父级是 flex 容器, mx-auto 会放弃 stretch 改用 fit-content,
       星图的 min-width:max-content 会把宽度顶到 max-width 上限, 视口 <1100 就横向溢出 -->
  <div class="mx-auto w-full max-w-[1100px] px-4 pb-10 pt-24">
    <header class="mb-8 text-center">
      <h1 class="text-3xl font-bold">
        我的历程
      </h1>
      <p class="mt-2 text-muted">
        一张「开发地铁图」: {{ stations.length }} 站, 从 2025.09 走到现在
      </p>
    </header>

    <!-- 星图: 桌面按住拖拽, 移动端转纵向 -->
    <div
      ref="trackEl"
      class="[scrollbar-width:none] select-none overflow-x-auto rounded-xl bg-surface shadow-md [&::-webkit-scrollbar]:hidden"
      @mousedown="onDown" @mousemove="onMove" @mouseup="onUp" @mouseleave="onUp"
    >
      <div class="starmap" :class="{ dragging }">
        <div class="sline" />
        <button
          v-for="(s, i) in stations" :key="s.date + s.title"
          class="stop" :class="{ major: s.major, now: s.now, active: i === activeIdx }"
          :style="{ '--dot': typeColors[s.type] ?? typeColors.other }"
          type="button" @click="select(i)"
        >
          <span class="dot" />
          <span class="body">
            <span class="d">{{ s.date }}</span>
            <span class="n">{{ s.title }}</span>
          </span>
        </button>
      </div>
    </div>
    <p class="mt-3 text-center text-xs text-muted">
      ⬅ 按住可拖动 ➡ · 点击站点查看详情
    </p>

    <!-- 图例 -->
    <div class="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-muted">
      <span class="inline-flex items-center gap-1.5"><i class="inline-block h-2.5 w-2.5 rounded-full" :style="{ background: typeColors.study }" /> 学习</span>
      <span class="inline-flex items-center gap-1.5"><i class="inline-block h-2.5 w-2.5 rounded-full" :style="{ background: typeColors.project }" /> 项目</span>
      <span class="inline-flex items-center gap-1.5"><i class="inline-block h-2.5 w-2.5 rounded-full" :style="{ background: typeColors.other }" /> 其他</span>
      <span>大站 = 关键里程碑 · 琥珀色发光 = 你在这</span>
    </div>

    <!-- 站点详情 -->
    <Transition name="station-fade" mode="out-in">
      <div :key="activeIdx" class="card-view mt-5 flex items-start gap-4 p-5">
        <span class="mt-2 inline-block h-3 w-3 shrink-0 rounded-full" :style="{ background: typeColors[active.type] ?? typeColors.other }" />
        <div>
          <p class="text-sm text-muted font-mono">
            {{ active.date }}
            <span v-if="active.now" class="ml-2 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs text-amber-500">你在这</span>
          </p>
          <h2 class="mt-1 text-lg font-bold">
            {{ active.title }}
          </h2>
          <p class="mt-2 text-sm text-muted leading-6">
            {{ active.desc }}
          </p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.starmap {
  position: relative;
  display: flex;
  min-width: max-content;
  padding: 44px 36px 20px;
  cursor: grab;
}

.starmap.dragging {
  cursor: grabbing;
}

/* 线路: 多色渐变, 纯装饰 */
.sline {
  position: absolute;
  left: 36px;
  right: 36px;
  top: 51px;
  height: 4px;
  border-radius: 2px;
  background: linear-gradient(90deg, #6366f1, #ec4899, #34d399, #fbbf24, #818cf8);
}

.stop {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 128px;
  padding: 0 6px;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  color: inherit;
}

.stop .body {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stop .dot {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: var(--c-surface);
  border: 3px solid var(--dot);
  margin-bottom: 10px;
  transition: transform 0.15s, box-shadow 0.15s;
}

.stop:hover .dot,
.stop.active .dot {
  transform: scale(1.4);
}

.stop.active .dot {
  box-shadow: 0 0 0 5px rgb(129 140 248 / 25%);
}

.stop.major .dot {
  width: 17px;
  height: 17px;
  border-width: 4px;
}

/* "你在这": 琥珀发光 */
.stop.now .dot {
  border-color: #fbbf24;
  box-shadow: 0 0 12px rgb(251 191 36 / 80%);
}

.stop .d {
  font-size: 10px;
  color: var(--c-text-muted);
  font-family: Consolas, monospace;
}

.stop .n {
  font-size: 12px;
  font-weight: bold;
  color: var(--c-text);
  margin-top: 2px;
  max-width: 118px;
  line-height: 1.4;
}

.stop.active .n {
  color: var(--c-primary);
}

/* 详情卡切换动画 */
.station-fade-enter-active,
.station-fade-leave-active {
  transition: opacity 0.18s, transform 0.18s;
}

.station-fade-enter-from,
.station-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

/* 平板以下(含 iPad 竖屏 768): 地铁图转纵向, 线路立在左侧。
   断点取 1023 而非 767: 768~1023 区间横向布局会把容器撑出视口 */
@media (max-width: 1023px) {
  .starmap {
    flex-direction: column;
    gap: 22px;
    min-width: 0;
    padding: 20px 16px 20px 20px;
    cursor: default;
  }

  .sline {
    left: 26px;
    right: auto;
    top: 20px;
    bottom: 20px;
    width: 4px;
    height: auto;
    background: linear-gradient(180deg, #6366f1, #ec4899, #34d399, #fbbf24, #818cf8);
  }

  .stop {
    flex-direction: row;
    align-items: flex-start;
    gap: 12px;
    min-width: 0;
    text-align: left;
  }

  .stop .body {
    align-items: flex-start;
  }

  .stop .dot {
    margin: 3px 0 0;
    flex-shrink: 0;
  }

  .stop .n {
    max-width: none;
  }
}
</style>
