<template>
  <AdminLayout>
    <div class="teachers-view">
      <h1 class="text-2xl font-bold mb-6">教师管理</h1>

      <!-- 筛选和搜索区域 -->
      <div class="filter-section bg-gray-800 p-6 rounded-lg shadow-sm mb-6 border border-gray-100">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- 状态筛选 -->
          <div>
            <label class="block text-sm font-medium text-white mb-2">状态</label>
            <select
              v-model="filters.status"
              class="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            >
              <option value="">全部状态</option>
              <option value="active">活跃</option>
              <option value="inactive">未活跃</option>
              <option value="suspended">已封禁</option>
            </select>
          </div>
          
          <!-- 认证状态筛选 -->
          <div>
            <label class="block text-sm font-medium text-white mb-2">认证状态</label>
            <select
              v-model="filters.isVerified"
              class="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            >
              <option value="">全部</option>
              <option value="true">已认证</option>
              <option value="false">未认证</option>
            </select>
          </div>

          <!-- 操作按钮 -->
          <div class="flex items-end space-x-3">
            <button
              @click="resetFilters"
              class="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none transition duration-200"
            >
              重置
            </button>
            <button
              @click="loadTeachers()"
              class="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none transition duration-200"
            >
              筛选
            </button>
          </div>
        </div>
      </div>

      <!-- 教师列表 -->
      <div class="teachers-list mb-6">
        <div v-if="loading" class="flex justify-center py-10">
          <div class="loader"></div>
        </div>
        <div
          v-else-if="teachers.length === 0"
          class="bg-white p-10 rounded-lg shadow-sm border border-gray-100 text-center"
        >
          <p class="text-gray-500">没有找到符合条件的教师</p>
        </div>
        <div v-else>
          <TeacherItem
            v-for="teacher in teachers"
            :key="teacher._id || teacher.tutorId"
            :teacher="teacher"
          />
        </div>
      </div>

      <!-- 分页控件 -->
      <div class="pagination-controls flex justify-between items-center mt-6 bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-700">
        <div class="text-sm text-white">
          共 {{ pagination.total }} 条记录，当前第 {{ pagination.page }}/{{ pagination.pages }} 页
        </div>
        <div class="flex space-x-2">
          <button
            @click="changePage(pagination.page - 1)"
            :disabled="pagination.page <= 1"
            class="px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 focus:outline-none transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一页
          </button>
          <button
            v-for="page in paginationArray"
            :key="page"
            @click="changePage(page)"
            class="px-3 py-1 rounded-md border"
            :class="
              page === pagination.page
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            "
          >
            {{ page }}
          </button>
          <button
            @click="changePage(pagination.page + 1)"
            :disabled="pagination.page >= pagination.pages"
            class="px-3 py-1 rounded-md border border-gray-300 text-white hover:bg-gray-100 focus:outline-none transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import AdminLayout from '../layouts/AdminLayout.vue'
import TeacherItem from '../components/TeacherItem.vue'
import teacherService from '../services/teacherService'

// 初始化
const toast = useToast()

// 响应式状态
const teachers = ref([])
const loading = ref(false)
const error = ref(null)

// 筛选条件
const filters = ref({
  status: '',
  isVerified: '',
  search: ''
})

// 分页数据
const pagination = ref({
  total: 0,
  limit: 10,
  page: 1,
  pages: 0
})

// 计算属性 - 分页数组
const paginationArray = computed(() => {
  const { page, pages } = pagination
  const arr = []

  // 显示当前页和前后两页
  for (let i = Math.max(1, page - 2); i <= Math.min(pages, page + 2); i++) {
    arr.push(i)
  }

  return arr
})

// 生命周期钩子
onMounted(() => {
  loadTeachers()
})


// 加载教师列表
async function loadTeachers(forceRefresh = false) {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.limit,
      status: filters.value.status || undefined,
      isVerified: filters.value.isVerified || undefined,
      search: filters.value.search || undefined,
      forceRefresh // 是否强制刷新
    }
    
    console.log('[TeachersView] 请求参数:', params)
    
    // 使用新的分页接口方法
    const response = await teacherService.getTeachersByLimit(params)
    
    console.log('[TeachersView] API 原始响应数据:', response)
    
    if (response && response.status === 'success') {
      // 直接使用后端返回的数据
      teachers.value = response.data || []
      
      // 处理分页信息
      if (response.pagination) {
        pagination.value.total = response.pagination.total || 0
        pagination.value.page = response.pagination.page || 1
        pagination.value.limit = response.pagination.limit || 10
        pagination.value.pages = response.pagination.pages || 1
      }
      
      console.log('[TeachersView] 处理后的教师数据:', teachers.value)
      console.log('[TeachersView] 分页信息:', pagination.value)
    } else {
      error.value = response?.message || '获取教师列表失败'
      toast.error(error.value)
      teachers.value = []
    }
  } catch (err) {
    console.error('[TeachersView] 加载教师错误:', err)
    error.value = err.message || '获取教师列表失败'
    toast.error(error.value)
    teachers.value = []
  } finally {
    loading.value = false
  }
}

// 重置筛选条件
function resetFilters() {
  // 直接重置筛选条件对象
  filters.value = {
    status: '',
    isVerified: '',
    search: ''
  }
  
  // 重置分页到第一页
  pagination.value.page = 1
  
  // 重新加载数据
  loadTeachers()
}

function changePage(page) {
  if (page < 1 || page > pagination.value.pages) return
  
  console.log('[TeachersView] 切换到页码:', page, '当前页码:', pagination.value.page)
  
  // 更新分页对象的页码
  pagination.value.page = page
  
  // 加载新页的数据
  loadTeachers()
}

// 格式化函数
function formatDate(dateString) {
  if (!dateString) return '未知'

  const date = new Date(dateString)
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function formatLocation(teacher) {
  if (!teacher) return '未知'

  // 处理两种可能的数据结构
  if (teacher.location) {
    const { city, district } = teacher.location
    if (city && district) {
      return `${city} ${district}`
    } else if (city) {
      return city
    } else if (district) {
      return district
    }
  } else if (teacher.city) {
    return teacher.city
  }

  return '未知'
}


</script>

<style scoped>
.loader {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
