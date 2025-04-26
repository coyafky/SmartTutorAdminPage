<template>
  <AdminLayout>
    <div class="container mx-auto px-4 py-6">
    <!-- 返回按钮 -->
    <button 
      @click="goBack" 
      class="mb-4 inline-flex items-center text-gray-300 hover:text-primary-400 transition duration-150 ease-in-out"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      返回家长列表
    </button>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-primary-600" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- 找不到家长 -->
    <div v-else-if="!parent" class="bg-gray-800 rounded-lg shadow-md border border-gray-700 p-8 text-center">
      <div class="flex flex-col items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 13a4 4 0 100-8 4 4 0 000 8z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-300 mb-1">未找到家长资料</h3>
        <p class="text-gray-400">找不到该家长的资料，或者家长ID无效</p>
        <button 
          @click="goBack" 
          class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          返回列表
        </button>
      </div>
    </div>

    <!-- 家长详情内容 -->
    <div v-else>
      <!-- 基本信息卡片 -->
      <div class="mb-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- 左侧信息 -->
        <div class="bg-gray-800 rounded-lg shadow-md border border-gray-700 p-6">
          <div class="flex flex-col items-center">
            <div class="h-24 w-24 bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <span v-if="!parent.avatar" class="text-4xl font-semibold text-gray-300">{{ parent.nickname ? parent.nickname.charAt(0) : '?' }}</span>
              <img v-else :src="parent.avatar" alt="头像" class="h-24 w-24 rounded-full" />
            </div>
            <h2 class="text-xl font-semibold text-white">{{ parent.nickname || '未命名家长' }}</h2>
            <p class="text-gray-400 mb-2">{{ parent.parentId }}</p>
            <div class="mt-2">
              <span
                :class="[
                  'px-3 py-1 text-sm font-medium rounded-full',
                  parent.status === 'active' ? 'bg-green-900 text-green-300' : 
                  parent.status === 'pending' ? 'bg-yellow-900 text-yellow-300' : 
                  parent.status === 'suspended' ? 'bg-red-900 text-red-300' : 
                  'bg-gray-700 text-gray-300'
                ]"
              >
                {{ getStatusText(parent.status) }}
              </span>
            </div>
          </div>
          
          <div class="mt-6 border-t border-gray-700 pt-4">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-300">状态管理</h3>
            </div>
            
            <div class="flex flex-col space-y-2">
              <button 
                v-if="parent.status !== 'active'" 
                @click="updateStatus('active')" 
                class="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded transition duration-150 ease-in-out flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                激活账户
              </button>
              <button 
                v-if="parent.status !== 'suspended'" 
                @click="updateStatus('suspended')"
                class="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded transition duration-150 ease-in-out flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                暂停账户
              </button>
            </div>
          </div>
        </div>
        
        <!-- 右侧信息 -->
        <div class="lg:col-span-3">
          <!-- 家长资料详情 -->
          <div class="bg-gray-800 rounded-lg shadow-md border border-gray-700 mb-6">
            <div class="px-6 py-4 border-b border-gray-700">
              <h3 class="text-lg font-medium text-gray-300">家长资料</h3>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p class="text-sm text-gray-400 mb-1">位置信息</p>
                  <p class="font-medium text-white">{{ parent.location?.city || '未知' }} {{ parent.location?.district || '' }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-400 mb-1">家长职业</p>
                  <p class="font-medium text-white">{{ parent.additionalInfo?.occupation || '未设置' }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-400 mb-1">教育背景</p>
                  <p class="font-medium text-white">{{ parent.additionalInfo?.educationLevel || '未设置' }}</p>
                </div>
              </div>
              
              <!-- 家教偏好 -->
              <div class="mt-6">
                <h4 class="text-md font-medium mb-3 text-gray-300">教学偏好</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-gray-400 mb-1">教学风格</p>
                    <div class="flex flex-wrap gap-2">
                      <span 
                        v-for="(style, index) in parent.preferences?.teachingStyle" 
                        :key="index"
                        class="px-2 py-1 bg-blue-900 text-blue-300 text-xs rounded-full"
                      >
                        {{ style }}
                      </span>
                      <span v-if="!parent.preferences?.teachingStyle?.length" class="text-gray-500">未设置</span>
                    </div>
                  </div>
                  <div>
                    <p class="text-sm text-gray-400 mb-1">教学地点</p>
                    <p class="font-medium text-white">{{ parent.preferences?.teachingLocation || '未设置' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-400 mb-1">教师性别要求</p>
                    <p class="font-medium text-white">{{ parent.preferences?.teacherGenderPreference || '不限' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-400 mb-1">预算范围</p>
                    <p class="font-medium text-white" v-if="parent.preferences?.budgetRange">
                      {{ parent.preferences.budgetRange.min }}元 - {{ parent.preferences.budgetRange.max }}元
                      <span class="text-sm text-gray-400">
                        ({{ parent.preferences.budgetRange.period === 'per_hour' ? '每小时' : '每节课' }})
                      </span>
                    </p>
                    <p v-else class="text-gray-500">未设置</p>
                  </div>
                </div>
              </div>
              
              <!-- 可用时间 -->
              <div class="mt-6">
                <h4 class="text-md font-medium mb-3 text-gray-300">可用时间</h4>
                <div class="flex flex-wrap gap-2">
                  <span 
                    v-for="(time, index) in parent.additionalInfo?.availableTimes" 
                    :key="index"
                    class="px-2 py-1 bg-green-900 text-green-300 text-xs rounded-full"
                  >
                    {{ time }}
                  </span>
                  <span v-if="!parent.additionalInfo?.availableTimes?.length" class="text-gray-500">未设置</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 孩子信息 -->
          <div class="bg-gray-800 rounded-lg shadow-md border border-gray-700">
            <div class="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
              <h3 class="text-lg font-medium text-gray-300">孩子信息</h3>
              <span class="bg-blue-900 text-blue-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {{ parent.children?.length || 0 }} 个孩子
              </span>
            </div>
            <div class="p-6">
              <div v-if="!parent.children || parent.children.length === 0" class="text-center py-8 text-gray-400">
                <p>该家长暂未添加任何孩子信息</p>
              </div>
              <div v-else class="space-y-6">
                <div 
                  v-for="child in parent.children" 
                  :key="child.childId" 
                  class="border border-gray-700 rounded-lg p-4"
                >
                  <div class="flex justify-between items-start mb-4">
                    <div>
                      <h4 class="text-lg font-medium text-white">{{ child.nickname || '未命名孩子' }}</h4>
                      <p class="text-gray-400 text-sm">{{ child.childId }}</p>
                    </div>
                    <span class="bg-indigo-900 text-indigo-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      {{ child.grade || '未知年级' }}
                    </span>
                  </div>
                  
                  <!-- 学科列表 -->
                  <div>
                    <h5 class="text-sm font-medium text-gray-500 mb-2">学科列表</h5>
                    <div v-if="!child.subjects || child.subjects.length === 0" class="text-sm text-gray-400">
                      暂无学科信息
                    </div>
                    <div v-else class="space-y-2">
                      <div 
                        v-for="subject in child.subjects" 
                        :key="subject._id" 
                        class="grid grid-cols-4 gap-4 text-sm py-2 border-b border-gray-100 last:border-0"
                      >
                        <div>
                          <span class="text-gray-500">科目: </span>
                          <span class="font-medium">{{ subject.name }}</span>
                        </div>
                        <div>
                          <span class="text-gray-500">当前: </span>
                          <span class="font-medium">{{ subject.currentScore }}</span>
                        </div>
                        <div>
                          <span class="text-gray-500">目标: </span>
                          <span class="font-medium">{{ subject.targetScore }}</span>
                        </div>
                        <div>
                          <span 
                            :class="[
                              'px-2 py-0.5 text-xs font-medium rounded-full',
                              subject.difficulty === '简单' ? 'bg-green-100 text-green-800' : 
                              subject.difficulty === '中等' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'
                            ]"
                          >
                            {{ subject.difficulty }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  </AdminLayout>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { parentService } from '../services/parentService'
import AdminLayout from '../layouts/AdminLayout.vue'

export default {
  name: 'ParentDetailView',
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    const parentId = route.params.id
    const parent = ref(null)
    const loading = ref(true)
    
    // 获取家长详情
    const loadParentDetails = async () => {
      loading.value = true
      try {
        const response = await parentService.getParentById(parentId)
        if (response.status === 'success') {
          parent.value = response.data
        }
      } catch (error) {
        console.error(`获取家长详情失败 (ID=${parentId}):`, error)
      } finally {
        loading.value = false
      }
    }
    
    // 返回列表
    const goBack = () => {
      router.push({ name: 'parents' })
    }
    
    // 更新家长状态
    const updateStatus = async (status) => {
      loading.value = true
      try {
        const response = await parentService.updateParentStatus(parentId, status)
        if (response.status === 'success') {
          parent.value.status = status
        }
      } catch (error) {
        console.error(`更新家长状态失败 (ID=${parentId}):`, error)
      } finally {
        loading.value = false
      }
    }
    
    // 获取状态显示文本
    const getStatusText = (status) => {
      switch(status) {
        case 'active': return '活跃'
        case 'inactive': return '不活跃'
        case 'suspended': return '已暂停'
        case 'pending': return '待审核'
        default: return status || '未知'
      }
    }
    
    // 组件挂载时加载数据
    onMounted(() => {
      loadParentDetails()
    })
    
    return {
      parent,
      loading,
      goBack,
      updateStatus,
      getStatusText
    }
  }
}
</script>
