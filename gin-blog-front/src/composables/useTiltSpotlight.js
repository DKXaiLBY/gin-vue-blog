/**
 * 卡片聚光 + 3D 倾斜 (桌面端微交互):
 * - 鼠标位置写入 CSS 变量 --mx/--my, 供 ::after 聚光层使用
 * - 卡片随鼠标位置轻微 rotateX/rotateY (perspective 3D)
 * - 触屏/系统减少动态时完全不生效, 离开卡片自动回正
 *
 * 用法:
 *   const { bindTilt } = useTiltSpotlight()
 *   <div v-bind="bindTilt" class="tilt-card">...</div>
 *   CSS: .tilt-card::after 用 radial-gradient(圆 at var(--mx) var(--my)) 画光斑
 */
export function useTiltSpotlight(options = {}) {
  // v3.46 同屏减法: tilt 可关, 关掉后只保留聚光跟随 —— 悬停时一项主运动
  const { maxTilt = 5, tilt = true } = options

  function disabled() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
      || !window.matchMedia('(hover: hover)').matches
  }

  function onMousemove(e) {
    const el = e.currentTarget
    if (disabled()) {
      return
    }
    const rect = el.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const px = (mx / rect.width - 0.5) * 2 // -1 ~ 1
    const py = (my / rect.height - 0.5) * 2
    el.style.setProperty('--mx', `${mx}px`)
    el.style.setProperty('--my', `${my}px`)
    if (tilt) {
      el.style.transform = `perspective(900px) rotateX(${(-py * maxTilt).toFixed(2)}deg) rotateY(${(px * maxTilt).toFixed(2)}deg)`
    }
  }

  function onMouseleave(e) {
    e.currentTarget.style.transform = ''
  }

  return {
    bindTilt: {
      onMousemove,
      onMouseleave,
    },
  }
}
