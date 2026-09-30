<script setup>
import { computed, ref, watch } from 'vue'
import api from '@/api'
import siteConfig from '@/config/site'
import { useAppStore, useUserStore } from '@/store'

const { articleId, likeCount } = defineProps({
  articleId: Number,
  likeCount: Number,

})

const [userStore, appStore] = [useUserStore(), useAppStore()]

// 点赞数量
const count = ref(likeCount)
// * 监听父组件传来的 likeCount, 不能直接用 props 中的值初始化 ref 变量
watch(() => likeCount, newVal => count.value = newVal)

async function likeArticle() {
  // 判断是否登录
  if (!userStore.userId) {
    appStore.setLoginFlag(true)
    return
  }
  try {
    await api.saveLikeArticle(articleId)
    // 判断是否点赞
    if (userStore.articleLikeSet.includes(articleId)) {
      count.value--
      window.$message?.info('已取消')
    }
    else {
      count.value++
      window.$message?.success('已点赞')
    }
    // 维护全局状态中的点赞 Set
    userStore.articleLike(articleId)
  }
  catch (err) {
    console.error(err)
  }
}

// 判断当前用户是否点赞过该文章
const isLike = computed(() => userStore.articleLikeSet.includes(articleId))

// 打赏弹窗: 展示 site.js 配置的微信/支付宝收款码
const showQr = ref(false)

function closeQr() {
  showQr.value = false
}
</script>

<template>
  <div class="f-c-c space-x-4">
    <!-- 未点赞用主题色而不是灰: 灰色看着像禁用, 实际是可点的。
         已点赞换成强调色, 和站内其他"已激活"状态一致。

         底色写在静态 class 里、已点赞用 !important 覆盖, 不写成
         `isLike ? 'bg-accent' : 'bg-primary'` —— 那样只要 bg-accent 这条 CSS 没生成
         (比如加 accent token 之前启动的 dev server), 按钮就变成白字透明底, 直接消失。
         这么写最差也只是保持蓝色。!important 也免得和 bg-primary 比生成顺序 -->
    <button
      class="w-[110px] f-c-c rounded-md bg-primary py-1.5 text-sm text-white transition-300 hover:opacity-85"
      :class="isLike && '!bg-accent'"
      :aria-pressed="isLike"
      @click="likeArticle"
    >
      <span class="i-mdi:thumb-up mr-1" /> 点赞 {{ count }}
    </button>
    <!-- 打赏按钮: site.js 的 showReward 开关控制 -->
    <button
      v-if="siteConfig.showReward"
      class="w-[110px] f-c-c border-1 border-primary rounded-md py-1.5 text-sm text-primary transition-300 hover:bg-primary hover:text-white"
      @click="showQr = true"
    >
      <span class="i-mdi:qrcode mr-1" /> 打赏
    </button>
  </div>

  <!-- 打赏弹窗 -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="showQr"
        class="fixed inset-0 z-999 f-c-c bg-black/60 p-4"
        @click.self="closeQr"
      >
        <div class="relative w-full max-w-md rounded-xl bg-surface p-6 shadow-2xl">
          <button
            class="absolute right-3 top-3 f-c-c h-8 w-8 rounded-full text-muted transition-300 hover:bg-surface-soft hover:text-main"
            aria-label="关闭"
            @click="closeQr"
          >
            <span class="i-mdi:close" />
          </button>
          <h3 class="text-center text-lg font-bold">
            请作者喝杯奶茶 ☕
          </h3>
          <p class="mt-1 text-center text-xs text-muted">
            如果内容对你有帮助, 扫码请我一杯, 感谢每一份支持
          </p>
          <div class="mt-5 flex justify-center gap-6">
            <figure class="text-center">
              <img
                src="/reward/wechat.png" alt="微信收款码" loading="lazy"
                class="h-56 w-40 rounded-lg border border-divider object-contain"
              >
              <figcaption class="mt-2 flex items-center justify-center gap-1 text-sm text-muted">
                <span class="i-mdi:wechat text-green-500" /> 微信支付
              </figcaption>
            </figure>
            <figure class="text-center">
              <img
                src="/reward/alipay.jpg" alt="支付宝收款码" loading="lazy"
                class="h-56 w-40 rounded-lg border border-divider object-contain"
              >
              <figcaption class="mt-2 flex items-center justify-center gap-1 text-sm text-muted">
                <span class="i-mdi:alipay text-blue-500" /> 支付宝
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
