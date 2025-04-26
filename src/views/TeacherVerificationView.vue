<template>
  <AdminLayout>
    <div class="teacher-verification-view">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-100">教师资质审核</h1>
        <router-link
          to="/teachers"
          class="px-4 py-2 rounded-md bg-gray-700 text-gray-200 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-200"
        >
          返回教师列表
        </router-link>
      </div>

      <!-- 加载中状态 -->
      <div v-if="loading" class="flex justify-center py-10">
        <div class="loader"></div>
      </div>

      <!-- 未找到教师 -->
      <div v-else-if="!teacher" class="bg-gray-800 p-10 rounded-lg shadow-md border border-gray-700 text-center">
        <p class="text-gray-400 mb-4">未找到教师信息</p>
        <router-link
          to="/teachers"
          class="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200"
        >
          返回教师列表
        </router-link>
      </div>

      <!-- 教师详情 -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 左侧：基本信息 -->
        <div class="lg:col-span-2">
          <div class="bg-gray-800 rounded-lg shadow-md border border-gray-700 p-6 mb-6">
            <h2 class="text-xl font-bold mb-4 pb-2 border-b border-gray-600 text-gray-100">基本信息</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p class="text-sm text-gray-400 mb-1">教师ID</p>
                <p class="font-medium text-gray-200">{{ teacher.tutorId || teacher._id }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-400 mb-1">姓名</p>
                <p class="font-medium text-gray-200">{{ teacher.name || '未设置' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-400 mb-1">电话</p>
                <p class="font-medium text-gray-200">{{ teacher.phone || '未设置' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-400 mb-1">邮箱</p>
                <p class="font-medium text-gray-200">{{ teacher.email || '未设置' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-400 mb-1">地区</p>
                <p class="font-medium text-gray-200">{{ formatLocation(teacher) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-400 mb-1">注册时间</p>
                <p class="font-medium text-gray-200">{{ formatDate(teacher.createdAt) }}</p>
              </div>
            </div>
          </div>

          <div class="bg-gray-800 rounded-lg shadow-md border border-gray-700 p-6 mb-6">
            <h2 class="text-xl font-bold mb-4 pb-2 border-b border-gray-600 text-gray-100">教学信息</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p class="text-sm text-gray-400 mb-1">科目</p>
                <p class="font-medium text-gray-200">{{ formatSubjects(teacher.subjects) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-400 mb-1">年级</p>
                <p class="font-medium text-gray-200">{{ formatGrades(teacher.grades) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-400 mb-1">教学经验</p>
                <p class="font-medium text-gray-200">{{ teacher.experience || '未设置' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-400 mb-1">时薪</p>
                <p class="font-medium text-gray-200">{{ teacher.hourlyRate ? `¥${teacher.hourlyRate}` : '未设置' }}</p>
              </div>
            </div>
          </div>

          <div class="bg-gray-800 rounded-lg shadow-md border border-gray-700 p-6 mb-6">
            <h2 class="text-xl font-bold mb-4 pb-2 border-b border-gray-600 text-gray-100">资质信息</h2>
            <div class="grid grid-cols-1 gap-6">
              <div>
                <p class="text-sm text-gray-400 mb-1">教育背景</p>
                <p class="font-medium text-gray-200">{{ teacher.education || '未提供' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-400 mb-1">自我介绍</p>
                <p class="font-medium text-gray-200">{{ teacher.introduction || '未提供' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-400 mb-1">证书</p>
                <div v-if="teacher.certificates && teacher.certificates.length" class="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                  <div v-for="(cert, index) in teacher.certificates" :key="index" class="certificate-item">
                    <img 
                      :src="cert.url || cert" 
                      alt="证书" 
                      class="w-full h-32 object-cover rounded-lg cursor-pointer"
                      @click="openImagePreview(cert.url || cert)"
                    />
                  </div>
                </div>
                <p v-else class="font-medium">未提供证书</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：状态和操作 -->
        <div class="lg:col-span-1">
          <div class="bg-gray-800 rounded-lg shadow-md border border-gray-700 p-6 mb-6 sticky top-6">
            <h2 class="text-xl font-bold mb-4 pb-2 border-b border-gray-600 text-gray-100">状态信息</h2>
            <div class="mb-6">
              <div class="flex items-center justify-between mb-3">
                <p class="text-sm text-gray-400">账号状态</p>
                <span 
                  class="px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="{
                    'bg-green-700 text-green-100': teacher.status === 'active',
                    'bg-gray-600 text-gray-200': teacher.status === 'inactive',
                    'bg-red-700 text-red-100': teacher.status === 'suspended'
                  }"
                >
                  {{ statusMap[teacher.status]?.text || teacher.status }}
                </span>
              </div>
              <div class="flex items-center justify-between mb-3">
                <p class="text-sm text-gray-400">认证状态</p>
                <span 
                  class="px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="teacher.verified ? 'bg-green-700 text-green-100' : 'bg-yellow-700 text-yellow-100'"
                >
                  {{ teacher.verified ? '已认证' : '未认证' }}
                </span>
              </div>
              <div class="mb-3">
                <p class="text-sm text-gray-400 mb-1">认证时间</p>
                <p class="font-medium text-gray-200">{{ formatDate(teacher.verifiedAt) }}</p>
              </div>
              <div class="mb-3">
                <p class="text-sm text-gray-400 mb-1">认证备注</p>
                <p class="font-medium text-gray-200">{{ teacher.verificationNote || '无' }}</p>
              </div>
            </div>

            <h2 class="text-xl font-bold mb-4 pb-2 border-b border-gray-600 text-gray-100">认证操作</h2>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-300 mb-2">认证状态</label>
              <select
                v-model="verificationStatus"
                class="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              >
                <option :value="true">已认证</option>
                <option :value="false">未认证</option>
              </select>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-300 mb-2">认证备注</label>
              <textarea
                v-model="verificationNote"
                rows="4"
                class="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="输入认证备注信息..."
              ></textarea>
            </div>
            <div class="flex justify-end">
              <button
                @click="submitVerification"
                class="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200"
                :disabled="loading"
              >
                {{ loading ? '处理中...' : '提交认证结果' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 图片预览模态框 -->
      <div v-if="showImagePreview" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div class="max-w-4xl max-h-[90vh] relative">
          <button 
            @click="showImagePreview = false" 
            class="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img :src="previewImageUrl" alt="预览图片" class="max-w-full max-h-[85vh] object-contain" />
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import AdminLayout from '../layouts/AdminLayout.vue'
import { useTeacherStore } from '../stores/teacherStore'

// 初始化
const toast = useToast()
const route = useRoute()
const router = useRouter()
const teacherStore = useTeacherStore()

// 响应式状态
const teacher = ref(null)
const loading = ref(false)
const verificationStatus = ref(false)
const verificationNote = ref('')
const showImagePreview = ref(false)
const previewImageUrl = ref('')

// 状态映射
const statusMap = {
  active: { text: '活跃', color: 'green' },
  inactive: { text: '未活跃', color: 'gray' },
  suspended: { text: '已封禁', color: 'red' },
}

// 生命周期钩子
onMounted(async () => {
  const tutorId = route.params.id
  if (!tutorId) {
    toast.error('教师ID不存在')
    router.push('/teachers')
    return
  }
  
  await loadTeacher(tutorId)
})

// 方法
async function loadTeacher(tutorId) {
  loading.value = true
  try {
    const response = await teacherStore.getTeacherById(tutorId)
    
    if (response.status === 'success' && response.data.tutor) {
      teacher.value = response.data.tutor
      verificationStatus.value = teacher.value.verified || false
      verificationNote.value = teacher.value.verificationNote || ''
    } else {
      toast.error('获取教师信息失败')
      router.push('/teachers')
    }
  } catch (error) {
    console.error('加载教师错误:', error)
    toast.error('加载教师时发生错误')
    router.push('/teachers')
  } finally {
    loading.value = false
  }
}

async function submitVerification() {
  if (!teacher.value) return
  
  loading.value = true
  try {
    const result = await teacherStore.verifyTeacher(
      teacher.value.tutorId || teacher.value._id,
      verificationStatus.value,
      verificationNote.value
    )
    
    if (result.success) {
      toast.success('教师认证状态更新成功')
      // 更新当前教师信息
      teacher.value.verified = verificationStatus.value
      teacher.value.verificationNote = verificationNote.value
      teacher.value.verifiedAt = new Date().toISOString()
    } else {
      toast.error(result.message || '教师认证状态更新失败')
    }
  } catch (error) {
    console.error('更新教师认证状态错误:', error)
    toast.error('更新教师认证状态时发生错误')
  } finally {
    loading.value = false
  }
}

function openImagePreview(url) {
  previewImageUrl.value = url
  showImagePreview.value = true
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
    border: 4px solid rgba(255, 255, 255, 0.1);
    border-left-color: #3498db;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .certificate-item {
    position: relative;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.375rem;
    overflow: hidden;
  }

  .certificate-item:hover {
    transform: scale(1.03);
    border-color: rgba(59, 130, 246, 0.5);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
  }
</style>
