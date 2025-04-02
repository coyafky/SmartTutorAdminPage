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
    return response
  } catch (error) {
    console.error('获取匹配统计数据失败:', error)
    throw error
  }
}
