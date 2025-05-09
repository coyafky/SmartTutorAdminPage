import { ref } from 'vue'
import api from '../services/api'

export function useAuth() {
  const loading = ref(false)
  const error = ref(null)

  /**
   * 用户登录
   * @param {Object} credentials - 登录凭证
   * @param {string} credentials.username - 用户名
   * @param {string} credentials.password - 密码
   * @returns {Promise} - 返回登录结果
   */
  const login = async (credentials) => {
    loading.value = true
    error.value = null

    try {
      // 使用原生fetch直接访问后端
      const response = await fetch('https://smart-tutor-server-seven.vercel.app/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin
        },
        body: JSON.stringify(credentials)
      })
      
      // 处理响应
      const data = await response.json()
      console.log('登录响应:', data) // 调试输出
      
      // 如果登录成功，保存用户信息和token到本地存储
      if (data.status === 'success' && data.data) {
        const token = data.data.token || data.token
        const user = data.data.user || data.user
        
        if (token) {
          localStorage.setItem('admin_token', token)
          localStorage.setItem('admin_user', JSON.stringify(user))
          return { success: true, user: user }
        }
      }
      
      throw new Error(data.message || '登录失败')
    } catch (err) {
      console.error('登录错误:', err)
      error.value = err.message || '登录失败，请检查用户名和密码'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * 用户注册
   * @param {Object} userData - 用户数据
   * @param {string} userData.username - 用户名
   * @param {string} userData.password - 密码
   * @param {string} userData.role - 角色，默认为 'admin'
   * @returns {Promise} - 返回注册结果
   */
  const register = async (userData) => {
    loading.value = true
    error.value = null

    // 确保角色为 admin
    const data = { ...userData, role: 'admin' }

    try {
      const response = await api.post('/auth/register', data)
      
      if (response.status === 'success') {
        return { success: true, message: '注册成功' }
      } else {
        throw new Error(response.message || '注册失败')
      }
    } catch (err) {
      error.value = err.message || '注册失败，请稍后再试'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * 退出登录
   */
  const logout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    return { success: true }
  }

  /**
   * 获取当前登录用户信息
   * @returns {Object|null} - 返回用户信息或null
   */
  const getCurrentUser = () => {
    const userStr = localStorage.getItem('admin_user')
    return userStr ? JSON.parse(userStr) : null
  }

  /**
   * 检查用户是否已登录
   * @returns {boolean} - 是否已登录
   */
  const isLoggedIn = () => {
    return !!localStorage.getItem('admin_token')
  }

  return {
    login,
    register,
    logout,
    getCurrentUser,
    isLoggedIn,
    loading,
    error
  }
}
