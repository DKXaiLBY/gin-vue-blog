<script setup>
import { ref } from 'vue'

import BannerPage from '@/components/BannerPage.vue'
import { useAppStore } from '@/store'

/**
 * 联系我: 站内联系方式集中在一个地方。
 * QQ 点击复制 (wpa 临时会话依赖对方 QQ 设置, 不可靠)。
 */

const blogConfig = useAppStore().blogConfig

const copyState = ref('') // copied | fallback | ''

async function copyQQ() {
  const qq = blogConfig.qq
  if (!qq) {
    return
  }
  try {
    await navigator.clipboard.writeText(qq)
    copyState.value = 'copied'
    window.$message?.success(`QQ 号 ${qq} 已复制，去 QQ 搜索添加吧`)
  }
  catch {
    copyState.value = 'fallback'
    window.$message?.info(`我的 QQ：${qq}`)
  }
}

const year = new Date().getFullYear()
</script>

<template>
  <BannerPage label="contact" title="联系我" card>
    <div class="mx-auto max-w-xl space-y-5">
      <!-- 终端风联系卡 -->
      <div class="overflow-hidden border border-line rounded-xl bg-[#0b0d14] text-sm font-mono shadow-md">
        <div class="flex items-center gap-1.5 border-b border-[#262c4a] bg-[#1a1e36] px-4 py-2.5">
          <i class="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" /><i class="h-2.5 w-2.5 rounded-full bg-[#febc2e]" /><i class="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span class="ml-2 text-xs text-[#9aa3c7]">contact — dkx@blog</span>
        </div>
        <div class="p-5 text-[#9ee6a0] space-y-3">
          <p><span class="text-[#818cf8]">dkx@blog:~$</span> <span class="text-white">cat contact.info</span></p>
          <div class="pl-2 space-y-2">
            <p>
              <span class="text-[#8b94ad]"># QQ</span>
              <span v-if="blogConfig.qq" class="text-white">{{ blogConfig.qq }}</span>
              <span v-else class="text-[#8b94ad]">未配置</span>
            </p>
            <p v-if="blogConfig.qq">
              <button
                type="button"
                class="cursor-pointer border border-[#3b4470] rounded bg-[#1a1f33] px-3 py-1 text-xs text-[#aeb8ff] transition-300 hover:border-[#818cf8]"
                @click="copyQQ"
              >
                {{ copyState === 'copied' ? '✓ 已复制' : '点击复制 QQ 号' }}
              </button>
            </p>
            <p>
              <span class="text-[#8b94ad]"># GitHub</span>
              <a
                v-if="blogConfig.github" :href="blogConfig.github" target="_blank" rel="noopener noreferrer"
                class="text-[#aeb8ff] underline underline-offset-4 decoration-dotted hover:text-white"
              >{{ blogConfig.github.replace('https://', '') }}</a>
              <span v-else class="text-[#8b94ad]">未配置</span>
            </p>
            <p v-if="blogConfig.gitee">
              <span class="text-[#8b94ad]"># Gitee</span>
              <a :href="blogConfig.gitee" target="_blank" rel="noopener noreferrer" class="text-[#aeb8ff] underline underline-offset-4 decoration-dotted hover:text-white">{{ blogConfig.gitee.replace('https://', '') }}</a>
            </p>
            <p class="pt-1 text-[#8b94ad]">
              $ 想说点什么？去 <RouterLink to="/message" class="text-[#aeb8ff] underline">
                留言板
              </RouterLink> 或在任意文章下评论 💬
            </p>
          </div>
        </div>
      </div>

      <!-- 快捷入口 -->
      <div class="card-view grid grid-cols-3 gap-2 p-4 text-center">
        <RouterLink to="/message" class="rounded-lg p-3 transition-300 hover:bg-surface-soft">
          <p class="text-2xl">
            💬
          </p>
          <p class="mt-1 text-xs text-muted">
            留言板
          </p>
        </RouterLink>
        <RouterLink to="/about" class="rounded-lg p-3 transition-300 hover:bg-surface-soft">
          <p class="text-2xl">
            🙋
          </p>
          <p class="mt-1 text-xs text-muted">
            关于我
          </p>
        </RouterLink>
        <RouterLink to="/resume" class="rounded-lg p-3 transition-300 hover:bg-surface-soft">
          <p class="text-2xl">
            📄
          </p>
          <p class="mt-1 text-xs text-muted">
            我的简历
          </p>
        </RouterLink>
      </div>

      <p class="text-center text-xs text-muted">
        © {{ year }} DKXaiLBY · 通常 24h 内回复
      </p>
    </div>
  </BannerPage>
</template>
