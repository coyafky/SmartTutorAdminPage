import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuth } from '../hooks/useAuth'

export const useUserStore = defineStore('user', () => {
  // 状态
  const user = ref(null)
  const token = ref(null)
  
  // 获取认证相关方法
  const { login: authLogin, register: authRegister, logout: authLogout } = useAuth()
  
  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => user.value?.username || '')
  const role = computed(() => user.value?.role || '')
  const customId = computed(() => user.value?.customId || '')
  
  // 初始化函数 - 从本地存储加载用户信息
  function init() {
    const storedToken = localStorage.getItem('admin_token')
    const storedUser = localStorage.getItem('admin_user')
    
    if (storedToken && storedUser) {
      token.value = storedToken
      user.value = JSON.parse(storedUser)
    }
  }
  
  // 登录方法
  async function login(credentials) {
    const result = await authLogin(credentials)
    
    if (result.success) {
      user.value = result.user
      token.value = localStorage.getItem('admin_token')
    }
    
    return result
  }
  
  // 注册方法
  async function register(userData) {
    return await authRegister(userData)
  }
  
  // 退出登录方法
  function logout() {
    authLogout()
    user.value = null
    token.value = null
  }
  
  // 初始化
  init()
  
  return {
    user,
    token,
    isLoggedIn,
    username,
    role,
    customId,
    login,
    register,
    logout
  }
})
