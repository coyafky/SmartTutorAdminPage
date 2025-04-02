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
   * @returns {Promise<Object>} 教师列表和分页信息
   */
  getTeachersByLimit: async (params = {}) => {
    try {
      console.log('[TeacherService] 发送请求参数:', params)
      const response = await api.get('/admin/tutors/limit', { params })
      console.log('[TeacherService] API 响应:', response)
      
      // 检查数据结构
      if (response && response.data) {
        console.log('[TeacherService] 响应中的 data:', response.data)
        if (Array.isArray(response.data)) {
          console.log('[TeacherService] data 是数组，长度:', response.data.length)
        }
      }
      
      return response
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
