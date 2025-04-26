import api from './api'

/**
 * 获取用户统计数据
 * @param {Object} params - 查询参数
 * @param {string} params.period - 统计周期，可选值: "day", "week", "month", "year"
 * @param {string} params.startDate - 开始日期，格式为 YYYY-MM-DD
 * @param {string} params.endDate - 结束日期，格式为 YYYY-MM-DD
 * @returns {Promise} - 返回请求的Promise对象
 */
export const getUserStatistics = async (params = {}) => {
  try {
    const response = await api.get('/admin/statistics/users', { params })
    console.log('获取用户统计数据:', response)
    return response
  } catch (error) {
    console.error('获取用户统计数据失败:', error)
    
    throw error
  }
}

/**
 * 获取教师统计数据
 * @param {Object} params - 查询参数
 * @param {string} params.period - 统计周期，可选值: "day", "week", "month", "year"
 * @param {string} params.startDate - 开始日期，格式为 YYYY-MM-DD
 * @param {string} params.endDate - 结束日期，格式为 YYYY-MM-DD
 * @returns {Promise} - 返回请求的Promise对象
 */
export const getTutorStatistics = async (params = {}) => {
  try {
    const response = await api.get('/admin/statistics/tutors', { params })
    console.log('获取教师统计数据:', response)
    return response
  } catch (error) {
    console.error('获取教师统计数据失败:', error)
    throw error
  }
}

/**
 * 获取帖子统计数据
 * @param {Object} params - 查询参数
 * @param {string} params.period - 统计周期，可选值: "day", "week", "month", "year"
 * @param {string} params.startDate - 开始日期，格式为 YYYY-MM-DD
 * @param {string} params.endDate - 结束日期，格式为 YYYY-MM-DD
 * @returns {Promise} - 返回请求的Promise对象
 */
export const getPostStatistics = async (params = {}) => {
  try {
    const response = await api.get('/admin/statistics/posts', { params })
    console.log('获取帖子统计数据:', response)
    return response
  } catch (error) {
    console.error('获取帖子统计数据失败:', error)
    throw error
  }
}

/**
 * 获取匹配统计数据
 * @param {Object} params - 查询参数
 * @param {string} params.period - 统计周期，可选值: "day", "week", "month", "year"
 * @param {string} params.startDate - 开始日期，格式为 YYYY-MM-DD
 * @param {string} params.endDate - 结束日期，格式为 YYYY-MM-DD
 * @returns {Promise} - 返回请求的Promise对象
 */
export const getMatchStatistics = async (params = {}) => {
  try {
    const response = await api.get('/admin/statistics/matches', { params })
    console.log('获取匹配统计数据:', response)
    return response
  } catch (error) {
    console.error('获取匹配统计数据失败:', error)
    throw error
  }
}

/**
 * 获取最新的用户列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.limit - 每页的数量
 * @returns {Promise} - 返回请求的Promise对象
 */
export const getRecentUsers = async () => {
  try {
    const response = await api.get('/admin/statistics/recentUsers')
    console.log('获取最新的用户列表:', response)
    return response
  } catch (error) {
    console.error('获取最新的用户列表失败:', error)
    throw error
  }
}

