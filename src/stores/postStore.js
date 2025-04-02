import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import postService from '../services/postService'

export const usePostStore = defineStore('posts', () => {
  // 状态
  const allPosts = ref([])
  const loading = ref(false)
  const error = ref(null)
  const filters = ref({
    status: '',
    city: '',
    sort: 'newest',
    page: 1,
  })
  const pagination = ref({
    total: 0,
    limit: 20,
    pages: 0,
  })

  // 计算属性
  const filteredPosts = computed(() => {
    if (!allPosts.value || allPosts.value.length === 0) {
      return []
    }

    let result = [...allPosts.value]

    // 状态筛选
    if (filters.value.status) {
      // 处理状态映射，确保正确筛选
      const statusMap = {
        pending: 'pending',
        published: 'approved', // 界面显示为 published，但实际数据中是 approved
        rejected: 'rejected',
      }

      const targetStatus = statusMap[filters.value.status] || filters.value.status
      result = result.filter((post) => post.status === targetStatus)
    }

    // 城市筛选
    if (filters.value.city) {
      const cityLower = filters.value.city.toLowerCase()
      result = result.filter((post) => post.location?.city?.toLowerCase().includes(cityLower))
    }

    // 排序
    if (filters.value.sort === 'newest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else if (filters.value.sort === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    }

    return result
  })

  // 分页后的帖子
  const paginatedPosts = computed(() => {
    const startIndex = (filters.value.page - 1) * pagination.value.limit
    const endIndex = startIndex + pagination.value.limit

    // 更新分页信息
    pagination.value.total = filteredPosts.value.length
    pagination.value.pages = Math.ceil(filteredPosts.value.length / pagination.value.limit)

    return filteredPosts.value.slice(startIndex, endIndex)
  })

  // 统计信息
  const statistics = computed(() => {
    return {
      total: allPosts.value.length,
      pending: allPosts.value.filter((p) => p.status === 'pending').length,
      approved: allPosts.value.filter((p) => p.status === 'approved').length,
      rejected: allPosts.value.filter((p) => p.status === 'rejected').length,
    }
  })

  // 方法
  async function fetchAllPosts() {
    loading.value = true
    error.value = null

    try {
      const response = await postService.getAllPosts()

      if (response && response.status === 'success' && response.data) {
        allPosts.value = response.data.posts || []
        return {
          status: 'success',
          data: {
            posts: allPosts.value,
            total: allPosts.value.length,
          },
        }
      } else {
        error.value = response?.message || '获取帖子失败'
        return {
          status: 'error',
          message: error.value,
          data: { posts: [] },
        }
      }
    } catch (err) {
      console.error('获取帖子错误:', err)
      error.value = '获取帖子时发生错误'
      return {
        status: 'error',
        message: error.value,
        data: { posts: [] },
      }
    } finally {
      loading.value = false
    }
  }

  async function getAllPosts(params) {
    // 复用 fetchAllPosts 方法
    try {
      const response = await fetchAllPosts()
      return response
    } catch (err) {
      console.error('获取所有帖子错误:', err)
      return { status: 'error', message: '获取所有帖子失败' }
    }
  }

  async function getPostsByCity(city, params) {
    try {
      // 先获取所有帖子，然后在前端筛选
      await fetchAllPosts()

      // 手动筛选城市
      updateFilters({ city })

      return {
        status: 'success',
        data: {
          posts: filteredPosts.value,
          total: filteredPosts.value.length,
        },
      }
    } catch (err) {
      console.error('按城市获取帖子错误:', err)
      return { status: 'error', message: '按城市获取帖子失败' }
    }
  }

  async function reviewPost(requestId, status, reviewNote) {
    try {
      const response = await postService.reviewPost(requestId, status, reviewNote)

      if (response.status === 'success') {
        // 更新本地存储的帖子状态
        const postIndex = allPosts.value.findIndex((p) => p.requestId === requestId)

        if (postIndex !== -1) {
          allPosts.value[postIndex].status = status
          allPosts.value[postIndex].reviewedAt = new Date().toISOString()
          allPosts.value[postIndex].reviewNote = reviewNote
        }

        return { success: true }
      } else {
        return { success: false, message: response.message || '审核帖子失败' }
      }
    } catch (error) {
      console.error('审核帖子错误:', error)
      return { success: false, message: '审核帖子时发生错误' }
    }
  }

  function updateFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters }
    // 当筛选条件变化时，重置页码
    if (
      newFilters.status !== undefined ||
      newFilters.city !== undefined ||
      newFilters.sort !== undefined
    ) {
      filters.value.page = 1
    }
  }

  function resetFilters() {
    filters.value = {
      status: '',
      city: '',
      sort: 'newest',
      page: 1,
    }
  }

  return {
    // 状态
    allPosts,
    loading,
    error,
    filters,
    pagination,

    // 计算属性
    filteredPosts,
    paginatedPosts,
    statistics,

    // 方法
    fetchAllPosts,
    getAllPosts,
    getPostsByCity,
    reviewPost,
    updateFilters,
    resetFilters,
  }
})
