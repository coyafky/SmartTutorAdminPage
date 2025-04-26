import { defineStore } from 'pinia'
import { parentService } from '../services/parentService'

// 家长数据存储
export const useParentStore = defineStore({
  id: 'parent',
  
  state: () => ({
    // 家长列表
    parents: [],
    // 分页信息
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0
    },
    // 当前选中的家长
    currentParent: null,
    // 家长统计数据
    statistics: null,
    // 加载状态
    loading: false,
    // 错误信息
    error: null
  }),
  
  actions: {
    /**
     * 获取家长列表
     * @param {Object} params - 查询参数
     */
    async fetchParents(params = {}) {
      this.loading = true
      this.error = null
      
      try {
        const response = await parentService.getParentsByLimit(params)
        
        if (response.status === 'success') {
          this.parents = response.data || []
          this.pagination = response.pagination || {
            page: 1,
            limit: 10,
            total: 0,
            pages: 0
          }
        } else {
          this.error = response.message || '获取家长列表失败'
          console.error('获取家长列表失败:', this.error)
        }
      } catch (error) {
        this.error = error.message || '获取家长列表失败'
        console.error('获取家长列表失败:', error)
      } finally {
        this.loading = false
      }
    },
    
    /**
     * 获取家长详情
     * @param {string} parentId - 家长ID
     */
    async fetchParentById(parentId) {
      this.loading = true
      this.error = null
      
      try {
        const response = await parentService.getParentById(parentId)
        
        if (response.status === 'success') {
          this.currentParent = response.data
        } else {
          this.error = response.message || '获取家长详情失败'
          console.error(`获取家长详情失败 (ID=${parentId}):`, this.error)
        }
      } catch (error) {
        this.error = error.message || '获取家长详情失败'
        console.error(`获取家长详情失败 (ID=${parentId}):`, error)
      } finally {
        this.loading = false
      }
      
      return this.currentParent
    },
    
    /**
     * 按城市获取家长
     * @param {string} cityName - 城市名称
     */
    async fetchParentsByCity(cityName) {
      this.loading = true
      this.error = null
      
      try {
        const response = await parentService.getParentsByCity(cityName)
        
        if (response.status === 'success') {
          this.parents = response.data || []
        } else {
          this.error = response.message || '获取城市家长失败'
          console.error(`获取城市家长失败 (城市=${cityName}):`, this.error)
        }
      } catch (error) {
        this.error = error.message || '获取城市家长失败'
        console.error(`获取城市家长失败 (城市=${cityName}):`, error)
      } finally {
        this.loading = false
      }
      
      return this.parents
    },
    
    /**
     * 更新家长状态
     * @param {string} parentId - 家长ID
     * @param {string} status - 新状态
     */
    async updateParentStatus(parentId, status) {
      this.loading = true
      this.error = null
      
      try {
        const response = await parentService.updateParentStatus(parentId, status)
        
        if (response.status === 'success') {
          // 如果是当前选中的家长，更新其状态
          if (this.currentParent && this.currentParent.parentId === parentId) {
            this.currentParent.status = status
          }
          
          // 更新列表中的家长状态
          const index = this.parents.findIndex(p => p.parentId === parentId)
          if (index !== -1) {
            this.parents[index].status = status
          }
          
          return response.data
        } else {
          this.error = response.message || '更新家长状态失败'
          console.error(`更新家长状态失败 (ID=${parentId}):`, this.error)
        }
      } catch (error) {
        this.error = error.message || '更新家长状态失败'
        console.error(`更新家长状态失败 (ID=${parentId}):`, error)
      } finally {
        this.loading = false
      }
      
      return null
    },
    
    /**
     * 获取家长统计数据
     */
    async fetchParentStatistics() {
      this.loading = true
      this.error = null
      
      try {
        const response = await parentService.getParentStatistics()
        
        if (response.status === 'success') {
          this.statistics = response.data
        } else {
          this.error = response.message || '获取家长统计数据失败'
          console.error('获取家长统计数据失败:', this.error)
        }
      } catch (error) {
        this.error = error.message || '获取家长统计数据失败'
        console.error('获取家长统计数据失败:', error)
      } finally {
        this.loading = false
      }
      
      return this.statistics
    }
  }
})
