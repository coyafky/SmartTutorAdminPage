<template>
  <AdminLayout>
    <div class="container mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">用户管理</h1>
        <div class="flex space-x-2">
          <button @click="debugApi" class="btn btn-outline btn-sm btn-info">
            <i class="fas fa-bug mr-1"></i> 调试
          </button>
          <button @click="refreshData" class="btn btn-outline btn-sm">
            <i class="fas fa-sync-alt mr-1"></i> 刷新
          </button>
          <button class="btn btn-primary">创建用户</button>
        </div>
      </div>

      <!-- 筛选条件 -->
      <div class="bg-base-200 p-4 rounded-lg mb-6">
        <div class="flex flex-wrap gap-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">角色</span>
            </label>
            <select v-model="filters.role" class="select select-bordered w-full max-w-xs" @change="applyFilters">
              <option value="">全部</option>
              <option value="admin">管理员</option>
              <option value="parent">家长</option>
              <option value="teacher">教师</option>
            </select>
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">状态</span>
            </label>
            <select v-model="filters.status" class="select select-bordered w-full max-w-xs" @change="applyFilters">
              <option value="">全部</option>
              <option value="active">正常</option>
              <option value="inactive">未激活</option>
              <option value="suspended">已封禁</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 加载状态 - 骨架屏 -->
      <div v-if="loading" class="overflow-x-auto">
        <table class="table w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>用户名</th>
              <th>角色</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in 5" :key="i">
              <td><div class="skeleton h-4 w-20"></div></td>
              <td><div class="skeleton h-4 w-24"></div></td>
              <td><div class="skeleton h-6 w-16 rounded-full"></div></td>
              <td><div class="skeleton h-6 w-16 rounded-full"></div></td>
              <td><div class="skeleton h-4 w-32"></div></td>
              <td>
                <div class="flex space-x-2">
                  <div class="skeleton h-8 w-8 rounded-full"></div>
                  <div class="skeleton h-8 w-8 rounded-full"></div>
                  <div class="skeleton h-8 w-8 rounded-full"></div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 用户列表 -->
      <div v-else class="overflow-x-auto">
        <table class="table w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>用户名</th>
              <th>角色</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!users || users.length === 0">
              <td colspan="6" class="text-center py-4">暂无用户数据</td>
            </tr>
            <tr v-else v-for="user in users" :key="user.customId || user._id">
              <td>{{ user.customId }}</td>
              <td>{{ user.username }}</td>
              <td>
                <div class="badge" :class="getRoleBadgeClass(user.role)">
                  {{ getRoleLabel(user.role) }}
                </div>
              </td>
              <td>
                <div class="badge" :class="getStatusBadgeClass(user.status)">
                  {{ getStatusLabel(user.status) }}
                </div>
              </td>
              <td>{{ formatDate(user.createdAt) }}</td>
              <td>
                <div class="flex gap-2">
                  <router-link :to="`/users/${user.customId}`" class="btn btn-xs btn-outline btn-info">
                    查看
                  </router-link>
                  <button @click="editUser(user.customId)" class="btn btn-xs btn-outline btn-warning">
                    编辑
                  </button>
                  <button @click="confirmDeleteUser(user.customId)" class="btn btn-xs btn-outline btn-error">
                    删除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页控件 -->
      <div class="flex justify-center mt-6">
        <div class="join">
          <button 
            class="join-item btn" 
            :class="{ 'btn-disabled': pagination.page <= 1 }"
            @click="changePage(pagination.page - 1)"
            :disabled="pagination.page <= 1"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          
          <!-- 页码按钮 - 使用数组映射 -->
          <button 
            v-for="pageNum in getPageNumbers()" 
            :key="pageNum"
            class="join-item btn" 
            :class="{ 'btn-active': pagination.page === pageNum }"
            @click="changePage(pageNum)"
          >
            {{ pageNum }}
          </button>
          
          <button 
            class="join-item btn" 
            :class="{ 'btn-disabled': pagination.page >= pagination.pages }"
            @click="changePage(pagination.page + 1)"
            :disabled="pagination.page >= pagination.pages"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
      
      <!-- 页码信息 -->
      <div class="text-center text-sm text-gray-500 mt-2">
        第 {{ pagination.page }} 页，共 {{ pagination.pages }} 页，总计 {{ pagination.total }} 条记录
      </div>

      <!-- 用户详情模态框 -->
      <dialog ref="userDetailModal" class="modal">
        <div class="modal-box">
          <h3 class="font-bold text-lg">用户详情</h3>
          <div v-if="selectedUser" class="py-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm font-semibold">用户ID</p>
                <p>{{ selectedUser.customId }}</p>
              </div>
              <div>
                <p class="text-sm font-semibold">用户名</p>
                <p>{{ selectedUser.username }}</p>
              </div>
              <div>
                <p class="text-sm font-semibold">角色</p>
                <div class="badge" :class="getRoleBadgeClass(selectedUser.role)">
                  {{ getRoleLabel(selectedUser.role) }}
                </div>
              </div>
              <div>
                <p class="text-sm font-semibold">状态</p>
                <div class="badge" :class="getStatusBadgeClass(selectedUser.status)">
                  {{ getStatusLabel(selectedUser.status) }}
                </div>
              </div>
              <div>
                <p class="text-sm font-semibold">创建时间</p>
                <p>{{ formatDate(selectedUser.createdAt) }}</p>
              </div>
              <div>
                <p class="text-sm font-semibold">更新时间</p>
                <p>{{ formatDate(selectedUser.updatedAt) }}</p>
              </div>
              <div v-if="selectedUser.lastLoginAt">
                <p class="text-sm font-semibold">最后登录</p>
                <p>{{ formatDate(selectedUser.lastLoginAt) }}</p>
              </div>
            </div>
          </div>
          <div class="modal-action">
            <form method="dialog">
              <button class="btn">关闭</button>
            </form>
          </div>
        </div>
      </dialog>

      <!-- 编辑用户模态框 -->
      <dialog ref="editUserModal" class="modal">
        <div class="modal-box">
          <h3 class="font-bold text-lg">编辑用户</h3>
          <div v-if="editingUser" class="py-4">
            <div class="form-control w-full mb-4">
              <label class="label">
                <span class="label-text">用户名</span>
              </label>
              <input 
                type="text" 
                v-model="editingUser.username" 
                class="input input-bordered w-full" 
              />
            </div>
            <div class="form-control w-full mb-4">
              <label class="label">
                <span class="label-text">角色</span>
              </label>
              <select v-model="editingUser.role" class="select select-bordered w-full">
                <option value="parent">家长</option>
                <option value="teacher">教师</option>
                <option value="admin">管理员</option>
              </select>
            </div>
            <div class="form-control w-full mb-4">
              <label class="label">
                <span class="label-text">状态</span>
              </label>
              <select v-model="editingUser.status" class="select select-bordered w-full">
                <option value="active">正常</option>
                <option value="inactive">未激活</option>
                <option value="suspended">已封禁</option>
              </select>
            </div>
          </div>
          <div class="modal-action">
            <button @click="saveUser" class="btn btn-primary">保存</button>
            <form method="dialog">
              <button class="btn">取消</button>
            </form>
          </div>
        </div>
      </dialog>

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
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import userService from '../services/userService'
import { useToast } from 'vue-toastification'

// 状态
const users = ref([])
const loading = ref(false)
const error = ref(null)

// 分页配置
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
  pages: 1
})

// 筛选条件
const filters = reactive({
  role: '',
  status: ''
})

// 模态框引用
const userDetailModal = ref(null)
const editUserModal = ref(null)
const deleteConfirmModal = ref(null)

// 选中的用户
const selectedUser = ref(null)
const editingUser = ref(null)
const userToDelete = ref(null)

// 初始化 toast
const toast = useToast()

// 显示提示信息
const showToast = (type, message) => {
  if (type === 'success') {
    toast.success(message)
  } else if (type === 'error') {
    toast.error(message)
  } else if (type === 'warning') {
    toast.warning(message)
  } else {
    toast.info(message)
  }
}

// 加载用户列表
const loadUsers = async (forceRefresh = false) => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...filters,
      forceRefresh // 添加强制刷新参数
    }
    
    console.log('[UsersView] 请求参数:', params)
    
    // 使用新的分页接口方法
    const response = await userService.getUsersByLimit(params)
    
    console.log('[UsersView] API 原始响应数据:', response)
    
    if (response && response.status === 'success') {
      // 直接使用后端返回的数据
      users.value = response.data || []
      
      // 处理分页信息
      if (response.pagination) {
        pagination.total = response.pagination.total || 0
        pagination.page = response.pagination.page || 1
        pagination.limit = response.pagination.limit || 10
        pagination.pages = response.pagination.pages || 1
      }
      
      console.log('[UsersView] 处理后的用户数据:', users.value)
      console.log('[UsersView] 分页信息:', pagination)
    } else {
      error.value = response?.message || '获取用户列表失败'
      showToast('error', error.value)
    }
  } catch (err) {
    console.error('[UsersView] 加载用户错误:', err)
    error.value = err.message || '获取用户列表失败'
    showToast('error', error.value)
  } finally {
    loading.value = false
  }
}

// 刷新用户列表
const refreshUsers = () => {
  loadUsers()
}

const refreshData = () => {
  loadUsers(true) // 强制刷新缓存
}

// 应用筛选条件
const applyFilters = () => {
  pagination.page = 1 // 重置到第一页
  loadUsers()
}

// 切换页码
const changePage = (page) => {
  if (page < 1 || page > pagination.pages) return
  pagination.page = page
  loadUsers()
}

// 获取要显示的页码数组
const getPageNumbers = () => {
  const current = pagination.page
  const total = pagination.pages
  const delta = 2 // 当前页前后显示的页码数
  
  if (total <= 5) {
    // 总页数小于等于5，显示所有页码
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  
  // 计算页码范围
  let start = Math.max(1, current - delta)
  let end = Math.min(total, current + delta)
  
  // 调整范围，确保显示5个页码
  if (end - start + 1 < 5) {
    if (start === 1) {
      end = Math.min(5, total)
    } else if (end === total) {
      start = Math.max(1, total - 4)
    }
  }
  
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

// 查看用户详情
const viewUser = async (userId) => {
  try {
    const response = await userService.getUserById(userId)
    if (response.status === 'success') {
      selectedUser.value = response.data.user
      userDetailModal.value.showModal()
    }
  } catch (error) {
    console.error('获取用户详情失败:', error)
  }
}

// 编辑用户
const editUser = async (userId) => {
  try {
    const response = await userService.getUserById(userId)
    if (response.status === 'success') {
      editingUser.value = { ...response.data.user }
      editUserModal.value.showModal()
    }
  } catch (error) {
    console.error('获取用户详情失败:', error)
  }
}

// 保存用户
const saveUser = async () => {
  if (!editingUser.value) return
  
  try {
    const userId = editingUser.value.customId
    const userData = {
      username: editingUser.value.username
    }
    
    // 更新用户基本信息
    await userService.updateUser(userId, userData)
    
    // 如果角色发生变化，更新角色
    if (editingUser.value.role !== selectedUser.value.role) {
      await userService.updateUserRole(userId, editingUser.value.role)
    }
    
    // 如果状态发生变化，更新状态
    if (editingUser.value.status !== selectedUser.value.status) {
      await userService.updateUserStatus(userId, editingUser.value.status)
    }
    
    // 关闭模态框并刷新列表
    editUserModal.value.close()
    loadUsers()
  } catch (error) {
    console.error('保存用户失败:', error)
    alert('保存用户失败: ' + error.message)
  }
}

// 确认删除用户
const confirmDeleteUser = (userId) => {
  userToDelete.value = userId
  deleteConfirmModal.value.showModal()
}

// 删除用户
const deleteUser = async () => {
  if (!userToDelete.value) return
  
  try {
    const response = await userService.deleteUser(userToDelete.value)
    if (response.status === 'success') {
      // 关闭模态框并刷新列表
      deleteConfirmModal.value.close()
      loadUsers()
    }
  } catch (error) {
    console.error('删除用户失败:', error)
    alert('删除用户失败: ' + error.message)
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
    'suspended': '已封禁'
  }
  return labels[status] || status
}

const getStatusBadgeClass = (status) => {
  const classes = {
    'active': 'badge-success',
    'inactive': 'badge-warning',
    'suspended': 'badge-error'
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

// 调试按钮点击事件
const debugApi = async () => {
  console.log('调试按钮点击事件')
  try {
    const result = await userService.debugGetUsers()
    console.log('调试 API 返回结果:', result)
    
    if (result && result.status === 'success') {
      // 直接使用调试返回的数据更新界面
      users.value = result.data || []
      
      // 更新分页信息
      if (result.pagination) {
        pagination.total = result.pagination.total || 0
        pagination.page = result.pagination.page || 1
        pagination.limit = result.pagination.limit || 10
        pagination.pages = result.pagination.pages || 1
      }
      
      console.log('调试: 用户数据已更新', users.value)
    } else {
      console.error('调试: API 返回错误', result)
    }
  } catch (err) {
    console.error('调试出错:', err)
  }
}

// 监听分页参数变化
watch(
  () => pagination.page,
  (newPage, oldPage) => {
    if (newPage !== oldPage) {
      console.log(`分页从第 ${oldPage} 页切换到第 ${newPage} 页`);
      loadUsers();
    }
  }
);

// 监听筛选条件变化
watch(
  filters,
  () => {
    // 筛选条件变化时，重置到第一页
    pagination.page = 1;
    loadUsers();
  },
  { deep: true }
);

// 页面加载时获取用户列表
onMounted(() => {
  loadUsers()
})
</script>
