import api from './api'

/**
 * 帖子管理相关的 API 服务
 */
export const postService = {
  /**
   * 使用分页限制获取帖子列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码，默认为 1
   * @param {number} params.limit - 每页数量，默认为 10
   * @param {string} params.status - 按状态筛选，可选值: "pending", "published", "rejected"
   * @param {string} params.search - 搜索关键词
   * @param {string} params.sort - 排序字段
   * @param {string} params.sortOrder - 排序方向，可选值: "asc", "desc"
   * @returns {Promise<Object>} 帖子列表和分页信息
   */
  getPostsByLimit: async (params = {}) => {
    try {
      // 从参数中移除不需要的属性
      const { forceRefresh, ...apiParams } = params

      // 确保分页参数为数字
      if (apiParams.page) apiParams.page = Number(apiParams.page)
      if (apiParams.limit) apiParams.limit = Number(apiParams.limit)

      // 处理排序参数
      if (apiParams.sort === 'newest') {
        apiParams.sort = 'createdAt'
        apiParams.sortOrder = 'desc'
      } else if (apiParams.sort === 'oldest') {
        apiParams.sort = 'createdAt'
        apiParams.sortOrder = 'asc'
      }

      // 移除空值参数
      const cleanParams = {}
      Object.keys(apiParams).forEach((key) => {
        if (apiParams[key] !== '' && apiParams[key] !== null && apiParams[key] !== undefined) {
          cleanParams[key] = apiParams[key]
        }
      })

      console.log('[PostService] 使用分页限制获取帖子数据', cleanParams)

      // 发送 API 请求到分页接口
      const response = await api.get('/admin/posts', { params: cleanParams })

      // 调试输出
      console.log('[PostService] 分页接口响应:', response)

      // 处理响应
      if (response && response.status === 'success') {
        return response
      } else {
        // 处理错误情况
        return {
          status: 'error',
          message: response?.message || '获取帖子列表失败',
        }
      }
    } catch (error) {
      console.error('[PostService] 分页获取帖子列表错误:', error)
      return {
        status: 'error',
        message: error.message || '获取帖子列表失败',
      }
    }
  },
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
  /**
   * 获取指定帖子详情
   * @param {string} postId - 帖子 ID (可能是 requestId 或 _id)
   * @returns {Promise<Object>} 帖子详情
   */
  getPostById: async (postId) => {
    try {
      console.log(`[PostService] 获取帖子详情，ID: ${postId}`)
      
      // 确保postId有效
      if (!postId) {
        console.error('[PostService] 无效的帖子ID')
        return {
          status: 'error',
          message: '无效的帖子ID',
        }
      }

      // 判断 ID 类型
      // 如果是 MongoDB 的 _id，需要先获取帖子信息找出 requestId
      const isMongoId = /^[0-9a-f]{24}$/i.test(postId);
      let requestId = postId;
      
      if (isMongoId) {
        console.log(`[PostService] 检测到 MongoDB ID 格式，需要使用 requestId 获取帖子`);
        // 如果是 MongoDB 格式的ID，我们需要使用 requestId 格式查询
        // 因为后端接口使用的是 requestId 而非 _id
      }
      
      // 确保 ID 格式正确
      if (isMongoId && !requestId.startsWith('REQUEST_')) {
        // 如果是非requestId格式，尝试编码一下
        console.warn(`[PostService] 警告: 可能使用了错误的ID格式，应该使用 requestId`);
      }

      // 发送API请求
      const response = await api.get(`/admin/posts/${requestId}`)
      console.log('[PostService] 帖子详情API响应:', response)

      // 检查响应格式 - 后端返回的是 { status, data: { post } }
      if (response && response.status === 'success') {
        // 直接返回整个响应，包含status和data属性
        return response
      } else {
        return {
          status: 'error',
          message: response?.message || '获取帖子详情失败',
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
      console.log(`[PostService] 更新帖子状态，ID: ${postId}, 状态: ${status}`)
      
      // 参数验证
      if (!postId) {
        console.error('[PostService] 无效的帖子ID')
        return {
          status: 'error',
          message: '无效的帖子ID',
        }
      }
      
      // 判断 ID 类型
      const isMongoId = /^[0-9a-f]{24}$/i.test(postId);
      let requestId = postId;
      
      if (isMongoId && !postId.startsWith('REQUEST_')) {
        console.warn(`[PostService] 警告: 可能使用了错误的ID格式，应该使用 requestId`);
      }

      // 发送API请求
      const response = await api.patch(`/admin/posts/${requestId}/status`, {
        status,
        reviewNote,
      })
      
      console.log('[PostService] 更新帖子状态API响应:', response)

      // 检查响应格式 - 后端返回的是 { status, data: { post } }
      if (response && response.status === 'success') {
        // 直接返回整个响应，包含status和data属性
        return response
      } else {
        return {
          status: 'error',
          message: response?.message || '更新帖子状态失败',
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
      console.log(`[PostService] 删除帖子，ID: ${postId}`)
      
      // 参数验证
      if (!postId) {
        console.error('[PostService] 无效的帖子ID')
        return {
          status: 'error',
          message: '无效的帖子ID',
        }
      }
      
      // 判断 ID 类型
      const isMongoId = /^[0-9a-f]{24}$/i.test(postId);
      let requestId = postId;
      
      if (isMongoId && !postId.startsWith('REQUEST_')) {
        console.warn(`[PostService] 警告: 可能使用了错误的ID格式，应该使用 requestId`);
      }

      // 发送API请求
      const response = await api.delete(`/admin/posts/${requestId}`)
      console.log('[PostService] 删除帖子API响应:', response)

      // 处理响应 - 删除操作会返回204状态码，且没有数据
      if (response && (response.status === 'success' || response.status === 204)) {
        return {
          status: 'success',
          message: '帖子删除成功'
        }
      } else {
        return {
          status: 'error',
          message: response?.message || '删除帖子失败',
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
