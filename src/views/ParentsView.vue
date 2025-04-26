<template>
  <AdminLayout>
    <div class="container mx-auto px-2 py-4">
      <div class="flex flex-col items-center mb-4">
        <div>
          <h1 class="text-xl font-semibold text-white">家长管理</h1>
          <p class="text-sm text-gray-400">查看和管理家长用户</p>
        </div>
      </div>

    <!-- 筛选控件 -->
    <div class="flex flex-wrap gap-2 bg-gray-900 rounded-lg mb-4 p-3 border border-gray-700 items-end">
      <div class="w-36">
        <select
          v-model="filters.status"
          class="w-full h-9 rounded bg-gray-800 border-gray-700 text-white text-sm px-3 focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
          @change="loadParents"
        >
          <option value="">全部状态</option>
          <option value="active">活跃</option>
          <option value="inactive">不活跃</option>
          <option value="suspended">已暂停</option>
        </select>
      </div>

      <div class="w-36">
        <select
          v-model="filters.city"
          class="w-full h-9 rounded bg-gray-800 border-gray-700 text-white text-sm px-3 focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
          @change="loadParents"
        >
          <option value="">全部城市</option>
          <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
        </select>
      </div>
      
      <div class="flex-grow relative">
        <input
          type="text"
          v-model="filters.search"
          placeholder="搜索家长姓名、ID、孩子信息"
          class="w-full h-9 pl-9 pr-3 rounded bg-gray-800 border-gray-700 text-white text-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
          @keyup.enter="loadParents"
        />
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>
      
      <button 
        @click="loadParents"
        class="h-9 px-4 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded transition-colors flex items-center"
      >
        筛选
      </button>
      
      <button 
        @click="resetFilters"
        class="h-9 px-3 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors flex items-center"
      >
        重置
      </button>
    </div>

    <!-- 家长列表表格 -->
    <div v-if="loading" class="bg-gray-900 rounded-lg shadow p-6 text-center mb-4">
      <div class="flex justify-center">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
      <p class="text-gray-400 mt-3 text-sm">正在加载家长数据...</p>
    </div>

    <div v-else-if="parents.length === 0" class="bg-gray-900 rounded-lg shadow p-6 text-center mb-4">
      <div class="flex flex-col items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 13a4 4 0 100-8 4 4 0 000 8z" />
        </svg>
        <h3 class="text-base font-medium text-gray-300 mb-1">未找到家长</h3>
        <p class="text-sm text-gray-500 mb-3">没有符合筛选条件的家长</p>
        <button 
          @click="resetFilters" 
          class="px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded"
        >
          重置筛选
        </button>
      </div>
    </div>

    <div v-else class="bg-gray-900 rounded-lg overflow-hidden border border-gray-700 mb-4">
      <table class="w-full divide-y divide-gray-800">
        <thead>
          <tr>
            <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-400 tracking-wider">家长信息</th>
            <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-400 tracking-wider">所在城市</th>
            <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-400 tracking-wider">孩子年级</th>
            <th scope="col" class="px-3 py-2 text-center text-xs font-medium text-gray-400 tracking-wider">状态</th>
            <th scope="col" class="px-3 py-2 text-center text-xs font-medium text-gray-400 tracking-wider">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-800">
          <tr v-for="parent in parents" :key="parent.parentId" class="hover:bg-gray-800">
            <td class="px-3 py-3 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                  <span class="text-base text-gray-300">{{ parent.name ? parent.name.charAt(0) : '?' }}</span>
                </div>
                <div class="ml-3">
                  <div class="text-sm font-medium text-white">{{ parent.name || parent.nickname || '未命名' }}</div>
                  <div class="text-xs text-gray-400">{{ parent.parentId }}</div>
                </div>
              </div>
            </td>
            <td class="px-3 py-3 whitespace-nowrap">
              <div class="text-sm text-white">{{ parent.location?.city || '未知' }}</div>
              <div class="text-xs text-gray-400">{{ parent.location?.district || '' }}</div>
            </td>
            <td class="px-3 py-3 whitespace-nowrap">
              <div v-if="parent.children && parent.children.length > 0" class="text-xs text-gray-300 space-y-1">
                <div v-for="(child, index) in parent.children.slice(0, 2)" :key="index" class="flex items-center">
                  <span>{{ child.grade }}</span>
                  <span class="mx-1">-</span>
                  <span>{{ child.gender === 'male' ? '男生' : '女生' }}</span>
                </div>
                <div v-if="parent.children.length > 2" class="text-xs text-gray-400">+{{ parent.children.length - 2 }} 个孩子</div>
              </div>
              <div v-else class="text-xs text-gray-400">暂无孩子信息</div>
            </td>
            <td class="px-3 py-3 whitespace-nowrap text-center">
              <span 
                :class="{
                  'px-1.5 py-0.5 inline-flex text-xs leading-4 font-medium rounded': true,
                  'bg-green-900 text-green-300': parent.status === 'active',
                  'bg-yellow-900 text-yellow-300': parent.status === 'inactive',
                  'bg-red-900 text-red-300': parent.status === 'suspended',
                  'bg-gray-700 text-gray-300': parent.status === 'pending' || !parent.status
                }"
              >
                {{ getStatusText(parent.status) }}
              </span>
            </td>
            <td class="px-3 py-3 whitespace-nowrap text-center">
              <div class="flex justify-center space-x-2">
                <button 
                  @click="viewParentDetails(parent.parentId)"
                  class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                >
                  查看
                </button>
                <button 
                  v-if="parent.status !== 'suspended'"
                  @click="updateStatus(parent.parentId, 'suspended')"
                  class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                >
                  暂停
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页控件 -->
    <div class="flex items-center justify-between mt-4 text-xs text-gray-400">
      <div>
        共 <span class="font-medium">{{ pagination.total || 0 }}</span> 条记录
        |
        第 <span class="font-medium">{{ pagination.page }}</span> / {{ pagination.pages }} 页
      </div>
      <div class="flex space-x-1">
        <button 
          @click="changePage(pagination.page - 1)" 
          :disabled="pagination.page <= 1"
          :class="[
            'px-2 py-1 rounded text-xs',
            pagination.page <= 1 
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          ]"
        >
          上一页
        </button>
        <button 
          @click="changePage(pagination.page + 1)" 
          :disabled="pagination.page >= pagination.pages"
          :class="[
            'px-2 py-1 rounded text-xs',
            pagination.page >= pagination.pages 
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          ]"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { parentService } from '../services/parentService'
import AdminLayout from '../layouts/AdminLayout.vue'

const router = useRouter()

// 数据状态
const parents = ref([])
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  pages: 0
})
const loading = ref(false)

// 筛选条件
const filters = reactive({
  page: 1,
  limit: 10,
  status: '',
  city: '',
  search: '',
})

// 可选城市列表
const cities = ref([
  '北京', '上海', '广州', '深圳', '杭州', 
  '南京', '武汉', '成都', '西安', 
])

// 加载家长数据
const loadParents = async () => {
  loading.value = true
  try {
    const response = await parentService.getParentsByLimit(filters)
    if (response.status === 'success') {
      parents.value = response.data || []
      pagination.value = response.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
      }
    } else {
      console.error('获取家长列表失败:', response.message)
    }
  } catch (error) {
    console.error('加载家长数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 重置筛选条件
const resetFilters = () => {
  filters.status = ''
  filters.city = ''
  filters.search = ''
  filters.page = 1
  loadParents()
}

// 修改页码
const changePage = (newPage) => {
  if (newPage < 1 || newPage > pagination.value.pages) return
  filters.page = newPage
  loadParents()
}

// 查看家长详情
const viewParentDetails = (parentId) => {
  router.push({ name: 'parent-detail', params: { id: parentId } })
}

// 更新家长状态
const updateStatus = async (parentId, status) => {
  loading.value = true
  try {
    const response = await parentService.updateParentStatus(parentId, status)
    if (response.status === 'success') {
      // 更新本地数据状态
      const index = parents.value.findIndex(p => p.parentId === parentId)
      if (index !== -1) {
        parents.value[index].status = status
      }
      // 更新成功后重新加载数据
      await loadParents()
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
  loadParents()
})
</script>
