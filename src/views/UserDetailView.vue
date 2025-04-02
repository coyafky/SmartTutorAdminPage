<template>
  <AdminLayout>
    <div class="container mx-auto">
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center gap-2">
          <button @click="goBack" class="btn btn-circle btn-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 class="text-2xl font-bold">用户详情</h1>
        </div>
        <div class="flex gap-2">
          <button 
            @click="toggleEditMode" 
            class="btn btn-sm" 
            :class="isEditing ? 'btn-error' : 'btn-primary'"
          >
            {{ isEditing ? '取消编辑' : '编辑用户' }}
          </button>
          <button 
            v-if="isEditing" 
            @click="saveUser" 
            class="btn btn-sm btn-success"
            :disabled="isSaving"
          >
            {{ isSaving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>

      <!-- 加载中 -->
      <div v-if="loading" class="flex justify-center py-8">
        <div class="loading loading-spinner loading-lg"></div>
      </div>

      <!-- 错误信息 -->
      <div v-else-if="error" class="alert alert-error shadow-lg mb-6">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ error }}</span>
        </div>
      </div>

      <!-- 用户信息 -->
      <div v-else-if="user" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- 基本信息 -->
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">基本信息</h2>
            <div class="divider mt-0"></div>
            
            <div class="form-control w-full">
              <label class="label">
                <span class="label-text">用户ID</span>
              </label>
              <input 
                type="text" 
                :value="user.customId" 
                class="input input-bordered w-full" 
                disabled
              />
            </div>

            <div class="form-control w-full">
              <label class="label">
                <span class="label-text">用户名</span>
              </label>
              <input 
                type="text" 
                v-model="editableUser.username" 
                class="input input-bordered w-full" 
                :disabled="!isEditing"
              />
            </div>

            <div class="form-control w-full">
              <label class="label">
                <span class="label-text">创建时间</span>
              </label>
              <input 
                type="text" 
                :value="formatDate(user.createdAt)" 
                class="input input-bordered w-full" 
                disabled
              />
            </div>

            <div class="form-control w-full">
              <label class="label">
                <span class="label-text">更新时间</span>
              </label>
              <input 
                type="text" 
                :value="formatDate(user.updatedAt)" 
                class="input input-bordered w-full" 
                disabled
              />
            </div>
          </div>
        </div>

        <!-- 角色和状态 -->
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">角色和状态</h2>
            <div class="divider mt-0"></div>
            
            <div class="form-control w-full">
              <label class="label">
                <span class="label-text">角色</span>
              </label>
              <select 
                v-model="editableUser.role" 
                class="select select-bordered w-full" 
                :disabled="!isEditing"
              >
                <option value="parent">家长</option>
                <option value="teacher">教师</option>
                <option value="admin">管理员</option>
              </select>
            </div>

            <div class="form-control w-full">
              <label class="label">
                <span class="label-text">状态</span>
              </label>
              <select 
                v-model="editableUser.status" 
                class="select select-bordered w-full" 
                :disabled="!isEditing"
              >
                <option value="active">正常</option>
                <option value="inactive">未激活</option>
                <option value="banned">已封禁</option>
              </select>
            </div>

            <div class="mt-4">
              <div class="badge badge-lg" :class="getRoleBadgeClass(user.role)">
                {{ getRoleLabel(user.role) }}
              </div>
              <div class="badge badge-lg ml-2" :class="getStatusBadgeClass(user.status)">
                {{ getStatusLabel(user.status) }}
              </div>
            </div>
          </div>
        </div>

        <!-- 操作记录 -->
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">操作</h2>
            <div class="divider mt-0"></div>
            
            <div class="space-y-4">
              <button 
                @click="confirmResetPassword" 
                class="btn btn-warning btn-block"
                :disabled="!isEditing"
              >
                重置密码
              </button>
              
              <button 
                @click="confirmDeleteUser" 
                class="btn btn-error btn-block"
                :disabled="!isEditing"
              >
                删除用户
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 删除确认模态框 -->
      <dialog ref="deleteConfirmModal" class="modal">
        <div class="modal-box">
          <h3 class="font-bold text-lg">确认删除</h3>
          <p class="py-4">您确定要删除此用户吗？此操作不可撤销。</p>
          <div class="modal-action">
            <button @click="deleteUser" class="btn btn-error">删除</button>
            <form method="dialog">
              <button class="btn">取消</button>
            </form>
          </div>
        </div>
      </dialog>

      <!-- 重置密码确认模态框 -->
      <dialog ref="resetPasswordModal" class="modal">
        <div class="modal-box">
          <h3 class="font-bold text-lg">确认重置密码</h3>
          <p class="py-4">您确定要重置此用户的密码吗？用户将收到一封包含新密码的邮件。</p>
          <div class="modal-action">
            <button @click="resetPassword" class="btn btn-warning">重置密码</button>
            <form method="dialog">
              <button class="btn">取消</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '../layouts/AdminLayout.vue'
import userService from '../services/userService'

const route = useRoute()
const router = useRouter()
const userId = route.params.id

// 状态
const user = ref(null)
const editableUser = reactive({
  username: '',
  role: '',
  status: ''
})
const loading = ref(true)
const error = ref(null)
const isEditing = ref(false)
const isSaving = ref(false)

// 模态框引用
const deleteConfirmModal = ref(null)
const resetPasswordModal = ref(null)

// 加载用户信息
const loadUser = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await userService.getUserById(userId)
    if (response.status === 'success') {
      user.value = response.data.user
      
      // 初始化可编辑用户对象
      editableUser.username = user.value.username
      editableUser.role = user.value.role
      editableUser.status = user.value.status
    } else {
      error.value = response.message || '获取用户信息失败'
    }
  } catch (err) {
    console.error('获取用户详情失败:', err)
    error.value = err.message || '获取用户信息失败'
  } finally {
    loading.value = false
  }
}

// 返回上一页
const goBack = () => {
  router.push('/users')
}

// 切换编辑模式
const toggleEditMode = () => {
  if (isEditing.value) {
    // 取消编辑，重置为原始值
    editableUser.username = user.value.username
    editableUser.role = user.value.role
    editableUser.status = user.value.status
  }
  isEditing.value = !isEditing.value
}

// 保存用户信息
const saveUser = async () => {
  isSaving.value = true
  
  try {
    // 更新用户基本信息
    const userData = {
      username: editableUser.username
    }
    await userService.updateUser(userId, userData)
    
    // 如果角色发生变化，更新角色
    if (editableUser.role !== user.value.role) {
      await userService.updateUserRole(userId, editableUser.role)
    }
    
    // 如果状态发生变化，更新状态
    if (editableUser.status !== user.value.status) {
      await userService.updateUserStatus(userId, editableUser.status)
    }
    
    // 重新加载用户信息
    await loadUser()
    
    // 退出编辑模式
    isEditing.value = false
    
    // 显示成功消息
    alert('用户信息已成功更新')
  } catch (err) {
    console.error('保存用户失败:', err)
    alert('保存用户失败: ' + (err.message || '未知错误'))
  } finally {
    isSaving.value = false
  }
}

// 确认删除用户
const confirmDeleteUser = () => {
  deleteConfirmModal.value.showModal()
}

// 删除用户
const deleteUser = async () => {
  try {
    const response = await userService.deleteUser(userId)
    if (response.status === 'success') {
      // 关闭模态框并返回用户列表页
      deleteConfirmModal.value.close()
      router.push('/users')
    }
  } catch (err) {
    console.error('删除用户失败:', err)
    alert('删除用户失败: ' + (err.message || '未知错误'))
  }
}

// 确认重置密码
const confirmResetPassword = () => {
  resetPasswordModal.value.showModal()
}

// 重置密码
const resetPassword = async () => {
  try {
    // 这里需要后端提供重置密码的 API
    alert('密码重置功能尚未实现')
    resetPasswordModal.value.close()
  } catch (err) {
    console.error('重置密码失败:', err)
    alert('重置密码失败: ' + (err.message || '未知错误'))
  }
}

// 角色标签和样式
const getRoleLabel = (role) => {
  const labels = {
    'admin': '管理员',
    'teacher': '教师',
    'parent': '家长'
  }
  return labels[role] || role
}

const getRoleBadgeClass = (role) => {
  const classes = {
    'admin': 'badge-primary',
    'teacher': 'badge-secondary',
    'parent': 'badge-accent'
  }
  return classes[role] || 'badge-ghost'
}

// 状态标签和样式
const getStatusLabel = (status) => {
  const labels = {
    'active': '正常',
    'inactive': '未激活',
    'banned': '已封禁'
  }
  return labels[status] || status
}

const getStatusBadgeClass = (status) => {
  const classes = {
    'active': 'badge-success',
    'inactive': 'badge-warning',
    'banned': 'badge-error'
  }
  return classes[status] || 'badge-ghost'
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '无数据'
  
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 页面加载时获取用户信息
onMounted(() => {
  loadUser()
})
</script>
