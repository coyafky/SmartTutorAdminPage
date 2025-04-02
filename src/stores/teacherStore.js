import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import teacherService from '../services/teacherService'

export const useTeacherStore = defineStore('teacher', () => {
  // 状态
  const allTeachers = ref([])
  const loading = ref(false)
  const error = ref(null)
  const filters = ref({
    status: '',
    verified: '',
    city: '',
    sort: 'newest',
    page: 1,
    limit: 10,
  })
  const pagination = ref({
    total: 0,
    limit: 10,
    page: 1,
    pages: 0,
  })

  // 计算属性
  const filteredTeachers = computed(() => {
    if (!allTeachers.value.length) {
      return []
    }

    let result = [...allTeachers.value]
    
    // 状态筛选
    if (filters.value.status) {
      result = result.filter((teacher) => teacher.status === filters.value.status)
    }
    
    // 认证状态筛选
    if (filters.value.verified !== '') {
      const verifiedStatus = filters.value.verified === 'true'
      result = result.filter((teacher) => teacher.verified === verifiedStatus)
    }
    
    // 城市筛选
    if (filters.value.city) {
      const cityLower = filters.value.city.toLowerCase()
      result = result.filter((teacher) => 
        teacher.city?.toLowerCase().includes(cityLower) || 
        teacher.location?.city?.toLowerCase().includes(cityLower)
      )
    }
    
    // 排序
    if (filters.value.sort === 'newest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else if (filters.value.sort === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    }
    
    return result
  })

  // 分页后的教师
  const paginatedTeachers = computed(() => {
    const startIndex = (filters.value.page - 1) * pagination.value.limit
    const endIndex = startIndex + pagination.value.limit
    
    // 更新分页信息
    pagination.value.total = filteredTeachers.value.length
    pagination.value.pages = Math.ceil(filteredTeachers.value.length / pagination.value.limit)
    
    return filteredTeachers.value.slice(startIndex, endIndex)
  })

  // 统计信息
  const statistics = computed(() => {
    return {
      total: allTeachers.value.length,
      active: allTeachers.value.filter((t) => t.status === 'active').length,
      inactive: allTeachers.value.filter((t) => t.status === 'inactive').length,
      suspended: allTeachers.value.filter((t) => t.status === 'suspended').length,
      verified: allTeachers.value.filter((t) => t.verified === true).length,
      unverified: allTeachers.value.filter((t) => t.verified === false).length,
    }
  })

  // 方法
  async function fetchAllTeachers() {
    loading.value = true
    error.value = null
    
    try {
      const response = await teacherService.getAllTeachers()
      
      if (response && response.status === 'success' && response.data) {
        allTeachers.value = response.data.tutors || []
        
        // 更新分页信息
        if (response.data.pagination) {
          pagination.value = response.data.pagination
        } else {
          pagination.value = {
            total: allTeachers.value.length,
            page: 1,
            limit: filters.value.limit,
            pages: Math.ceil(allTeachers.value.length / filters.value.limit),
          }
        }
        
        return {
          status: 'success',
          data: {
            tutors: allTeachers.value,
            pagination: pagination.value,
          },
        }
      } else {
        error.value = response?.message || '获取教师列表失败'
        return {
          status: 'error',
          message: error.value,
        }
      }
    } catch (err) {
      error.value = err.message || '获取教师列表失败'
      return {
        status: 'error',
        message: error.value,
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * 分页获取教师列表
   * @param {Object} overrideParams - 覆盖默认筛选参数的对象
   * @returns {Promise<Object>} 包含教师列表和分页信息的响应
   */
  async function fetchTeachersByLimit(overrideParams = {}) {
    loading.value = true
    error.value = null
    
    try {
      // 构建查询参数
      const params = {
        page: filters.value.page,
        limit: filters.value.limit,
        status: filters.value.status || undefined,
        isVerified: filters.value.verified || undefined,
        city: filters.value.city || undefined,
        ...overrideParams // 使用传入的参数覆盖默认值
      }
      
      console.log('[TeacherStore] 发送请求参数:', params)
      
      // 调用服务方法
      const response = await teacherService.getTeachersByLimit(params)
      
      console.log('[TeacherStore] 从服务接收到的响应:', response)
      
      if (response && response.status === 'success') {
        // 处理教师数据
        let tutorsData = [];
        
        // 处理不同的数据结构
        if (response.data && Array.isArray(response.data)) {
          // 如果 data 是数组，直接使用
          tutorsData = response.data;
          console.log('[TeacherStore] 使用数组数据:', tutorsData);
        } else if (response.data && Array.isArray(response.data.data)) {
          // 如果 data.data 是数组
          tutorsData = response.data.data;
          console.log('[TeacherStore] 使用嵌套数组数据:', tutorsData);
        }
        
        // 更新教师列表
        allTeachers.value = tutorsData;
        
        // 处理分页信息
        let paginationData = null;
        
        if (response.pagination) {
          // 如果分页信息在顶层
          paginationData = response.pagination;
          console.log('[TeacherStore] 使用顶层分页信息:', paginationData);
        } else if (response.data && response.data.pagination) {
          // 如果分页信息在 data 中
          paginationData = response.data.pagination;
          console.log('[TeacherStore] 使用嵌套分页信息:', paginationData);
        } else {
          // 使用默认分页信息
          paginationData = {
            total: tutorsData.length || 0,
            page: filters.value.page,
            limit: filters.value.limit,
            pages: Math.ceil((tutorsData.length || 0) / filters.value.limit)
          };
          console.log('[TeacherStore] 使用默认分页信息:', paginationData);
        }
        
        // 更新分页信息
        pagination.value = paginationData;
        
        // 返回标准格式的数据
        return {
          status: 'success',
          data: {
            tutors: tutorsData,
            pagination: paginationData,
          },
        }
      } else {
        error.value = response?.message || '分页获取教师列表失败'
        return {
          status: 'error',
          message: error.value,
        }
      }
    } catch (err) {
      error.value = err.message || '分页获取教师列表失败'
      return {
        status: 'error',
        message: error.value,
      }
    } finally {
      loading.value = false
    }
  }

  async function getTeachersByCity(city, params = {}) {
    try {
      // 先获取所有教师，然后在前端筛选
      if (allTeachers.value.length === 0) {
        await fetchAllTeachers()
      }
      
      // 手动筛选城市
      updateFilters({ city })
      
      return {
        status: 'success',
        data: {
          tutors: filteredTeachers.value,
          pagination: {
            total: filteredTeachers.value.length,
            page: filters.value.page,
            limit: filters.value.limit,
            pages: Math.ceil(filteredTeachers.value.length / filters.value.limit),
          },
        },
      }
    } catch (err) {
      console.error('按城市获取教师错误:', err)
      return { status: 'error', message: '按城市获取教师失败' }
    }
  }

  async function getTeacherById(tutorId) {
    try {
      // 先检查本地缓存
      const cachedTeacher = allTeachers.value.find(t => t.tutorId === tutorId || t._id === tutorId)
      
      if (cachedTeacher) {
        return {
          status: 'success',
          data: { tutor: cachedTeacher },
        }
      }
      
      // 如果本地没有，则从服务器获取
      const response = await teacherService.getTeacherById(tutorId)
      
      if (response.status === 'success') {
        // 更新本地缓存
        const existingIndex = allTeachers.value.findIndex(t => t.tutorId === tutorId || t._id === tutorId)
        if (existingIndex !== -1) {
          allTeachers.value[existingIndex] = response.data.tutor
        } else {
          allTeachers.value.push(response.data.tutor)
        }
      }
      
      return response
    } catch (err) {
      console.error('获取教师详情错误:', err)
      return { status: 'error', message: '获取教师详情失败' }
    }
  }

  async function verifyTeacher(tutorId, verified, verificationNote) {
    try {
      const response = await teacherService.verifyTeacher(tutorId, verified, verificationNote)
      
      if (response.status === 'success') {
        // 更新本地教师数据
        const teacherIndex = allTeachers.value.findIndex(t => t.tutorId === tutorId || t._id === tutorId)
        
        if (teacherIndex !== -1) {
          allTeachers.value[teacherIndex] = {
            ...allTeachers.value[teacherIndex],
            verified,
            verificationNote,
            verifiedAt: verified ? new Date().toISOString() : null,
          }
        }
        
        return { success: true, data: response.data }
      }
      
      return { success: false, message: response.message || '认证教师失败' }
    } catch (err) {
      console.error('认证教师错误:', err)
      return { success: false, message: '认证教师时发生错误' }
    }
  }

  async function updateTeacherStatus(tutorId, status, statusNote) {
    try {
      const response = await teacherService.updateTeacherStatus(tutorId, status, statusNote)
      
      if (response.status === 'success') {
        // 更新本地教师数据
        const teacherIndex = allTeachers.value.findIndex(t => t.tutorId === tutorId || t._id === tutorId)
        
        if (teacherIndex !== -1) {
          allTeachers.value[teacherIndex] = {
            ...allTeachers.value[teacherIndex],
            status,
            statusNote,
            statusUpdatedAt: new Date().toISOString(),
          }
        }
        
        return { success: true, data: response.data }
      }
      
      return { success: false, message: response.message || '更新教师状态失败' }
    } catch (err) {
      console.error('更新教师状态错误:', err)
      return { success: false, message: '更新教师状态时发生错误' }
    }
  }

  /**
   * 更改页码
   * @param {number} page - 新的页码
   */
  function changePage(page) {
    if (page < 1) return
    filters.value.page = page
    console.log('[TeacherStore] 页码已更改为:', page)
  }

  function updateFilters(newFilters) {
    filters.value = {
      ...filters.value,
      ...newFilters,
    }
    
    // 如果更新了筛选条件，重置到第一页
    if (newFilters.status !== undefined || newFilters.verified !== undefined || newFilters.city !== undefined) {
      filters.value.page = 1
    }
  }

  function resetFilters() {
    filters.value = {
      status: '',
      verified: '',
      city: '',
 
      page: 1,
      limit: 10,
    }
  }

  return {
    // 状态
    allTeachers,
    loading,
    error,
    filters,
    pagination,
    statistics,
    
    // 计算属性
    filteredTeachers,
    paginatedTeachers,
    
    // 方法
    fetchAllTeachers,
    fetchTeachersByLimit,
    getTeachersByCity,
    getTeacherById,
    verifyTeacher,
    updateTeacherStatus,
    updateFilters,
    resetFilters,
    changePage,
  }
})
