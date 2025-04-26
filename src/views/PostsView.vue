<template>
  <AdminLayout>
    <div class="posts-view">
      <h1 class="text-2xl font-bold mb-6">帖子管理</h1>

      <!-- 筛选和搜索区域 -->
      <div class="filter-section bg-gray-800 p-6 rounded-lg shadow-sm mb-6 border border-gray-700">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">状态</label>
            <select
              v-model="filters.status"
              class="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            >
              <option value="">全部状态</option>
              <option value="pending">待审核</option>
              <option value="published">已发布</option>
              <option value="rejected">已拒绝</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">排序</label>
            <select
              v-model="filters.sort"
              class="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            >
              <option value="newest">最新优先</option>
              <option value="oldest">最早优先</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">城市</label>
            <input
              v-model="filters.city"
              type="text"
              placeholder="输入城市名称"
              class="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            />
          </div>

          <div class="flex items-end space-x-3">
            <button
              @click="resetFilters"
              class="px-4 py-2 rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-200"
            >
              重置
            </button>
            <button
              @click="loadPosts"
              class="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200"
            >
              筛选
            </button>
          </div>
        </div>
      </div>

      <!-- 标签切换 -->
      <div class="tabs mb-6">
        <button class="tab-btn px-5 py-2 rounded-md bg-blue-500 text-white font-medium shadow-sm">所有帖子</button>
      </div>

      <!-- 帖子列表 -->
      <div v-if="loading" class="text-center py-12">
        <div
          class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"
        ></div>
        <p class="mt-3 text-gray-600">加载中...</p>
      </div>

      <div v-else-if="posts.length === 0" class="text-center py-16 bg-gray-800 rounded-lg shadow-sm border border-gray-700">
        <p class="text-gray-400 text-lg">暂无帖子数据</p>
      </div>

      <div v-else class="posts-list space-y-5">
        <PostItem
          v-for="post in posts"
          :key="post._id"
          :post="post"
          @review="reviewPost"
        />
      </div>

      <!-- 分页 -->
      <div v-if="pagination.pages > 1" class="pagination flex justify-center mt-6">
        <button
          @click="changePage(pagination.page - 1)"
          :disabled="pagination.page === 1"
          :class="[
            'px-3 py-1 rounded-md mr-2',
            pagination.page === 1
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
          ]"
        >
          上一页
        </button>

        <div v-for="page in displayedPages" :key="page" class="mx-1">
          <button
            v-if="page !== '...'"
            @click="changePage(page)"
            :class="[
              'px-3 py-1 rounded-md',
              pagination.page === page
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
            ]"
          >
            {{ page }}
          </button>
          <span v-else class="px-2 py-1">...</span>
        </div>

        <button
          @click="changePage(pagination.page + 1)"
          :disabled="pagination.page === pagination.pages"
          :class="[
            'px-3 py-1 rounded-md ml-2',
            pagination.page === pagination.pages
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
          ]"
        >
          下一页
        </button>
      </div>
    </div>

    <!-- 帖子详情弹窗 -->
    <div
      v-if="showPostDetails"
      class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
    >
      <div class="bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-700">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-gray-200">帖子详情</h2>
            <button @click="showPostDetails = false" class="text-gray-500 hover:text-gray-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div v-if="!currentPost" class="text-center py-8">
            <p class="text-gray-400">无法加载帖子详情</p>
          </div>

          <div v-else>
            <div class="mb-4 pb-4 border-b border-gray-700">
              <div class="flex items-center mb-2">
                <span
                  :class="[
                    'status-badge px-2 py-0.5 rounded-full text-xs mr-2',
                    currentPost.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : currentPost.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800',
                  ]"
                >
                  {{
                    currentPost.status === 'pending'
                      ? '待审核'
                      : currentPost.status === 'published'
                        ? '已发布'
                        : '已拒绝'
                  }}
                </span>
                <span class="text-gray-500 text-sm">
                  {{ new Date(currentPost.createdAt).toLocaleString('zh-CN') }}
                </span>
                <span v-if="currentPost.reviewedAt" class="text-gray-500 text-sm ml-2">
                  {{ new Date(currentPost.reviewedAt).toLocaleString('zh-CN') }}
                </span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 class="text-sm font-medium text-gray-400">请求ID</h3>
                  <p class="text-gray-300">{{ currentPost.requestId }}</p>
                </div>
                <div>
                  <h3 class="text-sm font-medium text-gray-400">家长ID</h3>
                  <p class="text-gray-300">{{ currentPost.parentId }}</p>
                </div>
                <div>
                  <h3 class="text-sm font-medium text-gray-400">学生ID</h3>
                  <p class="text-gray-300">{{ currentPost.childId || '未指定' }}</p>
                </div>
                <div>
                  <h3 class="text-sm font-medium text-gray-400">年级</h3>
                  <p class="text-gray-300">{{ currentPost.grade }}</p>
                </div>
              </div>
            </div>

            <div class="mb-4 pb-4 border-b border-gray-700">
              <h3 class="text-lg font-medium mb-2">地址信息</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 class="text-sm font-medium text-gray-400">城市</h3>
                  <p class="text-gray-300">{{ currentPost.location?.city || '未知' }}</p>
                </div>
                <div>
                  <h3 class="text-sm font-medium text-gray-400">区域</h3>
                  <p class="text-gray-300">{{ currentPost.location?.district || '未知' }}</p>
                </div>
                <div class="col-span-2">
                  <h3 class="text-sm font-medium text-gray-400">详细地址</h3>
                  <p class="text-gray-300">{{ currentPost.location?.address || '未知' }}</p>
                </div>
              </div>
            </div>

            <div class="mb-4 pb-4 border-b border-gray-700">
              <h3 class="text-lg font-medium mb-2">科目信息</h3>
              <div
                v-if="currentPost.subjects && currentPost.subjects.length > 0"
                class="grid grid-cols-1 gap-3"
              >
                <div
                  v-for="(subject, index) in currentPost.subjects"
                  :key="index"
                  class="bg-gray-700 p-3 rounded"
                >
                  <div class="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <div>
                      <h3 class="text-sm font-medium text-gray-400">科目</h3>
                      <p class="text-gray-300">{{ subject.name }}</p>
                    </div>
                    <div>
                      <h3 class="text-sm font-medium text-gray-400">当前分数</h3>
                      <p class="text-gray-300">{{ subject.currentScore }}</p>
                    </div>
                    <div>
                      <h3 class="text-sm font-medium text-gray-400">目标分数</h3>
                      <p class="text-gray-300">{{ subject.targetScore }}</p>
                    </div>
                    <div>
                      <h3 class="text-sm font-medium text-gray-400">难度</h3>
                      <p class="text-gray-300">{{ subject.difficulty }}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-gray-400">无科目信息</div>
            </div>

            <div class="mb-4 pb-4 border-b border-gray-700">
              <h3 class="text-lg font-medium mb-2">偏好信息</h3>
              <div v-if="currentPost.preferences" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 class="text-sm font-medium text-gray-400">预算</h3>
                  <p class="text-gray-300">{{ formatBudget(currentPost.preferences.budget) }}</p>
                </div>
                <div>
                  <h3 class="text-sm font-medium text-gray-400">教学地点</h3>
                  <p class="text-gray-300">{{ currentPost.preferences.teachingLocation || '未指定' }}</p>
                </div>
                <div>
                  <h3 class="text-sm font-medium text-gray-400">教师性别偏好</h3>
                  <p class="text-gray-300">{{ currentPost.preferences.teacherGender || '无偏好' }}</p>
                </div>
                <div>
                  <h3 class="text-sm font-medium text-gray-400">教学风格</h3>
                  <p class="text-gray-300">{{ formatTeachingStyles(currentPost.preferences.teachingStyle) }}</p>
                </div>
              </div>
              <div v-else class="text-gray-400">无偏好信息</div>
            </div>

            <div v-if="currentPost.status === 'pending'" class="mt-4">
              <h3 class="text-lg font-medium mb-2">审核操作</h3>
              <div class="grid grid-cols-1 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1">审核备注</label>
                  <textarea
                    v-model="reviewNote"
                    rows="3"
                    class="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入审核备注"
                  ></textarea>
                </div>
                <div class="flex justify-end">
                  <button
                    @click="submitReview('published')"
                    class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 mr-2"
                  >
                    通过审核
                  </button>
                  <button
                    @click="submitReview('rejected')"
                    class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  >
                    拒绝帖子
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
    >
      <div class="bg-gray-800 rounded-lg shadow-lg w-full max-w-md border border-gray-700">
        <div class="p-6">
          <h2 class="text-xl font-bold mb-4 text-gray-200">确认删除</h2>
          <p class="mb-6 text-gray-300">您确定要删除这个帖子吗？此操作无法撤销。</p>
          <div class="flex justify-end">
            <button
              @click="showDeleteConfirm = false"
              class="bg-gray-700 text-gray-300 px-4 py-2 rounded-md hover:bg-gray-600 mr-2"
            >
              取消
            </button>
            <button
              @click="deletePost"
              class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              确认删除
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useToast } from 'vue-toastification'
import AdminLayout from '../layouts/AdminLayout.vue'
import PostItem from '../components/PostItem.vue'
import { usePostStore } from '@/stores/postStore'
import { postService } from '@/services/postService'
const toast = useToast()

// 状态变量
const loading = ref(false)
const posts = ref([])
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  pages: 1,
})
const filters = ref({
  page: 1,
  limit: 20,
  status: '',
  sort: 'newest',
  city: '',
})
const showPostDetails = ref(false)
const currentPost = ref(null)
const showDeleteConfirm = ref(false)
const postToDelete = ref(null)
const reviewNote = ref('')

// 计算属性
const displayedPages = computed(() => {
  const current = pagination.value.page
  const total = pagination.value.pages
  const pages = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)

    if (current > 3) {
      pages.push('...')
    }

    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (current < total - 2) {
      pages.push('...')
    }

    pages.push(total)
  }

  return pages
})

// 监听器
watch(
  () => filters.value.status,
  () => {
    filters.value.page = 1
    loadPosts()
  },
)

watch(
  () => filters.value.sort,
  () => {
    filters.value.page = 1
    loadPosts()
  },
)

// 生命周期钩子
onMounted(async () => {
  await loadPosts()
})

// 方法
async function loadPosts() {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.limit,
      status: filters.value.status || '',
      search: filters.value.search || '',
      sort: filters.value.sort || 'newest',
    }

    console.log('[PostsView] 请求参数:', params)
    
    let response
    
    if (filters.value.city) {
      // 如果有城市筛选，使用城市筛选接口
      response = await postStore.getPostsByCity(filters.value.city, params)
    } else {
      // 否则使用新的分页接口
      response = await postService.getPostsByLimit(params)
    }
    
    console.log('[PostsView] API 原始响应数据:', response)

    if (response && response.status === 'success') {
      // 使用后端返回的数据
      posts.value = response.data?.posts || []
      
      // 处理分页信息
      if (response.pagination) {
        pagination.value.total = response.pagination.total || 0
        pagination.value.page = response.pagination.page || 1
        pagination.value.limit = response.pagination.limit || 10
        pagination.value.pages = response.pagination.pages || 1
        
        console.log('[PostsView] 分页信息:', pagination.value)
      }
    } else {
      toast.error(response?.message || '获取帖子列表失败')
    }
  } catch (error) {
    console.error('[PostsView] 加载帖子错误:', error)
    toast.error('加载帖子时发生错误')
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  // 重置筛选条件
  filters.value = {
    status: '',
    sort: 'newest',
    city: '',
    search: '',
  }
  pagination.value.page = 1 // 重置到第一页
  loadPosts()
}

function changePage(page) {
  if (page < 1 || page > pagination.value.pages || pagination.value.page === page) {
    return
  }

  pagination.value.page = page
  loadPosts()

  // 滚动到页面顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function viewPostDetails(postId) {
  try {
    const post = await postStore.getPostById(postId)
    currentPost.value = post
    showPostDetails.value = true
  } catch (error) {
    console.error('查看帖子详情错误:', error)
    toast.error('查看帖子详情时发生错误')
  }
}

function confirmDeletePost(postId) {
  postToDelete.value = postId
  showDeleteConfirm.value = true
}

async function deletePost() {
  if (!postToDelete.value) return

  try {
    const response = await postStore.deletePost(postToDelete.value)
    if (response.status === 'success') {
      toast.success('帖子删除成功')

      showDeleteConfirm.value = false
      postToDelete.value = null

      if (currentPost.value && currentPost.value._id === postToDelete.value) {
        showPostDetails.value = false
        currentPost.value = null
      }

      loadPosts()
    } else {
      toast.error(response.message || '删除帖子失败')
    }
  } catch (error) {
    console.error('删除帖子错误:', error)
    toast.error('删除帖子时发生错误')
  }
}

function reviewPost(postId, status) {
  viewPostDetails(postId)
  setTimeout(() => {
    submitReview(status)
  }, 500)
}

async function submitReview(status) {
  if (!currentPost.value) return

  try {
    const response = await postStore.updatePostStatus(
      currentPost.value._id,
      status,
      reviewNote.value,
    )

    if (response.status === 'success') {
      toast.success(`帖子${status === 'published' ? '通过' : '拒绝'}成功`)

      showPostDetails.value = false

      loadPosts()

      reviewNote.value = ''
    } else {
      toast.error(response.message || '审核帖子失败')
    }
  } catch (error) {
    console.error('审核帖子错误:', error)
    toast.error('审核帖子时发生错误')
  }
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

function formatSubjects(subjects) {
  if (!subjects || !Array.isArray(subjects)) return '无'

  if (typeof subjects[0] === 'string') {
    return subjects.join(', ')
  }

  return subjects.map((subject) => subject.name).join(', ')
}

function formatBudget(budget) {
  if (!budget) return '未设置'

  const { min, max, period } = budget
  const periodText =
    {
      per_hour: '每小时',
      per_session: '每课时',
      per_day: '每天',
      per_week: '每周',
      per_month: '每月',
    }[period] || period

  if (min && max) {
    return `¥${min}-${max} ${periodText}`
  } else if (min) {
    return `¥${min}+ ${periodText}`
  } else if (max) {
    return `¥${max}以下 ${periodText}`
  }

  return '未设置'
}

function formatTeachingStyles(styles) {
  if (!styles || !Array.isArray(styles) || styles.length === 0) return '无特殊要求'
  return styles.join(', ')
}
</script>
