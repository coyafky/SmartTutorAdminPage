<template>
  <AdminLayout>
    <div class="container mx-auto">
      <h1 class="text-2xl font-bold mb-6">管理员仪表盘</h1>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <!-- 用户统计卡片 -->
      <div class="stats shadow mb-8">
        <div class="stat">
          <div class="stat-figure text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M9 12a4 4 0 100-8 4 4 0 000 8zm6 8a6 6 0 00-12 0v2h12v-2z" />
            </svg>
          </div>
          <div class="stat-title">总用户数</div>
          <div class="stat-value text-primary">{{ userResData.totalUsers }}</div>
          <div class="stat-desc">今日新增 {{ userResData.newUsersToday }}</div>
        </div>
      </div>
      <div class="stats shadow">
          <div class="stat">
            <div class="stat-figure text-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div class="stat-title">教师数量</div>
            <div class="stat-value text-secondary">{{ tutorResData.totalTutors }}</div>
            
          </div>
        </div>
        
        <div class="stats shadow">
          <div class="stat">
            <div class="stat-figure text-accent">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <div class="stat-title">帖子数量</div>
            <div class="stat-value text-accent">{{ postResData.totalPosts }}</div>
          </div>
        </div>
        
        <div class="stats shadow">
          <div class="stat">
            <div class="stat-figure text-info">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div class="stat-title">成功匹配</div>
            <div class="stat-value text-info">{{ matchResData.totalMatches }}</div>
          </div>
        </div>
        </div>
     
      
      <!-- 待处理事项 -->
      <div class="mb-8">
        <h2 class="text-xl font-bold mb-4">待处理事项</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">
                <div class="badge badge-secondary">{{ pendingItems.teacherVerifications }}</div>
                教师资质待审核
              </h2>
              <p>有 {{ pendingItems.teacherVerifications }} 位教师的资质认证正在等待审核</p>
              <div class="card-actions justify-end">
                <router-link to="/teacher-verification" class="btn btn-primary btn-sm">
                  立即处理
                </router-link>
              </div>
            </div>
          </div>
          
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">
                <div class="badge badge-secondary">{{ pendingItems.reports }}</div>
                举报待处理
              </h2>
              <p>有 {{ pendingItems.reports }} 条举报信息需要处理</p>
              <div class="card-actions justify-end">
                <router-link to="/reports" class="btn btn-primary btn-sm">
                  立即处理
                </router-link>
              </div>
            </div>
          </div>
          
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">
                <div class="badge badge-secondary">{{ pendingItems.postReviews }}</div>
                帖子待审核
              </h2>
              <p>有 {{ pendingItems.postReviews }} 条帖子需要审核</p>
              <div class="card-actions justify-end">
                <router-link to="/posts" class="btn btn-primary btn-sm">
                  立即处理
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 最近注册用户 -->
      <div class="mb-8">
        <h2 class="text-xl font-bold mb-4">最近注册用户</h2>
        <div class="overflow-x-auto">
          <table class="table w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>用户名</th>
                <th>角色</th>
                <th>状态</th>
              
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in recentUsers" :key="user._id">
                <td>{{ user.customId }}</td>
                <td>{{ user.username }}</td>
                <td>
                  <div class="badge" :class="getRoleBadgeClass(user.role)">
                    {{ user.role }}
                  </div>
                </td>
              
                <td>
                  <div class="badge" :class="getStatusBadgeClass(user.status)">
                    {{user.status }}
                  </div>
                </td>
               
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- 系统信息 -->
      <div>
        <h2 class="text-xl font-bold mb-4">系统信息</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">服务器状态</h2>
              <div class="overflow-x-auto">
                <table class="table w-full">
                  <tbody>
                    <tr>
                      <td>CPU 使用率</td>
                      <td>
                        <progress class="progress progress-primary w-56" :value="systemInfo.cpu" max="100"></progress>
                        <span class="ml-2">{{ systemInfo.cpu }}%</span>
                      </td>
                    </tr>
                    <tr>
                      <td>内存使用率</td>
                      <td>
                        <progress class="progress progress-secondary w-56" :value="systemInfo.memory" max="100"></progress>
                        <span class="ml-2">{{ systemInfo.memory }}%</span>
                      </td>
                    </tr>
                    <tr>
                      <td>磁盘使用率</td>
                      <td>
                        <progress class="progress progress-accent w-56" :value="systemInfo.disk" max="100"></progress>
                        <span class="ml-2">{{ systemInfo.disk }}%</span>
                      </td>
                    </tr>
                    <tr>
                      <td>运行时间</td>
                      <td>{{ systemInfo.uptime }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">系统版本</h2>
              <div class="overflow-x-auto">
                <table class="table w-full">
                  <tbody>
                    <tr>
                      <td>系统版本</td>
                      <td>{{ systemInfo.version }}</td>
                    </tr>
                    <tr>
                      <td>最后更新</td>
                      <td>{{ systemInfo.lastUpdate }}</td>
                    </tr>
                    <tr>
                      <td>数据库状态</td>
                      <td>
                        <div class="badge badge-success">正常</div>
                      </td>
                    </tr>
                    <tr>
                      <td>API 状态</td>
                      <td>
                        <div class="badge badge-success">正常</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="card-actions justify-end mt-4">
                <button class="btn btn-primary btn-sm">检查更新</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>

import { computed, ref , onMounted } from 'vue'

import AdminLayout from '../layouts/AdminLayout.vue'
import { getUserStatistics, getTutorStatistics, getPostStatistics, getMatchStatistics } from '@/services/statisticsService'
import { useUserStatisticsStore } from '@/stores/userStatisticsStore'
import { getRecentUsers } from '@/services/statisticsService'
const userStats = useUserStatisticsStore()

const userResData = ref({})
const tutorResData = ref({})
const postResData = ref({})
const matchResData = ref({})
const recentUsers = ref([])


onMounted(async () => {
  const userRes = await getUserStatistics()
  console.log('获取用户统计数据:', userRes)
  console.log(userRes.data);
  console.log(userRes.data.totalUsers);
  console.log(userRes.data.newUsersToday);
  userResData.value = userRes.data
  
  const tutorRes = await getTutorStatistics()
  console.log('获取教师统计数据:', tutorRes)
  console.log(tutorRes.data);
  tutorResData.value = tutorRes.data

  const postRes = await getPostStatistics()
  console.log('获取帖子统计数据:', postRes)
  postResData.value = postRes.data
  const matchRes = await getMatchStatistics()
  console.log('获取匹配统计数据:', matchRes)
  matchResData.value = matchRes.data
  // 你可以在这里处理响应结果，如赋值到
  //  ref/computed 变量用于页面展示
})

onMounted(async () => {
  const response = await getRecentUsers()
  console.log('获取最新的用户列表:', response)
  // response.data.data 才是你要的用户数组
  recentUsers.value = response.data
  console.log('recentUsers.value:', recentUsers.value)
  
})

console.log(recentUsers.value);


const pendingItems = ref({
  teacherVerifications: 15,
  reports: 8,
  postReviews: 23
})



const systemInfo = ref({
  cpu: 32,
  memory: 45,
  disk: 68,
  uptime: '15天 7小时 23分钟',
  version: 'v1.2.5',
  lastUpdate: '2025-03-15'
})

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
    'pending': '待审核',
    'suspended': '已暂停',
    'banned': '已封禁'
  }
  return labels[status] || status
}

const getStatusBadgeClass = (status) => {
  const classes = {
    'active': 'badge-success',
    'pending': 'badge-warning',
    'suspended': 'badge-error',
    'banned': 'badge-error'
  }
  return classes[status] || 'badge-ghost'
}

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  // 实际项目中，这里应该调用API获取数据
  console.log('仪表盘组件已挂载')
})
</script>
