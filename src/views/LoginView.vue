<template>
  <div class="min-h-screen bg-base-200 flex items-center justify-center">
    <div class="card w-96 bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-2xl font-bold text-center mb-6">管理员登录</h2>
        <form @submit.prevent="handleLogin">
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text">用户名</span>
            </label>
            <input 
              type="text" 
              v-model="loginForm.username" 
              placeholder="请输入用户名" 
              class="input input-bordered w-full" 
              :class="{'input-error': errors.username}"
              @blur="validateUsername"
            />
            <label v-if="errors.username" class="label">
              <span class="label-text-alt text-error">{{ errors.username }}</span>
            </label>
          </div>
          
          <div class="form-control w-full mt-4">
            <label class="label">
              <span class="label-text">密码</span>
            </label>
            <input 
              type="password" 
              v-model="loginForm.password" 
              placeholder="请输入密码" 
              class="input input-bordered w-full" 
              :class="{'input-error': errors.password}"
              @blur="validatePassword"
              @keyup.enter="handleLogin"
            />
            <label v-if="errors.password" class="label">
              <span class="label-text-alt text-error">{{ errors.password }}</span>
            </label>
          </div>
          
          <div v-if="authError" class="alert alert-error mt-4">
            <span>{{ authError }}</span>
          </div>
          
          <div class="form-control mt-6">
            <button 
              type="submit" 
              class="btn btn-primary w-full" 
              :class="{'loading': isLoading}"
              :disabled="isLoading"
            >
              登录
            </button>
          </div>
          
          <div class="flex justify-between mt-4 text-sm">
            <a class="link link-primary" @click="goToRegister">注册账号</a>
            <a class="link link-hover">忘记密码?</a>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const isLoading = ref(false)
const authError = ref('')

const loginForm = reactive({
  username: '',
  password: ''
})

const errors = reactive({
  username: '',
  password: ''
})

const validateUsername = () => {
  if (!loginForm.username) {
    errors.username = '请输入用户名'
  } else if (loginForm.username.length < 3 || loginForm.username.length > 20) {
    errors.username = '用户名长度应在3-20个字符之间'
  } else {
    errors.username = ''
  }
}

const validatePassword = () => {
  if (!loginForm.password) {
    errors.password = '请输入密码'
  } else if (loginForm.password.length < 6 || loginForm.password.length > 20) {
    errors.password = '密码长度应在6-20个字符之间'
  } else {
    errors.password = ''
  }
}

const validateForm = () => {
  validateUsername()
  validatePassword()
  return !errors.username && !errors.password
}

const handleLogin = async () => {
  if (!validateForm()) return
  
  authError.value = ''
  isLoading.value = true
  
  try {
    // 使用 Pinia store 进行登录
    const result = await userStore.login(loginForm)
    
    if (result.success) {
      // 登录成功，跳转到首页
      router.push('/')
    } else {
      // 登录失败，显示错误信息
      authError.value = result.message || '登录失败，请检查用户名和密码'
    }
  } catch (error) {
    console.error('登录过程中发生错误:', error)
    authError.value = error.message || '登录失败，请稍后再试'
  } finally {
    isLoading.value = false
  }
}

const goToRegister = () => {
  router.push('/register')
}
</script>
