<template>
  <AdminLayout>
    <div class="teachers-view">
      <h1 class="text-2xl font-bold mb-6">教师管理</h1>

      <!-- 筛选和搜索区域 -->
      <div class="filter-section bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-100">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-2">状态</label>
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

          <div>
            <label class="block text-sm font-medium text-gray-600 mb-2">认证状态</label>
            <select
              v-model="filters.verified"
              class="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            >
              <option value="">全部</option>
              <option value="true">已认证</option>
              <option value="false">未认证</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-600 mb-2">城市</label>
            <input
              v-model="filters.city"
              type="text"
              placeholder="输入城市名称"
              class="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            />
          </div>

          <div class="flex items-end space-x-3">
            <button
              @click="resetFilters"
              class="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none transition duration-200"
            >
              重置
            </button>
            <button
              @click="loadTeachers"
              class="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none transition duration-200"
            >
              筛选
            </button>
          </div>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="stats-section grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div class="stat-card bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <p class="text-sm text-gray-500">总教师数</p>
          <p class="text-xl font-bold text-gray-800">{{ statistics.total }}</p>
        </div>
        <div class="stat-card bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <p class="text-sm text-gray-500">已认证</p>
          <p class="text-xl font-bold text-green-600">{{ statistics.verified }}</p>
        </div>
        <div class="stat-card bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <p class="text-sm text-gray-500">未认证</p>
          <p class="text-xl font-bold text-yellow-600">{{ statistics.unverified }}</p>
        </div>
        <div class="stat-card bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <p class="text-sm text-gray-500">活跃</p>
          <p class="text-xl font-bold text-blue-600">{{ statistics.active }}</p>
        </div>
        <div class="stat-card bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <p class="text-sm text-gray-500">未活跃</p>
          <p class="text-xl font-bold text-gray-600">{{ statistics.inactive }}</p>
        </div>
        <div class="stat-card bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <p class="text-sm text-gray-500">已封禁</p>
          <p class="text-xl font-bold text-red-600">{{ statistics.suspended }}</p>
        </div>
      </div>

      <!-- 快捷筛选按钮 -->
      <div class="quick-filters flex flex-wrap gap-2 mb-6">
        <button
          @click="applyFilter('all')"
          class="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 focus:outline-none transition duration-200"
        >
          所有教师
        </button>
        <button
          @click="applyFilter('unverified')"
          class="px-3 py-1 rounded-md bg-yellow-100 text-yellow-700 hover:bg-yellow-200 focus:outline-none transition duration-200"
        >
          待认证教师
        </button>
        <button
          @click="applyFilter('active')"
          class="px-3 py-1 rounded-md bg-green-100 text-green-700 hover:bg-green-200 focus:outline-none transition duration-200"
        >
          活跃教师
        </button>
        <button
          @click="applyFilter('suspended')"
          class="px-3 py-1 rounded-md bg-red-100 text-red-700 hover:bg-red-200 focus:outline-none transition duration-200"
        >
          已封禁教师
        </button>
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
      <div class="pagination-controls flex justify-between items-center mt-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div class="text-sm text-gray-500">
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
            class="px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 focus:outline-none transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'
import AdminLayout from '../layouts/AdminLayout.vue'
import TeacherItem from '../components/TeacherItem.vue'
import { useTeacherStore } from '../stores/teacherStore'

// 初始化
const toast = useToast()
const router = useRouter()
const teacherStore = useTeacherStore()

// 响应式状态
const teachers = ref([])
const loading = ref(false)
const filters = ref({
  status: '',
  verified: '',
  city: '',
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
const statistics = computed(() => teacherStore.statistics)

const paginationArray = computed(() => {
  const { page, pages } = pagination.value
  const arr = []

  // 显示当前页和前后两页
  for (let i = Math.max(1, page - 2); i <= Math.min(pages, page + 2); i++) {
    arr.push(i)
  }

  return arr
})

// 生命周期钩子
onMounted(async () => {
  await loadTeachers()
})

// 监听筛选条件变化
watch(
  () => filters.value.page,
  async (newPage, oldPage) => {
    console.log('[TeachersView] 监听到页码变化:', newPage, oldPage)
    // 只有当页码变化不是由 changePage 函数直接触发时才重新加载
    // 由于 changePage 函数已经直接调用了 loadTeachers，这里不需要重复调用
    // 这个监听主要用于处理其他可能导致页码变化的情况
  },
)

// 方法
async function loadTeachers() {
  loading.value = true

  try {
    // 构建请求参数
    const params = {
      page: filters.value.page,
      limit: filters.value.limit,
      status: filters.value.status || undefined,
      isVerified: filters.value.verified || undefined,
      city: filters.value.city || undefined,
    }
    
    console.log('[TeachersView] 请求参数:', params)
    
    // 更新筛选条件
    teacherStore.updateFilters(filters.value)

    // 使用新的分页接口获取教师列表
    const response = await teacherStore.fetchTeachersByLimit(params)

    // 添加调试日志
    console.log('[TeachersView] 从后端接收到的响应:', response)

    if (response.status === 'success') {
      // 处理教师数据
      if (response.data && response.data.tutors) {
        teachers.value = response.data.tutors
        console.log('[TeachersView] 使用标准结构数据:', teachers.value)
      } else if (response.data && Array.isArray(response.data)) {
        teachers.value = response.data
        console.log('[TeachersView] 使用数组数据:', teachers.value)
      } else {
        teachers.value = []
        console.log('[TeachersView] 没有找到教师数据')
      }
      
      // 处理分页信息
      if (response.data && response.data.pagination) {
        pagination.value = response.data.pagination
        console.log('[TeachersView] 使用嵌套分页数据:', pagination.value)
      } else if (response.pagination) {
        pagination.value = response.pagination
        console.log('[TeachersView] 使用顶层分页数据:', pagination.value)
      } else {
        // 使用默认分页
        pagination.value = {
          total: 0,
          page: filters.value.page,
          limit: filters.value.limit,
          pages: 0
        }
        console.log('[TeachersView] 使用默认分页数据:', pagination.value)
      }
      
      // 如果没有数据，显示空列表
      if (!teachers.value || teachers.value.length === 0) {
        console.log('[TeachersView] 没有找到符合条件的教师')
      }
    } else {
      toast.error(response.message || '获取教师列表失败')
      teachers.value = []
    }
  } catch (error) {
    console.error('[TeachersView] 加载教师错误:', error)
    toast.error('加载教师时发生错误')
    teachers.value = []
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  teacherStore.resetFilters()
  filters.value = { ...teacherStore.filters }
  loadTeachers()
}

function applyFilter(filterType) {
  switch (filterType) {
    case 'all':
      filters.value.status = ''
      filters.value.verified = ''
      break
    case 'unverified':
      filters.value.status = ''
      filters.value.verified = 'false'
      break
    case 'active':
      filters.value.status = 'active'
      filters.value.verified = ''
      break
    case 'suspended':
      filters.value.status = 'suspended'
      filters.value.verified = ''
      break
  }

  filters.value.page = 1
  loadTeachers()
}

function changePage(page) {
  if (page < 1 || page > pagination.value.pages) return
  
  console.log('[TeachersView] 切换到页码:', page, '当前页码:', filters.value.page)
  
  // 直接传递页码参数给 teacherStore
  teacherStore.changePage(page)
  
  // 直接调用加载函数
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

function formatSubjects(subjects) {
  if (!subjects || !Array.isArray(subjects)) return '无'

  return subjects.join(', ')
}

function formatGrades(grades) {
  if (!grades || !Array.isArray(grades)) return '无'

  return grades.join(', ')
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
