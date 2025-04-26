import api from './api'

/**
 * 家长管理相关的 API 服务
 */
export const parentService = {
  /**
   * 获取所有家长
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>} 家长列表和分页信息
   */
  getAllParents: async (params = {}) => {
    try {
      const response = await api.get('/admin/parents', { params })
      return response
    } catch (error) {
      console.error('[ParentService] 获取家长列表错误:', error)
      return {
        status: 'error',
        message: error.message || '获取家长列表失败',
      }
    }
  },

  /**
   * 分页获取家长列表
   * @param {Object} params - 分页和筛选参数
   * @param {number} params.page - 页码，默认为 1
   * @param {number} params.limit - 每页数量，默认为 10
   * @param {string} params.status - 按状态筛选，可选值: "active", "inactive", "suspended"
   * @param {string} params.city - 按城市筛选
   * @param {string} params.district - 按区域筛选
   * @param {string} params.search - 搜索关键词
   * @returns {Promise<Object>} 家长列表和分页信息
   */
  getParentsByLimit: async (params = {}) => {
    try {
      // 从参数中移除不需要的属性
      const { forceRefresh, ...apiParams } = params

      // 确保分页参数为数字
      if (apiParams.page) apiParams.page = Number(apiParams.page)
      if (apiParams.limit) apiParams.limit = Number(apiParams.limit)

      // 移除空值参数
      const cleanParams = {}
      Object.keys(apiParams).forEach((key) => {
        if (apiParams[key] !== '' && apiParams[key] !== null && apiParams[key] !== undefined) {
          cleanParams[key] = apiParams[key]
        }
      })

      const response = await api.get('/admin/parents/limit', { params: cleanParams })
      return response
    } catch (error) {
      console.error('[ParentService] 分页获取家长列表错误:', error)
      return {
        status: 'error',
        message: error.message || '获取家长列表失败',
      }
    }
  },

  /**
   * 获取单个家长详情
   * @param {string} parentId - 家长ID
   * @returns {Promise<Object>} 家长详情
   */
  getParentById: async (parentId) => {
    try {
      const response = await api.get(`/admin/parents/${parentId}`)
      return response
    } catch (error) {
      console.error(`[ParentService] 获取家长详情错误 (ID=${parentId}):`, error)
      return {
        status: 'error',
        message: error.message || '获取家长详情失败',
      }
    }
  },

  /**
   * 按城市获取家长
   * @param {string} cityName - 城市名称
   * @returns {Promise<Object>} 家长列表
   */
  getParentsByCity: async (cityName) => {
    try {
      const response = await api.get(`/admin/parents/city/${cityName}`)
      return response
    } catch (error) {
      console.error(`[ParentService] 获取城市家长错误 (城市=${cityName}):`, error)
      return {
        status: 'error',
        message: error.message || '获取家长列表失败',
      }
    }
  },

  /**
   * 更新家长状态
   * @param {string} parentId - 家长ID
   * @param {string} status - 新状态，例如："active", "inactive", "suspended"
   * @returns {Promise<Object>} 更新后的家长信息
   */
  updateParentStatus: async (parentId, status) => {
    try {
      const response = await api.patch(`/admin/parents/${parentId}/status`, { status })
      return response
    } catch (error) {
      console.error(`[ParentService] 更新家长状态错误 (ID=${parentId}):`, error)
      return {
        status: 'error',
        message: error.message || '更新家长状态失败',
      }
    }
  },

  /**
   * 获取家长统计数据
   * @returns {Promise<Object>} 家长统计数据
   */
  getParentStatistics: async () => {
    try {
      const response = await api.get('/admin/parents/statistics')
      return response
    } catch (error) {
      console.error('[ParentService] 获取家长统计数据错误:', error)
      return {
        status: 'error',
        message: error.message || '获取家长统计数据失败',
      }
    }
  }
}

export default parentService
