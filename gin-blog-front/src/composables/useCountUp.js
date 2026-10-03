import { onBeforeUnmount, ref } from 'vue'

/**
 * 数字滚动: 目标值变化时从 0 缓动数到目标值 (ease-out cubic)。
 * 返回显示值 ref, 用法:
 *   const { shown, setTarget } = useCountUp()
 *   watch(target, setTarget)
 */
export function useCountUp(duration = 900) {
  const shown = ref(0)
  let raf = null

  function setTarget(target) {
    if (raf) {
      cancelAnimationFrame(raf)
      raf = null
    }
    const from = shown.value
    const start = performance.now()
    const step = (t) => {
      const p = Math.min((t - start) / duration, 1)
      // easeOutCubic
      const eased = 1 - (1 - p) ** 3
      shown.value = Math.round(from + (target - from) * eased)
      if (p < 1) {
        raf = requestAnimationFrame(step)
      }
      else {
        raf = null
      }
    }
    raf = requestAnimationFrame(step)
  }

  onBeforeUnmount(() => {
    if (raf) {
      cancelAnimationFrame(raf)
    }
  })

  return { shown, setTarget }
}
