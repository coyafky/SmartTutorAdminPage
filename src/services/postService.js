import api from './api'

/**
 * 帖子管理相关的 API 服务
 */
export const postService = {
  getAllPosts: async (params = {}) => {
    try {
      // 直接调用接口，不添加任何参数
      const response = await api.get('/admin/posts')
      console.log('[PostService] 获取所有帖子响应:', response)

      // 检查响应类型并适配
      if (response && response.status === 'success') {
        // 如果响应已经是标准格式，直接返回
        return response
      } else {
        // 处理错误情况
        return {
          status: 'error',
          message: response?.message || '获取帖子列表失败',
        }
      }
    } catch (error) {
      console.error('[PostService] 获取帖子列表错误:', error)
      return {
        status: 'error',
        message: error.message || '获取帖子列表失败',
      }
    }
  },

  /**
   * 获取指定帖子详情
   * @param {string} postId - 帖子 ID
   * @returns {Promise<Object>} 帖子详情
   */
  getPostById: async (postId) => {
    try {
      const response = await api.get(`/admin/posts/${postId}`)

      if (response.data && response.data.status === 'success') {
        return response.data
      } else {
        return {
          status: 'error',
          message: response.data?.message || '获取帖子详情失败',
        }
      }
    } catch (error) {
      console.error('[PostService] 获取帖子详情错误:', error)
      return {
        status: 'error',
        message: error.message || '获取帖子详情失败',
      }
    }
  },

  /**
   * 更新帖子状态
   * @param {string} postId - 帖子 ID
   * @param {string} status - 新状态，可选值: "pending", "published", "rejected"
   * @param {string} reviewNote - 审核备注
   * @returns {Promise<Object>} 更新后的帖子信息
   */
  updatePostStatus: async (postId, status, reviewNote = '') => {
    try {
      const response = await api.patch(`/admin/posts/${postId}/status`, {
        status,
        reviewNote,
      })

      if (response.data && response.data.status === 'success') {
        return response.data
      } else {
        return {
          status: 'error',
          message: response.data?.message || '更新帖子状态失败',
        }
      }
    } catch (error) {
      console.error('[PostService] 更新帖子状态错误:', error)
      return {
        status: 'error',
        message: error.message || '更新帖子状态失败',
      }
    }
  },

  /**
   * 删除帖子
   * @param {string} postId - 帖子 ID
   * @returns {Promise<Object>} 操作结果
   */
  deletePost: async (postId) => {
    try {
      const response = await api.delete(`/admin/posts/${postId}`)

      if (response.data && response.data.status === 'success') {
        return response.data
      } else {
        return {
          status: 'error',
          message: response.data?.message || '删除帖子失败',
        }
      }
    } catch (error) {
      console.error('[PostService] 删除帖子错误:', error)
      return {
        status: 'error',
        message: error.message || '删除帖子失败',
      }
    }
  },

  /**
   * 按城市筛选帖子
   * @param {string} cityName - 城市名称
   * @param {Object} params - 查询参数
   * @param {string} params.status - 按状态筛选，可选值: "pending", "published", "rejected"
   * @returns {Promise<Object>} 指定城市的帖子列表
   */
  getPostsByCity: async (cityName, params = {}) => {
    try {
      // 移除空值参数
      const cleanParams = {}
      Object.keys(params).forEach((key) => {
        if (params[key] !== '' && params[key] !== null && params[key] !== undefined) {
          cleanParams[key] = params[key]
        }
      })

      // 强制添加 all=true 参数，获取所有帖子（不分页）
      cleanParams.all = 'true'

      const response = await api.get(`/admin/posts/city/${encodeURIComponent(cityName)}`, {
        params: cleanParams,
      })

      if (response.data && response.data.status === 'success') {
        return response.data
      } else {
        return {
          status: 'error',
          message: response.data?.message || '获取城市帖子失败',
        }
      }
    } catch (error) {
      console.error(`[PostService] 获取城市 ${cityName} 帖子错误:`, error)
      return {
        status: 'error',
        message: error.message || '获取城市帖子失败',
      }
    }
  },
}

export default postService
