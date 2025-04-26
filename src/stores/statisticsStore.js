import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getUserStatistics,
  getTutorStatistics,
  getPostStatistics,
  getMatchStatistics,
  getRecentUsers
} from '@/services/statisticsService'

export const useStatisticsStore = defineStore('statistics', {
  state: () => ({
    userStats: {},
    tutorStats: {},
    postStats: {},
    matchStats: {},
    recentUsers: [],
    loading: false,
    error: null,
  }),
  actions: {
    async fetchAllStatistics() {
      this.loading = true
      this.error = null
      try {
        const [userRes, tutorRes, postRes, matchRes, recentUsersRes] = await Promise.all([
          getUserStatistics(),
          getTutorStatistics(),
          getPostStatistics(),
          getMatchStatistics(),
          getRecentUsers()
        ])
        this.userStats = userRes.data
        this.tutorStats = tutorRes.data
        this.postStats = postRes.data
        this.matchStats = matchRes.data
        this.recentUsers = recentUsersRes.data.data
      } catch (err) {
        this.error = err.message || '获取统计数据失败'
      } finally {
        this.loading = false
      }
    },

    async fetchUserStats() {
      try {
        const res = await getUserStatistics()
        this.userStats = res.data
      } catch (err) {
        this.error = err.message || '获取用户统计失败'
      }
    },
    async fetchTutorStats() {
      try {
        const res = await getTutorStatistics()
        this.tutorStats = res.data
      } catch (err) {
        this.error = err.message || '获取教师统计失败'
      }
    },
    async fetchPostStats() {
      try {
        const res = await getPostStatistics()
        this.postStats = res.data
      } catch (err) {
        this.error = err.message || '获取帖子统计失败'
      }
    },
    async fetchMatchStats() {
      try {
        const res = await getMatchStatistics()
        this.matchStats = res.data
      } catch (err) {
        this.error = err.message || '获取匹配统计失败'
      }
    },
    async fetchRecentUsers() {
      try {
        const res = await getRecentUsers()
        this.recentUsers = res.data.data
      } catch (err) {
        this.error = err.message || '获取最近注册用户失败'
      }
    },
  },
  persist: true
})
