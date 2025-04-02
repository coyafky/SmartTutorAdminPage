import { defineStore } from 'pinia'
import { ref } from 'vue'
import { 
  getUserStatistics, 
  getTutorStatistics, 
  getPostStatistics, 
  getMatchStatistics 
} from '../services/statisticsService'

export const useStatisticsStore = defineStore('statistics', () => {
  // 响应式状态
  const userStats = ref(null)
  const tutorStats = ref(null)
  const postStats = ref(null)
  const matchStats = ref(null)
  const loading = ref({
    users: false,
    tutors: false,
    posts: false,
    matches: false
  })
  const error = ref({
    users: null,
    tutors: null,
    posts: null,
    matches: null
  })

  // 过滤参数
  const filters = ref({
    period: 'month',
    startDate: null,
    endDate: null
  })

  // 初始化日期范围
  const initDateRange = () => {
    const today = new Date()
    const endDate = new Date(today)
    
    // 根据周期设置开始日期
    let startDate
    switch (filters.value.period) {
      case 'day':
        startDate = new Date(today)
        break
      case 'week':
        startDate = new Date(today)
        startDate.setDate(today.getDate() - 7)
        break
      case 'month':
        startDate = new Date(today)
        startDate.setMonth(today.getMonth() - 1)
        break
      case 'year':
        startDate = new Date(today)
        startDate.setFullYear(today.getFullYear() - 1)
        break
      default:
        startDate = new Date(today)
        startDate.setMonth(today.getMonth() - 1)
    }
    
    // 格式化日期为 YYYY-MM-DD
    filters.value.startDate = formatDate(startDate)
    filters.value.endDate = formatDate(endDate)
  }

  // 格式化日期为 YYYY-MM-DD
  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // 更新过滤器
  const updateFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  // 获取用户统计数据
  const fetchUserStatistics = async () => {
    loading.value.users = true
    error.value.users = null
    
    try {
      if (!filters.value.startDate || !filters.value.endDate) {
        initDateRange()
      }
      
      const response = await getUserStatistics({
        period: filters.value.period,
        startDate: filters.value.startDate,
        endDate: filters.value.endDate
      })
      
      // 处理 API 响应
      if (response.data && response.data.status === 'success') {
        userStats.value = response.data.data
      } else {
        error.value.users = response.data?.message || '获取用户统计数据失败'
      }
      
      return response.data
    } catch (err) {
      error.value.users = err.message || '获取用户统计数据时发生错误'
      console.error('获取用户统计数据错误:', err)
      return err
    } finally {
      loading.value.users = false
    }
  }

  // 获取教师统计数据
  const fetchTutorStatistics = async () => {
    loading.value.tutors = true
    error.value.tutors = null
    
    try {
      if (!filters.value.startDate || !filters.value.endDate) {
        initDateRange()
      }
      
      const response = await getTutorStatistics({
        period: filters.value.period,
        startDate: filters.value.startDate,
        endDate: filters.value.endDate
      })
      
      // 处理 API 响应
      if (response.data && response.data.status === 'success') {
        tutorStats.value = response.data.data
      } else {
        error.value.tutors = response.data?.message || '获取教师统计数据失败'
      }
      
      return response.data
    } catch (err) {
      error.value.tutors = err.message || '获取教师统计数据时发生错误'
      console.error('获取教师统计数据错误:', err)
      return err
    } finally {
      loading.value.tutors = false
    }
  }

  // 获取帖子统计数据
  const fetchPostStatistics = async () => {
    loading.value.posts = true
    error.value.posts = null
    
    try {
      if (!filters.value.startDate || !filters.value.endDate) {
        initDateRange()
      }
      
      const response = await getPostStatistics({
        period: filters.value.period,
        startDate: filters.value.startDate,
        endDate: filters.value.endDate
      })
      
      // 处理 API 响应
      if (response.data && response.data.status === 'success') {
        postStats.value = response.data.data
      } else {
        error.value.posts = response.data?.message || '获取帖子统计数据失败'
      }
      
      return response.data
    } catch (err) {
      error.value.posts = err.message || '获取帖子统计数据时发生错误'
      console.error('获取帖子统计数据错误:', err)
      return err
    } finally {
      loading.value.posts = false
    }
  }

  // 获取匹配统计数据
  const fetchMatchStatistics = async () => {
    loading.value.matches = true
    error.value.matches = null
    
    try {
      if (!filters.value.startDate || !filters.value.endDate) {
        initDateRange()
      }
      
      const response = await getMatchStatistics({
        period: filters.value.period,
        startDate: filters.value.startDate,
        endDate: filters.value.endDate
      })
      
      // 处理 API 响应
      if (response.data && response.data.status === 'success') {
        matchStats.value = response.data.data
      } else {
        error.value.matches = response.data?.message || '获取匹配统计数据失败'
      }
      
      return response.data
    } catch (err) {
      error.value.matches = err.message || '获取匹配统计数据时发生错误'
      console.error('获取匹配统计数据错误:', err)
      return err
    } finally {
      loading.value.matches = false
    }
  }

  // 重置过滤器
  const resetFilters = () => {
    filters.value = {
      period: 'month',
      startDate: null,
      endDate: null
    }
    initDateRange()
  }

  // 初始化
  initDateRange()

  return {
    // 状态
    userStats,
    tutorStats,
    postStats,
    matchStats,
    loading,
    error,
    filters,
    
    // 方法
    fetchUserStatistics,
    fetchTutorStatistics,
    fetchPostStatistics,
    fetchMatchStatistics,
    updateFilters,
    resetFilters,
    initDateRange
  }
})
