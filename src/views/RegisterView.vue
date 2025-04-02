<template>
  <div class="min-h-screen bg-base-200 flex items-center justify-center">
    <div class="card w-96 bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-2xl font-bold text-center mb-6">管理员注册</h2>
        <form @submit.prevent="handleRegister">
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text">用户名</span>
            </label>
            <input 
              type="text" 
              v-model="registerForm.username" 
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
              v-model="registerForm.password" 
              placeholder="请输入密码" 
              class="input input-bordered w-full" 
              :class="{'input-error': errors.password}"
              @blur="validatePassword"
            />
            <label v-if="errors.password" class="label">
              <span class="label-text-alt text-error">{{ errors.password }}</span>
            </label>
          </div>
          
          <div class="form-control w-full mt-4">
            <label class="label">
              <span class="label-text">确认密码</span>
            </label>
            <input 
              type="password" 
              v-model="registerForm.confirmPassword" 
              placeholder="请再次输入密码" 
              class="input input-bordered w-full" 
              :class="{'input-error': errors.confirmPassword}"
              @blur="validateConfirmPassword"
            />
            <label v-if="errors.confirmPassword" class="label">
              <span class="label-text-alt text-error">{{ errors.confirmPassword }}</span>
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
              注册
            </button>
          </div>
          
          <div class="mt-4 text-sm text-center">
            <span>已有账号? </span>
            <a class="link link-primary" @click="goToLogin">立即登录</a>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const isLoading = ref(false)
const authError = ref('')

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

const errors = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

const validateUsername = () => {
  if (!registerForm.username) {
    errors.username = '请输入用户名'
  } else if (registerForm.username.length < 3 || registerForm.username.length > 20) {
    errors.username = '用户名长度应在3-20个字符之间'
  } else {
    errors.username = ''
  }
}

const validatePassword = () => {
  if (!registerForm.password) {
    errors.password = '请输入密码'
  } else if (registerForm.password.length < 6 || registerForm.password.length > 20) {
    errors.password = '密码长度应在6-20个字符之间'
  } else {
    errors.password = ''
  }
  
  // 如果确认密码已经填写，则同时验证确认密码
  if (registerForm.confirmPassword) {
    validateConfirmPassword()
  }
}

const validateConfirmPassword = () => {
  if (!registerForm.confirmPassword) {
    errors.confirmPassword = '请再次输入密码'
  } else if (registerForm.confirmPassword !== registerForm.password) {
    errors.confirmPassword = '两次输入的密码不一致'
  } else {
    errors.confirmPassword = ''
  }
}

const validateForm = () => {
  validateUsername()
  validatePassword()
  validateConfirmPassword()
  return !errors.username && !errors.password && !errors.confirmPassword
}

const handleRegister = async () => {
  if (!validateForm()) return
  
  authError.value = ''
  isLoading.value = true
  
  try {
    // 准备注册数据（不包含确认密码）
    const userData = {
      username: registerForm.username,
      password: registerForm.password,
      role: 'admin'
    }
    
    // 使用 Pinia store 进行注册
    const result = await userStore.register(userData)
    
    if (result.success) {
      // 注册成功，显示提示并跳转到登录页
      alert('注册成功，请登录')
      router.push('/login')
    } else {
      // 注册失败，显示错误信息
      authError.value = result.message || '注册失败，请稍后再试'
    }
  } catch (error) {
    console.error('注册过程中发生错误:', error)
    authError.value = error.message || '注册失败，请稍后再试'
  } finally {
    isLoading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>
