import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUserStatistics } from '@/services/statisticsService'

// 用户统计数据结构类
export class UserStatistics {
  constructor(data = {}) {
    this.totalUsers = data.totalUsers ?? 0
    this.activeUsers = data.activeUsers ?? 0
    this.newUsersToday = data.newUsersToday ?? 0
    this.roleStats = Array.isArray(data.roleStats) ? data.roleStats : []
    this.monthlyStats = Array.isArray(data.monthlyStats) ? data.monthlyStats : []
  }
}

export const useUserStatisticsStore = defineStore('userStatistics', () => {
  const userStats = ref(new UserStatistics())
  const loading = ref(false)
  const error = ref(null)
  const filters = ref({
    period: 'month',
    startDate: null,
    endDate: null
  })

  const initDateRange = () => {
    const today = new Date()
    const endDate = new Date(today)
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
    filters.value.startDate = formatDate(startDate)
    filters.value.endDate = formatDate(endDate)
  }

  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // 获取用户统计数据
  const fetchUserStatistics = async () => {
    loading.value = true
    error.value = null
    try {
      if (!filters.value.startDate || !filters.value.endDate) {
        initDateRange()
      }
      const response = await getUserStatistics({
        period: filters.value.period,
        startDate: filters.value.startDate,
        endDate: filters.value.endDate
      })
      // 兼容图片和返回结构
      if (response.data && (response.data.status === 'success' || response.data.status === 'ok')) {
        // 有些接口 data 结构为 { data: {...} }，有些为 { ... }
        const data = response.data.data ? response.data.data : response.data
        userStats.value = new UserStatistics(data)
      } else {
        error.value = response.data?.message || '获取用户统计数据失败'
      }
      return response.data
    } catch (err) {
      error.value = err.message || '获取用户统计数据时发生错误'
      console.error('获取用户统计数据错误:', err)
      return err
    } finally {
      loading.value = false
    }
  }

  return {
    userStats,
    loading,
    error,
    filters,
    fetchUserStatistics
  }
})
