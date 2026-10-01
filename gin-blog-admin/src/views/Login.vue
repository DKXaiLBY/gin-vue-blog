<script setup>
import { useStorage } from '@vueuse/core'
import { NButton, NCheckbox, NInput } from 'naive-ui'
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import api from '@/api'

import AppPage from '@/components/common/AppPage.vue'
import { addDynamicRoutes } from '@/router'
import { useAuthStore, useUserStore } from '@/store'
import { getLocal, removeLocal, setLocal } from '@/utils'

const title = import.meta.env.VITE_TITLE // 环境变量中读取

const userStore = useUserStore()
const authStore = useAuthStore()

const router = useRouter()
const { query } = useRoute()

/*
  Mock 模式(GitHub Pages 演示站)预填演示账号, 真实部署留空

  演示站没有后端, 随便什么账号都能登进去, 预填是为了让访客少输两下;
  但连了真后端时预填账号/密码等于把凭据写在页面上, 所以只在 mock 下给。
*/
const isMock = import.meta.env.VITE_USE_MOCK === 'true'

const loginForm = reactive({
  username: isMock ? 'guest' : '',
  password: isMock ? '123456' : '',
})

initLoginInfo()

// 从 localStorage 中获取记住的用户名和密码
function initLoginInfo() {
  const localLoginInfo = getLocal('loginInfo')
  if (localLoginInfo) {
    loginForm.username = localLoginInfo.username
    loginForm.password = localLoginInfo.password
  }
}

// Reactive LocalStorage/SessionStorage - vueuse
const isRemember = useStorage('isRemember', false)
const loading = ref(false)

async function handleLogin() {
  const { username, password } = loginForm
  if (!username || !password) {
    $message.warning('请输入用户名和密码')
    return
  }

  const doLogin = async (username, password) => {
    loading.value = true

    // 登录接口
    try {
      const resp = await api.login({ username, password })
      authStore.setToken(resp.data.token)

      await userStore.getUserInfo()
      await addDynamicRoutes()

      // isRemember 是 useStorage 返回的 Ref, 必须取 .value:
      // 直接判断 Ref 恒为真, 取消勾选也会把账号密码存进 localStorage
      isRemember.value ? setLocal('loginInfo', { username, password }) : removeLocal('loginInfo')
      $message.success('登录成功')

      // 页面跳转: 根据 URL 中的 redirect 进行跳转
      if (query.redirect) {
        const path = query.redirect
        Reflect.deleteProperty(query, 'redirect') // 从对象身上删除属性
        router.push({ path, query })
      }
      else {
        router.push('/')
      }
    }
    finally {
      loading.value = false
    }
  }

  // doLogin 里只有 try/finally, 失败时的 rejection 需要在这里兜住
  doLogin(username, password).catch(err => console.error(err))
}
</script>

<template>
  <!-- 登录页: 深蓝渐变呼应前台横幅, 单卡片居中 -->
  <AppPage class="login-bg">
    <div class="min-h-[80vh] flex items-center justify-center">
      <div class="w-[380px] rounded-2xl bg-white/95 p-9 shadow-2xl backdrop-blur dark:bg-[#1d2025]/95">
        <div class="mb-8 text-center">
          <span class="i-mdi:rocket-launch-outline mx-auto mb-3 block h-14 w-14 text-primary" />
          <h1 class="text-2xl font-bold">
            {{ title }}
          </h1>
          <p class="mt-1 text-sm text-gray-400">
            管理系统 · 内容从这里出发
          </p>
        </div>

        <div class="space-y-5">
          <NInput
            v-model:value="loginForm.username"
            class="h-[46px] items-center"
            autofocus
            placeholder="用户名"
            :maxlength="20"
          />
          <NInput
            v-model:value="loginForm.password"
            class="h-[46px] items-center"
            type="password"
            show-password-on="mousedown"
            placeholder="密码"
            :maxlength="20"
            @keydown.enter="handleLogin"
          />
          <NCheckbox
            :checked="isRemember"
            label="记住我"
            :on-update:checked="(val) => (isRemember = val)"
          />
          <NButton
            class="h-[46px] w-full rounded-xl"
            type="primary"
            :loading="loading"
            @click="handleLogin"
          >
            登 录
          </NButton>
        </div>
      </div>
    </div>
  </AppPage>
</template>

<style scoped>
/* 与前台首页横幅同源的深蓝渐变 */
.login-bg {
  background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #0c4a6e 100%);
}
</style>
