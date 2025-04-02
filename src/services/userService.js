import api from './api'

/**
 * 用户管理相关的 API 服务
 */
export const userService = {
  // 缓存存储
  _cache: {
    users: new Map(),
    timestamp: 0,
    cacheTime: 60000, // 缓存有效期，默认 1 分钟
  },

  /**
   * 获取所有用户
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码，默认为 1
   * @param {number} params.limit - 每页数量，默认为 10
   * @param {string} params.role - 按角色筛选，可选值: "parent", "teacher", "admin"
   * @param {string} params.status - 按状态筛选，可选值: "active", "inactive", "suspended"
   * @returns {Promise<Object>} 用户列表和分页信息
   */
  getAllUsers: async (params = {}) => {
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

      console.log('[UserService] 从服务器获取用户数据', cleanParams)

      // 直接发送 API 请求，不使用缓存
      const response = await api.get('/admin/users', { params: cleanParams })

      // 调试输出
      console.log('[UserService] 原始 API 响应:', response)
      console.log('[UserService] 响应数据类型:', typeof response.data, Array.isArray(response.data))
      console.log('[UserService] 响应数据:', response.data)

      // 处理响应 - 检查响应类型并适配
      if (Array.isArray(response.data)) {
        // 如果响应是数组，构建标准格式
        return {
          status: 'success',
          data: response.data,
          pagination: {
            total: response.data.length,
            page: Number(cleanParams.page) || 1,
            limit: Number(cleanParams.limit) || 10,
            pages: Math.ceil(response.data.length / (Number(cleanParams.limit) || 10)),
          },
        }
      } else if (response.data && response.data.status === 'success') {
        // 如果响应已经是标准格式，直接返回
        return response.data
      } else {
        // 处理错误情况
        return {
          status: 'error',
          message: response.data?.message || '获取用户列表失败',
        }
      }
    } catch (error) {
      console.error('[UserService] 获取用户列表错误:', error)
      return {
        status: 'error',
        message: error.message || '获取用户列表失败',
      }
    }
  },

  /**
   * 获取所有用户数据（不分页）
   * @param {Object} params - 查询参数
   * @param {string} params.role - 按角色筛选，可选值: "parent", "teacher", "admin"
   * @param {string} params.status - 按状态筛选，可选值: "active", "inactive", "suspended"
   * @returns {Promise<Object>} 所有用户数据
   */
  getAllUsersWithoutPagination: async (params = {}) => {
    try {
      // 从参数中移除不需要的属性
      const { forceRefresh, ...apiParams } = params

      // 添加 all=true 参数，告诉服务器返回所有数据
      const cleanParams = { ...apiParams, all: 'true' }

      // 移除空值参数
      Object.keys(cleanParams).forEach((key) => {
        if (
          cleanParams[key] === '' ||
          cleanParams[key] === null ||
          cleanParams[key] === undefined
        ) {
          delete cleanParams[key]
        }
      })

      console.log('[UserService] 从服务器获取所有用户数据', cleanParams)

      // 发送 API 请求 - 确保使用正确的用户 API 端点
      const response = await api.get('/admin/users', { params: cleanParams })

      // 处理响应
      if (response.data && response.data.status === 'success') {
        return response.data
      } else {
        // 处理错误情况
        return {
          status: 'error',
          message: response.data?.message || '获取所有用户数据失败',
        }
      }
    } catch (error) {
      console.error('[UserService] 获取所有用户数据错误:', error)
      return {
        status: 'error',
        message: error.message || '获取所有用户数据失败',
      }
    }
  },

  /**
   * 调试函数 - 直接获取用户数据
   */
  debugGetUsers: async () => {
    try {
      const response = await api.get('/admin/users?page=1&limit=10')
      console.log('[UserService] 调试 - 原始响应:', response)
      console.log(
        '[UserService] 调试 - 响应数据类型:',
        typeof response.data,
        Array.isArray(response.data),
      )
      console.log('[UserService] 调试 - 响应数据:', response.data)

      // 检查响应类型并适配
      if (Array.isArray(response.data)) {
        // 如果响应是数组，构建标准格式
        return {
          status: 'success',
          data: response.data,
          pagination: {
            total: response.data.length,
            page: 1,
            limit: 10,
            pages: Math.ceil(response.data.length / 10),
          },
        }
      } else if (response.data && response.data.status === 'success') {
        // 如果响应已经是标准格式，直接返回
        return response.data
      }

      return null
    } catch (error) {
      console.error('[UserService] 调试错误:', error)
      return null
    }
  },

  /**
   * 清除用户数据缓存
   */
  clearCache: () => {
    userService._cache.users.clear()
    userService._cache.timestamp = 0
    console.log('用户数据缓存已清除')
  },

  /**
   * 获取指定用户详情
   * @param {string} userId - 用户 ID
   * @returns {Promise<Object>} 用户详情
   */
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}`)

      // 检查响应结构并适配
      if (response && response.status === 'success') {
        // 标准格式，直接返回
        return response
      } else if (response) {
        // 如果响应没有标准格式，进行适配
        return {
          status: 'success',
          data: {
            user: response.user || response.data || response || {},
          },
        }
      } else {
        // 没有响应数据
        return {
          status: 'error',
          message: '获取用户详情失败：服务器没有返回数据',
        }
      }
    } catch (error) {
      console.error('获取用户详情错误:', error)
      return {
        status: 'error',
        message: error.message || '获取用户详情失败',
      }
    }
  },

  /**
   * 使用分页限制获取用户列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码，默认为 1
   * @param {number} params.limit - 每页数量，默认为 10
   * @param {string} params.role - 按角色筛选，可选值: "parent", "teacher", "admin"
   * @param {string} params.status - 按状态筛选，可选值: "active", "inactive", "suspended"
   * @param {string} params.search - 搜索关键词
   * @param {string} params.sortBy - 排序字段
   * @param {string} params.sortOrder - 排序方向，可选值: "asc", "desc"
   * @returns {Promise<Object>} 用户列表和分页信息
   */
  getUsersByLimit: async (params = {}) => {
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

      console.log('[UserService] 使用分页限制获取用户数据', cleanParams)

      // 发送 API 请求到新的分页接口
      const response = await api.get('/admin/users/limit', { params: cleanParams })

      // 调试输出
      console.log('[UserService] 分页接口响应:', response)

      // 处理响应 - 注意：response 已经是响应数据本身，不需要再访问 .data
      if (response && response.status === 'success') {
        return response
      } else {
        // 处理错误情况
        return {
          status: 'error',
          message: response?.message || '获取用户列表失败',
        }
      }
    } catch (error) {
      console.error('[UserService] 分页获取用户列表错误:', error)
      return {
        status: 'error',
        message: error.message || '获取用户列表失败',
      }
    }
  },

  /**
   * 更新用户信息
   * @param {string} userId - 用户 ID
   * @param {Object} userData - 更新的用户数据
   * @returns {Promise<Object>} 更新后的用户信息
   */
  updateUser: async (userId, userData) => {
    try {
      const response = await api.patch(`/admin/users/${userId}`, userData)

      // 更新成功后清除缓存
      userService.clearCache()

      if (response && response.status === 'success') {
        return response
      } else if (response) {
        return {
          status: 'success',
          data: {
            user: response.user || response.data || response || {},
          },
        }
      } else {
        return {
          status: 'error',
          message: '更新用户信息失败：服务器没有返回数据',
        }
      }
    } catch (error) {
      console.error('更新用户信息错误:', error)
      return {
        status: 'error',
        message: error.message || '更新用户信息失败',
      }
    }
  },

  /**
   * 删除用户
   * @param {string} userId - 用户 ID
   * @returns {Promise<Object>} 操作结果
   */
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/admin/users/${userId}`)

      // 删除成功后清除缓存
      userService.clearCache()

      // 删除成功可能返回 204 状态码，没有响应体
      if (!response) {
        return {
          status: 'success',
          message: '用户删除成功',
        }
      }

      return response.status === 'success'
        ? response
        : { status: 'success', message: '用户删除成功' }
    } catch (error) {
      console.error('删除用户错误:', error)
      return {
        status: 'error',
        message: error.message || '删除用户失败',
      }
    }
  },

  /**
   * 更新用户状态
   * @param {string} userId - 用户 ID
   * @param {string} status - 新状态，可选值: "active", "inactive", "suspended"
   * @returns {Promise<Object>} 更新后的用户信息
   */
  updateUserStatus: async (userId, status) => {
    try {
      const response = await api.patch(`/admin/users/${userId}/status`, { status })

      // 更新成功后清除缓存
      userService.clearCache()

      if (response && response.status === 'success') {
        return response
      } else if (response) {
        return {
          status: 'success',
          data: {
            user: response.user || response.data || response || {},
          },
        }
      } else {
        return {
          status: 'error',
          message: '更新用户状态失败：服务器没有返回数据',
        }
      }
    } catch (error) {
      console.error('更新用户状态错误:', error)
      return {
        status: 'error',
        message: error.message || '更新用户状态失败',
      }
    }
  },

  /**
   * 更新用户角色
   * @param {string} userId - 用户 ID
   * @param {string} role - 新角色，可选值: "parent", "teacher", "admin"
   * @returns {Promise<Object>} 更新后的用户信息
   */
  updateUserRole: async (userId, role) => {
    try {
      const response = await api.patch(`/admin/users/${userId}/role`, { role })

      // 更新成功后清除缓存
      userService.clearCache()

      if (response && response.status === 'success') {
        return response
      } else if (response) {
        return {
          status: 'success',
          data: {
            user: response.user || response.data || response || {},
          },
        }
      } else {
        return {
          status: 'error',
          message: '更新用户角色失败：服务器没有返回数据',
        }
      }
    } catch (error) {
      console.error('更新用户角色错误:', error)
      return {
        status: 'error',
        message: error.message || '更新用户角色失败',
      }
    }
  },
}

export default userService
