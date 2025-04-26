<template>
  <AdminLayout>
    <div class="post-detail-view">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-200">帖子详情</h1>
        <div class="flex space-x-3">
          <router-link
            :to="{ name: 'posts' }"
            class="px-4 py-2 rounded-md bg-gray-700 text-gray-200 hover:bg-gray-600 focus:outline-none transition duration-200"
          >
            返回列表
          </router-link>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center py-10 bg-gray-900 rounded-lg shadow-md border border-gray-700 text-gray-200">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p class="ml-3 text-gray-300">加载中...</p>
      </div>

      <!-- 加载错误 -->
      <div v-else-if="error" class="bg-red-900 bg-opacity-30 p-6 rounded-lg shadow-sm border border-red-800 mb-6 text-red-300">
        <p class="text-red-300">{{ error }}</p>
        <button
          @click="loadPost"
          class="mt-3 px-4 py-2 rounded-md bg-red-800 bg-opacity-50 text-red-200 hover:bg-red-700 focus:outline-none transition duration-200"
        >
          重试
        </button>
      </div>

      <!-- 帖子不存在 -->
      <div
        v-else-if="!post"
        class="bg-gray-900 p-10 rounded-lg shadow-md border border-gray-700 text-center"
      >
        <p class="text-gray-400">未找到帖子信息</p>
        <router-link
          :to="{ name: 'posts' }"
          class="mt-4 inline-block px-4 py-2 rounded-md bg-blue-700 text-white hover:bg-blue-600 focus:outline-none transition duration-200"
        >
          返回帖子列表
        </router-link>
      </div>

      <!-- 帖子详情 -->
      <div v-else class="post-detail bg-gray-900 rounded-lg shadow-md border border-gray-700 overflow-hidden text-gray-200">
        <!-- 帖子状态栏 -->
        <div class="bg-gray-800 py-4 px-6 flex items-center justify-between border-b border-gray-700">
          <div class="flex items-center">
            <StatusBadge :status="post.status" class="mr-3" />
            <span class="text-white">{{ formatDate(post.createdAt) }} 创建</span>
            <span v-if="post.reviewedAt" class="text-white ml-4">
              {{ formatDate(post.reviewedAt) }} 审核
            </span>
          </div>
          <div class="text-white text-sm">
            请求ID: {{ post.requestId || post._id }}
          </div>
        </div>

        <!-- 帖子内容区 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-800">
          <!-- 左侧：基本信息 -->
          <div>
            <h2 class="text-xl font-semibold mb-4 pb-2 border-b border-gray-700 text-blue-400">基本信息</h2>
            
            <div class="space-y-4">
              <div>
                <h3 class="text-sm font-medium text-gray-400">家长ID</h3>
                <p class="mt-1 text-gray-300">{{ post.parentId }}</p>
              </div>
              
              <div>
                <h3 class="text-sm font-medium text-gray-400">地区</h3>
                <p class="mt-1 text-gray-300">{{ formatLocation(post.location) }}</p>
              </div>
              
              <div>
                <h3 class="text-sm font-medium text-gray-400">科目</h3>
                <p class="mt-1 text-gray-300">{{ formatSubjects(post.subjects) }}</p>
              </div>
              
              <div>
                <h3 class="text-sm font-medium text-gray-400">年级</h3>
                <p class="mt-1 text-gray-300">{{ formatGrade(post.grade) }}</p>
              </div>
              
              <div>
                <h3 class="text-sm font-medium text-gray-400">创建时间</h3>
                <p class="mt-1 text-gray-300">{{ formatDate(post.createdAt, true) }}</p>
              </div>
            </div>
          </div>
          
          <!-- 右侧：偏好信息 -->
          <div>
            <h2 class="text-xl font-semibold mb-4 pb-2 border-b border-gray-700 text-blue-400">偏好信息</h2>
            
            <div v-if="post.preferences" class="space-y-4">
              <div>
                <h3 class="text-sm font-medium text-gray-400">预算</h3>
                <p class="mt-1 text-gray-300">{{ formatBudget(post.preferences.budget) }}</p>
              </div>
              
              <div>
                <h3 class="text-sm font-medium text-gray-400">教学风格偏好</h3>
                <p class="mt-1 text-gray-300">{{ formatTeachingStyles(post.preferences.teachingStyle) }}</p>
              </div>
              
              <div>
                <h3 class="text-sm font-medium text-gray-400">特殊要求</h3>
                <p class="mt-1 whitespace-pre-line">{{ post.preferences.specialRequirements || '无' }}</p>
              </div>
            </div>
            
            <div v-else class="py-4 text-gray-500">未提供偏好信息</div>
          </div>
        </div>

        <!-- 详细描述区 -->
        <div class="p-6 border-t border-gray-700 bg-gray-800">
          <h2 class="text-xl font-semibold mb-4">详细描述</h2>
          <div class="bg-gray-700 p-4 rounded-md">
            <p class="whitespace-pre-line">{{ post.description || '未提供详细描述' }}</p>
          </div>
        </div>
        
        <!-- 审核操作区 -->
        <div class="p-6 border-t border-gray-700 bg-gray-800">
          <h2 class="text-xl font-semibold mb-4">审核操作</h2>
          
          <!-- 当前状态显示 -->
          <div class="mb-4">
            <span class="block text-sm font-medium text-gray-300 mb-1">当前状态:</span>
            <div class="flex items-center">
              <StatusBadge :status="post.status" />
              <span v-if="post.reviewedAt" class="ml-2 text-sm text-gray-500">
                {{ formatDate(post.reviewedAt) }} 更新
              </span>
            </div>
          </div>
          
          <!-- 上次审核意见 -->
          <div v-if="post.reviewNote" class="mb-4 p-3 bg-gray-700 rounded-md">
            <p class="text-sm font-medium text-gray-700">上次审核意见:</p>
            <p class="text-sm text-gray-400 mt-1 whitespace-pre-line">{{ post.reviewNote }}</p>
          </div>
          
          <!-- 审核表单 -->
          <div class="mb-4">
            <label for="review-note" class="block text-sm font-medium text-gray-300 mb-1">审核意见:</label>
            <textarea
              id="review-note"
              v-model="reviewNote"
              rows="4"
              class="w-full border border-gray-600 rounded-md shadow-sm px-3 py-2 bg-gray-700 text-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入审核意见..."
            ></textarea>
          </div>
          
          <!-- 操作按钮 -->
          <div class="flex space-x-3">
            <button
              v-if="post.status !== 'published'"
              @click="submitReview('published')"
              :disabled="submitting"
              class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="submitting && reviewStatus === 'published'" class="inline-block animate-spin mr-2">⟳</span>
              批准发布
            </button>
            <button
              v-if="post.status !== 'rejected'"
              @click="submitReview('rejected')"
              :disabled="submitting"
              class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="submitting && reviewStatus === 'rejected'" class="inline-block animate-spin mr-2">⟳</span>
              拒绝帖子
            </button>
            <button
              v-if="post.status !== 'pending'"
              @click="submitReview('pending')"
              :disabled="submitting"
              class="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="submitting && reviewStatus === 'pending'" class="inline-block animate-spin mr-2">⟳</span>
              标记为待审核
            </button>
            <button
              @click="confirmDelete"
              :disabled="submitting"
              class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              删除帖子
            </button>
          </div>
        </div>
      </div>
      
      <!-- 删除确认弹窗 -->
      <div
        v-if="showDeleteConfirm"
        class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      >
        <div class="bg-gray-800 rounded-lg shadow-lg p-6 max-w-md mx-auto border border-gray-700 text-gray-200">
          <h3 class="text-xl font-semibold mb-4">确认删除</h3>
          <p class="text-gray-300 mb-6">您确定要删除此帖子吗？此操作不可恢复。</p>
          <div class="flex justify-end space-x-3">
            <button
              @click="showDeleteConfirm = false"
              class="px-4 py-2 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
            >
              取消
            </button>
            <button
              @click="deletePost"
              :disabled="submitting"
              class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="submitting && actionType === 'delete'" class="inline-block animate-spin mr-2">⟳</span>
              确认删除
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import AdminLayout from '../layouts/AdminLayout.vue'
import StatusBadge from '../components/StatusBadge.vue'
import postService from '../services/postService'

// 初始化
const toast = useToast()
const route = useRoute()
const router = useRouter()

// 响应式状态
const post = ref(null)
const loading = ref(false)
const error = ref(null)
const submitting = ref(false)
const reviewNote = ref('')
const reviewStatus = ref('')
const showDeleteConfirm = ref(false)
const actionType = ref('')

// 生命周期钩子
onMounted(() => {
  loadPost()
})

// 加载帖子详情
async function loadPost() {
  const postId = route.params.id

  if (!postId) {
    error.value = '无效的帖子ID'
    return
  }

  loading.value = true
  error.value = null

  try {
    const response = await postService.getPostById(postId)
    
    console.log('[PostDetailView] API 响应数据:', response)
    
    if (response && response.status === 'success') {
      post.value = response.data?.post
      
      if (!post.value) {
        error.value = '未找到帖子信息'
      }
    } else {
      error.value = response?.message || '获取帖子详情失败'
      toast.error(error.value)
    }
  } catch (err) {
    console.error('[PostDetailView] 加载帖子详情错误:', err)
    error.value = '加载帖子详情时发生错误'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}

// 提交审核结果
async function submitReview(status) {
  // 优先使用requestId，这是后端需要的字段
  const postId = post.value?.requestId || post.value?._id
  
  if (!postId) {
    toast.error('无效的帖子ID')
    return
  }

  submitting.value = true
  reviewStatus.value = status
  actionType.value = 'review'

  try {
    console.log(`[帖子审核] 使用ID提交: ${postId}, 状态: ${status}`)
    const result = await postService.updatePostStatus(postId, status, reviewNote.value)

    if (result.status === 'success') {
      toast.success('帖子审核成功')
      
      // 更新当前帖子的状态
      post.value = result.data?.post || post.value
      post.value.status = status
      post.value.reviewNote = reviewNote.value
      post.value.reviewedAt = new Date().toISOString()
    } else {
      toast.error(result.message || '帖子审核失败')
    }
  } catch (error) {
    console.error('[PostDetailView] 帖子审核错误:', error)
    toast.error('帖子审核时发生错误')
  } finally {
    submitting.value = false
    reviewStatus.value = ''
    actionType.value = ''
  }
}

// 确认删除
function confirmDelete() {
  showDeleteConfirm.value = true
}

// 删除帖子
async function deletePost() {
  // 优先使用requestId，这是后端需要的字段
  const postId = post.value?.requestId || post.value?._id
  
  if (!postId) {
    toast.error('无效的帖子ID')
    return
  }

  submitting.value = true
  actionType.value = 'delete'

  try {
    console.log(`[帖子删除] 使用ID提交: ${postId}`)
    const result = await postService.deletePost(postId)

    if (result.status === 'success') {
      toast.success('帖子删除成功')
      
      // 重置状态并返回列表页
      showDeleteConfirm.value = false
      router.push({ name: 'posts' })
    } else {
      toast.error(result.message || '删除帖子失败')
    }
  } catch (error) {
    console.error('[PostDetailView] 删除帖子错误:', error)
    toast.error('删除帖子时发生错误')
  } finally {
    submitting.value = false
    actionType.value = ''
  }
}

// 格式化函数
function formatDate(dateString, includeTime = false) {
  if (!dateString) return '未知'

  const date = new Date(dateString)
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }
  
  if (includeTime) {
    options.hour = '2-digit'
    options.minute = '2-digit'
  }
  
  return new Intl.DateTimeFormat('zh-CN', options).format(date)
}

function formatLocation(location) {
  if (!location) return '未知'

  const { city, district } = location
  if (city && district) {
    return `${city} ${district}`
  } else if (city) {
    return city
  } else if (district) {
    return district
  }

  return '未知'
}

function formatSubjects(subjects) {
  if (!subjects || !Array.isArray(subjects)) return '无'

  if (typeof subjects[0] === 'string') {
    return subjects.join(', ')
  }

  return subjects.map((subject) => subject.name).join(', ')
}

function formatGrade(grade) {
  if (!grade) return '未知年级'

  const gradeMap = {
    primary_1: '小学一年级',
    primary_2: '小学二年级',
    primary_3: '小学三年级',
    primary_4: '小学四年级',
    primary_5: '小学五年级',
    primary_6: '小学六年级',
    junior_1: '初中一年级',
    junior_2: '初中二年级',
    junior_3: '初中三年级',
    senior_1: '高中一年级',
    senior_2: '高中二年级',
    senior_3: '高中三年级',
  }

  return gradeMap[grade] || grade
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
    }[period] || '未知'

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
  if (!styles || !Array.isArray(styles) || styles.length === 0) return '未指定'
  
  const styleMap = {
    structured: '结构化教学',
    interactive: '互动式教学',
    practical: '实践导向',
    inquiry_based: '探究式教学',
    strict: '严格要求',
    relaxed: '轻松氛围',
    traditional: '传统教学',
    innovative: '创新教学',
  }
  
  return styles.map(style => styleMap[style] || style).join(', ')
}
</script>

<style scoped>
.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
