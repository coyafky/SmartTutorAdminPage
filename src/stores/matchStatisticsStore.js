import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getMatchStatistics } from '@/services/statisticsService'

// 匹配统计数据结构类
export class MatchStatistics {
  constructor(data = {}) {
    this.totalMatches = data.totalMatches ?? 0
    this.completedMatches = data.completedMatches ?? 0
    this.pendingMatches = data.pendingMatches ?? 0
    this.acceptedMatches = data.acceptedMatches ?? 0
    this.rejectedMatches = data.rejectedMatches ?? 0
    this.cancelledMatches = data.cancelledMatches ?? 0
    this.monthlyStats = Array.isArray(data.monthlyStats) ? data.monthlyStats : []
    this.statusStats = Array.isArray(data.statusStats) ? data.statusStats : []
  }
}

export const useMatchStatisticsStore = defineStore('matchStatistics', () => {
  const matchStats = ref(new MatchStatistics())
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

  // 获取匹配统计数据
  const fetchMatchStatistics = async () => {
    loading.value = true
    error.value = null
    try {
      if (!filters.value.startDate || !filters.value.endDate) {
        initDateRange()
      }
      const response = await getMatchStatistics({
        period: filters.value.period,
        startDate: filters.value.startDate,
        endDate: filters.value.endDate
      })
      if (response.data && response.data.status === 'success') {
        matchStats.value = new MatchStatistics(response.data.data)
      } else {
        error.value = response.data?.message || '获取匹配统计数据失败'
      }
      return response.data
    } catch (err) {
      error.value = err.message || '获取匹配统计数据时发生错误'
      console.error('获取匹配统计数据错误:', err)
      return err
    } finally {
      loading.value = false
    }
  }

  return {
    matchStats,
    loading,
    error,
    filters,
    fetchMatchStatistics
  }
})
