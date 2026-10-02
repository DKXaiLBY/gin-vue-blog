<script setup>
import BannerPage from '@/components/BannerPage.vue'

// public 资源必须常量绑定: 模板静态 src 会被 plugin-vue v6 编译成模块导入, vitest 里炸套件
const NOT_FOUND_IMG = '/images/404.svg'
</script>

<template>
  <BannerPage label="404" card>
    <div class="text-center">
      <span class="text-8">
        404 资源不存在
      </span>
      <div class="flex justify-center">
        <img class="w-50" :src="NOT_FOUND_IMG" alt="404">
      </div>
      <button @click="$router.push('/')">
        回到首页
      </button>
    </div>
  </BannerPage>
</template>
