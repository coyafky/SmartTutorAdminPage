import api from './api'

/**
 * 教师管理相关的 API 服务
 */
export const teacherService = {
  /**
   * 获取所有教师
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>} 教师列表和分页信息
   */
    getAllTeachers: async (params = {}) => {
    try {
      const response = await api.get('/admin/tutors', { params })
      return response
    } catch (error) {
      console.error('[TeacherService] 获取教师列表错误:', error)
      return {
        status: 'error',
        message: error.message || '获取教师列表失败',
      }
    }
  },

  /**
   * 分页获取教师列表
   * @param {Object} params - 分页和筛选参数
   * @param {number} params.page - 页码，默认为 1
   * @param {number} params.limit - 每页数量，默认为 10
   * @param {string} params.status - 按状态筛选，可选值: "active", "inactive", "suspended"
   * @param {string} params.isVerified - 按验证状态筛选，可选值: "true", "false"
   * @param {string} params.city - 按城市筛选
   * @param {string} params.search - 搜索关键词
   * @returns {Promise<Object>} 教师列表和分页信息
   */
  getTeachersByLimit: async (params = {}) => {
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

      console.log('[TeacherService] 使用分页限制获取教师数据', cleanParams)

      // 发送 API 请求到分页接口
      const response = await api.get('/admin/tutors/limit', { params: cleanParams })

      // 调试输出
      console.log('[TeacherService] 分页接口响应:', response)
      
      // 处理响应 - 确保标准格式
      if (response && response.status === 'success') {
        return response
      } else {
        // 处理错误情况
        return {
          status: 'error',
          message: response?.message || '获取教师列表失败',
        }
      }
    } catch (error) {
      console.error('[TeacherService] 分页获取教师列表错误:', error)
      return {
        status: 'error',
        message: error.message || '分页获取教师列表失败',
      }
    }
  },

  /**
   * 获取指定教师详情
   * @param {string} tutorId - 教师 ID
   * @returns {Promise<Object>} 教师详情
   */
  getTeacherById: async (tutorId) => {
    try {
      const response = await api.get(`/admin/tutors/${tutorId}`)
      return response
    } catch (error) {
      console.error('[TeacherService] 获取教师详情错误:', error)
      return {
        status: 'error',
        message: error.message || '获取教师详情失败',
      }
    }
  },

  /**
   * 按城市筛选教师
   * @param {string} cityName - 城市名称
   * @param {Object} params - 其他查询参数
   * @returns {Promise<Object>} 教师列表和分页信息
   */
  getTeachersByCity: async (cityName, params = {}) => {
    try {
      const response = await api.get(`/admin/tutors/city/${cityName}`, { params })
      return response
    } catch (error) {
      console.error('[TeacherService] 按城市获取教师错误:', error)
      return {
        status: 'error',
        message: error.message || '按城市获取教师失败',
      }
    }
  },

  /**
   * 认证教师
   * @param {string} tutorId - 教师 ID
   * @param {boolean} verified - 认证状态
   * @param {string} verificationNote - 认证备注
   * @returns {Promise<Object>} 操作结果
   */
  verifyTeacher: async (tutorId, verified, verificationNote) => {
    try {
      const response = await api.patch(`/admin/tutors/${tutorId}/verify`, {
        verified,
        verificationNote,
      })
      return response
    } catch (error) {
      console.error('[TeacherService] 认证教师错误:', error)
      return {
        status: 'error',
        message: error.message || '认证教师失败',
      }
    }
  },

  /**
   * 更新教师状态
   * @param {string} tutorId - 教师 ID
   * @param {string} status - 状态
   * @param {string} statusNote - 状态备注
   * @returns {Promise<Object>} 操作结果
   */
  updateTeacherStatus: async (tutorId, status, statusNote) => {
    try {
      const response = await api.patch(`/admin/tutors/${tutorId}/status`, {
        status,
        statusNote,
      })
      return response
    } catch (error) {
      console.error('[TeacherService] 更新教师状态错误:', error)
      return {
        status: 'error',
        message: error.message || '更新教师状态失败',
      }
    }
  },
}

export default teacherService
