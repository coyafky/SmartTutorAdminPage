import axios from 'axios'

// 创建 axios 实例
const api = axios.create({
  // 使用环境变量配置后端URL，支持不同部署环境
  baseURL: import.meta.env.VITE_API_URL || 'https://smart-tutor-server-seven.vercel.app/api',
  timeout: 15000, // 超时时间
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Origin': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
  },
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('admin_token')
    // 如果 token 存在，则添加到请求头
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    // 直接返回响应数据，不做额外处理
    // 注意：这里返回的是 response.data，而不是整个 response 对象
    console.log('API 响应拦截器:', response.data)
    return response.data
  },
  (error) => {
    // 处理错误响应
    if (error.response) {
      // 服务器返回错误状态码
      const { status, data } = error.response

      // 如果是 401 未授权，可能是 token 过期，清除本地存储并重定向到登录页
      if (status === 401) {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
        window.location.href = '/login'
      }

      return Promise.reject(data || { status: 'error', message: '请求失败' })
    } else if (error.request) {
      // 请求已发出但没有收到响应
      return Promise.reject({ status: 'error', message: '网络错误，服务器无响应' })
    } else {
      // 请求配置出错
      return Promise.reject({ status: 'error', message: '请求配置错误' })
    }
  },
)

export default api
