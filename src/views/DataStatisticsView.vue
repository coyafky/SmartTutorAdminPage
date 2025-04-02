<template>
  <AdminLayout>
    <div class="data-statistics-view">
      <h1 class="text-2xl font-bold mb-6">数据统计</h1>

      <!-- 过滤和日期选择 -->
      <div class="filter-section bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-100">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-2">统计周期</label>
            <select
              v-model="filters.period"
              class="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              @change="handlePeriodChange"
            >
              <option value="day">日</option>
              <option value="week">周</option>
              <option value="month">月</option>
              <option value="year">年</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-600 mb-2">开始日期</label>
            <input
              v-model="filters.startDate"
              type="date"
              class="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-600 mb-2">结束日期</label>
            <input
              v-model="filters.endDate"
              type="date"
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
              @click="fetchAllStatistics"
              class="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none transition duration-200"
            >
              应用
            </button>
          </div>
        </div>
      </div>

      <!-- 统计数据标签页 -->
      <div class="tabs-container">
        <div class="tabs-header flex border-b border-gray-200 mb-6">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="px-6 py-3 font-medium text-sm focus:outline-none"
            :class="activeTab === tab.id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'"
          >
            {{ tab.name }}
          </button>
        </div>

        <!-- 用户统计 -->
        <div v-if="activeTab === 'users'" class="tab-content">
          <div v-if="loading.users" class="flex justify-center py-10">
            <div class="loader"></div>
          </div>
          <div v-else-if="error.users" class="bg-red-50 p-4 rounded-lg text-red-600 mb-6">
            {{ error.users }}
          </div>
          <div v-else-if="!userStats" class="bg-gray-50 p-4 rounded-lg text-gray-600 mb-6">
            暂无用户统计数据，请点击"应用"按钮获取数据。
          </div>
          <div v-else>
            <!-- 用户统计卡片 -->
            <div class="stats-cards grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div class="stat-card bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p class="text-sm text-gray-500">总用户数</p>
                <p class="text-xl font-bold text-gray-800">{{ userStats.totalUsers || 0 }}</p>
              </div>
              <div class="stat-card bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p class="text-sm text-gray-500">活跃用户</p>
                <p class="text-xl font-bold text-blue-600">{{ userStats.activeUsers || 0 }}</p>
              </div>
              <div class="stat-card bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p class="text-sm text-gray-500">今日新增</p>
                <p class="text-xl font-bold text-green-600">{{ userStats.newUsersToday || 0 }}</p>
              </div>
              <div class="stat-card bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p class="text-sm text-gray-500">家长用户</p>
                <p class="text-xl font-bold text-purple-600">{{ getRoleCount('parent') || 0 }}</p>
              </div>
            </div>

            <!-- 用户角色分布 -->
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
              <h2 class="text-lg font-bold mb-4">用户角色分布</h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="stat-card p-4 rounded-lg border border-gray-100">
                  <p class="text-sm text-gray-500">家长用户</p>
                  <p class="text-xl font-bold text-blue-600">{{ getRoleCount('parent') || 0 }}</p>
                </div>
                <div class="stat-card p-4 rounded-lg border border-gray-100">
                  <p class="text-sm text-gray-500">教师用户</p>
                  <p class="text-xl font-bold text-green-600">{{ getRoleCount('teacher') || 0 }}</p>
                </div>
                <div class="stat-card p-4 rounded-lg border border-gray-100">
                  <p class="text-sm text-gray-500">管理员</p>
                  <p class="text-xl font-bold text-purple-600">{{ getRoleCount('admin') || 0 }}</p>
                </div>
              </div>
            </div>

            <!-- 用户增长趋势 -->
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
              <h2 class="text-lg font-bold mb-4">用户注册趋势</h2>
              <div class="h-80">
                <LineChart 
                  v-if="userTrendData" 
                  :chartData="userTrendData" 
                  :chartOptions="lineChartOptions"
                />
              </div>
            </div>

            <!-- 用户留存率 -->
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
              <h2 class="text-lg font-bold mb-4">用户留存率</h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="stat-card p-4 rounded-lg border border-gray-100">
                  <p class="text-sm text-gray-500">1日留存</p>
                  <p class="text-xl font-bold text-blue-600">{{ userStats.retention.day1 }}%</p>
                </div>
                <div class="stat-card p-4 rounded-lg border border-gray-100">
                  <p class="text-sm text-gray-500">7日留存</p>
                  <p class="text-xl font-bold text-blue-600">{{ userStats.retention.day7 }}%</p>
                </div>
                <div class="stat-card p-4 rounded-lg border border-gray-100">
                  <p class="text-sm text-gray-500">30日留存</p>
                  <p class="text-xl font-bold text-blue-600">{{ userStats.retention.day30 }}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 教师统计 -->
        <div v-if="activeTab === 'tutors'" class="tab-content">
          <div v-if="loading.tutors" class="flex justify-center py-10">
            <div class="loader"></div>
          </div>
          <div v-else-if="error.tutors" class="bg-red-50 p-4 rounded-lg text-red-600 mb-6">
            {{ error.tutors }}
          </div>
          <div v-else-if="!tutorStats" class="bg-gray-50 p-4 rounded-lg text-gray-600 mb-6">
            暂无教师统计数据，请点击"应用"按钮获取数据。
          </div>
          <div v-else>
            <!-- 教师统计卡片 -->
            <div class="stats-cards grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div class="stat-card bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p class="text-sm text-gray-500">总教师数</p>
                <p class="text-xl font-bold text-gray-800">{{ tutorStats.totalTutors || 0 }}</p>
              </div>
              <div class="stat-card bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p class="text-sm text-gray-500">已认证教师</p>
                <p class="text-xl font-bold text-green-600">{{ tutorStats.verifiedTutors || 0 }}</p>
              </div>
              <div class="stat-card bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p class="text-sm text-gray-500">活跃教师</p>
                <p class="text-xl font-bold text-yellow-600">{{ tutorStats.activeTutors || 0 }}</p>
              </div>
            </div>

            <!-- 教师按科目分布 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 class="text-lg font-bold mb-4">教师科目分布</h2>
                <div class="h-80">
                  <BarChart 
                    v-if="tutorCategoryData" 
                    :chartData="tutorCategoryData" 
                    :chartOptions="barChartOptions"
                  />
                </div>
              </div>
              <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 class="text-lg font-bold mb-4">教师年级分布</h2>
                <div class="h-80">
                  <BarChart 
                    v-if="tutorStats.byGrade" 
                    :chartData="formatCategoryData(tutorStats.byGrade, 'grade', 'count')" 
                    :chartOptions="barChartOptions"
                  />
                </div>
              </div>
            </div>

            <!-- 教师认证率趋势 -->
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
              <h2 class="text-lg font-bold mb-4">教师认证率趋势</h2>
              <div class="h-80">
                <LineChart 
                  v-if="tutorTrendData" 
                  :chartData="tutorTrendData" 
                  :chartOptions="lineChartOptions"
                />
              </div>
            </div>

            <!-- 教师地区分布 -->
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
              <h2 class="text-lg font-bold mb-4">教师地区分布</h2>
              <div class="h-80">
                <BarChart 
                  v-if="tutorStats.byCity" 
                  :chartData="formatCategoryData(tutorStats.byCity, 'city', 'count')" 
                  :chartOptions="barChartOptions"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 帖子统计 -->
        <div v-if="activeTab === 'posts'" class="tab-content">
          <!-- 帖子统计内容 -->
          <div v-if="loading.posts" class="flex justify-center py-10">
            <div class="loader"></div>
          </div>
          <div v-else-if="error.posts" class="bg-red-50 p-4 rounded-lg text-red-600 mb-6">
            {{ error.posts }}
          </div>
          <div v-else-if="!postStats" class="bg-gray-50 p-4 rounded-lg text-gray-600 mb-6">
            暂无帖子统计数据，请点击"应用"按钮获取数据。
          </div>
          <div v-else>
            <!-- 帖子统计卡片 -->
            <div class="stats-cards grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div class="stat-card bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p class="text-sm text-gray-500">总帖子数</p>
                <p class="text-xl font-bold text-gray-800">{{ postStats.totalPosts || 0 }}</p>
              </div>
              <div class="stat-card bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p class="text-sm text-gray-500">已发布</p>
                <p class="text-xl font-bold text-green-600">{{ postStats.publishedPosts || 0 }}</p>
              </div>
              <div class="stat-card bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p class="text-sm text-gray-500">待审核</p>
                <p class="text-xl font-bold text-yellow-600">{{ postStats.pendingPosts || 0 }}</p>
              </div>
              <div class="stat-card bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p class="text-sm text-gray-500">已拒绝</p>
                <p class="text-xl font-bold text-red-600">{{ postStats.rejectedPosts || 0 }}</p>
              </div>
            </div>

            <!-- 帖子创建趋势 -->
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
              <h2 class="text-lg font-bold mb-4">帖子创建趋势</h2>
              <div class="h-80">
                <LineChart 
                  v-if="postTrendData" 
                  :chartData="postTrendData" 
                  :chartOptions="lineChartOptions"
                />
              </div>
            </div>

            <!-- 帖子分布 -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 class="text-lg font-bold mb-4">帖子科目分布</h2>
                <div class="h-80">
                  <BarChart 
                    v-if="postCategoryData" 
                    :chartData="postCategoryData" 
                    :chartOptions="barChartOptions"
                  />
                </div>
              </div>
              <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 class="text-lg font-bold mb-4">帖子年级分布</h2>
                <div class="h-80">
                  <BarChart 
                    v-if="postStats.byGrade" 
                    :chartData="formatCategoryData(postStats.byGrade, 'grade', 'count')" 
                    :chartOptions="barChartOptions"
                  />
                </div>
              </div>
              <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 class="text-lg font-bold mb-4">帖子地区分布</h2>
                <div class="h-80">
                  <BarChart 
                    v-if="postStats.byCity" 
                    :chartData="formatCategoryData(postStats.byCity, 'city', 'count')" 
                    :chartOptions="barChartOptions"
                  />
                </div>
              </div>
            </div>

            
          </div>
        </div>

        <!-- 匹配统计 -->
        <div v-if="activeTab === 'matches'" class="tab-content">
          <!-- 匹配统计内容 -->
          <div v-if="loading.matches" class="flex justify-center py-10">
            <div class="loader"></div>
          </div>
          <div v-else-if="error.matches" class="bg-red-50 p-4 rounded-lg text-red-600 mb-6">
            {{ error.matches }}
          </div>
          <div v-else-if="!matchStats" class="bg-gray-50 p-4 rounded-lg text-gray-600 mb-6">
            暂无匹配统计数据，请点击"应用"按钮获取数据。
          </div>
          <div v-else>
            <!-- 匹配统计卡片 -->
            <div class="stats-cards grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div class="stat-card bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p class="text-sm text-gray-500">总匹配数</p>
                <p class="text-xl font-bold text-gray-800">{{ matchStats.totalMatches || 0 }}</p>
              </div>
              <div class="stat-card bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p class="text-sm text-gray-500">已完成匹配</p>
                <p class="text-xl font-bold text-green-600">{{ matchStats.completedMatches || 0 }}</p>
              </div>
              <div class="stat-card bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p class="text-sm text-gray-500">待处理匹配</p>
                <p class="text-xl font-bold text-yellow-600">{{ matchStats.pendingMatches || 0 }}</p>
              </div>
            </div>

            <!-- 匹配状态分布 -->
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
              <h2 class="text-lg font-bold mb-4">匹配状态分布</h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="stat-card p-4 rounded-lg border border-gray-100">
                  <p class="text-sm text-gray-500">已接受</p>
                  <p class="text-xl font-bold text-blue-600">{{ matchStats.acceptedMatches || 0 }}</p>
                </div>
                <div class="stat-card p-4 rounded-lg border border-gray-100">
                  <p class="text-sm text-gray-500">已拒绝</p>
                  <p class="text-xl font-bold text-red-600">{{ matchStats.rejectedMatches || 0 }}</p>
                </div>
                <div class="stat-card p-4 rounded-lg border border-gray-100">
                  <p class="text-sm text-gray-500">已取消</p>
                  <p class="text-xl font-bold text-gray-600">{{ matchStats.cancelledMatches || 0 }}</p>
                </div>
              </div>
            </div>

            <!-- 匹配分布 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 class="text-lg font-bold mb-4">匹配科目分布</h2>
                <div class="h-80">
                  <BarChart 
                    v-if="matchStats.bySubject" 
                    :chartData="formatCategoryData(matchStats.bySubject, 'subject', 'count')" 
                    :chartOptions="barChartOptions"
                  />
                </div>
              </div>
              <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 class="text-lg font-bold mb-4">匹配地区分布</h2>
                <div class="h-80">
                  <BarChart 
                    v-if="matchStats.byCity" 
                    :chartData="formatCategoryData(matchStats.byCity, 'city', 'count')" 
                    :chartOptions="barChartOptions"
                  />
                </div>
              </div>
            </div>

            <!-- 匹配成功率和平均匹配时间 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 class="text-lg font-bold mb-4">匹配成功率趋势</h2>
                <div class="h-80">
                  <LineChart 
                    v-if="matchStats.successRate && matchStats.successRate.trend" 
                    :chartData="formatTrendData(matchStats.successRate.trend, 'rate')" 
                    :chartOptions="lineChartOptions"
                  />
                </div>
              </div>
              <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 class="text-lg font-bold mb-4">平均匹配时间趋势 (小时)</h2>
                <div class="h-80">
                  <LineChart 
                    v-if="matchStats.averageMatchTime && matchStats.averageMatchTime.trend" 
                    :chartData="formatTrendData(matchStats.averageMatchTime.trend, 'hours')" 
                    :chartOptions="lineChartOptions"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '../layouts/AdminLayout.vue'
import { ref, reactive, onMounted, watch, computed } from 'vue'
import LineChart from '../components/LineChart.vue'
import BarChart from '../components/BarChart.vue'
import { useStatisticsStore } from '../stores/statisticsStore'
import { storeToRefs } from 'pinia'

// 使用统计数据存储
const statisticsStore = useStatisticsStore()
const { 
  filters, 
  userStats, 
  tutorStats, 
  postStats, 
  matchStats, 
  loading, 
  error 
} = storeToRefs(statisticsStore)

const activeTab = ref('users')

const tabs = reactive([
  { id: 'users', name: '用户统计' },
  { id: 'tutors', name: '教师统计' },
  { id: 'posts', name: '帖子统计' },
  { id: 'matches', name: '匹配统计' }
])

// 图表配置
const lineChartOptions = reactive({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    tooltip: {
      mode: 'index',
      intersect: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
})

const barChartOptions = reactive({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    tooltip: {
      mode: 'index',
      intersect: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
})

// 用户统计数据计算属性
const userTrendData = computed(() => {
  if (!userStats.value || !userStats.value.monthlyStats) return null;
  return formatTrendData(userStats.value.monthlyStats, 'count');
});

const userRoleData = computed(() => {
  if (!userStats.value || !userStats.value.roleStats) return null;
  return formatCategoryData(userStats.value.roleStats, '_id', 'count');
});

// 教师统计数据计算属性
const tutorTrendData = computed(() => {
  if (!tutorStats.value || !tutorStats.value.monthlyStats) return null;
  return formatTrendData(tutorStats.value.monthlyStats, 'count');
});

const tutorCategoryData = computed(() => {
  if (!tutorStats.value || !tutorStats.value.categoryStats) return null;
  return formatCategoryData(tutorStats.value.categoryStats, 'category', 'count');
});

// 帖子统计数据计算属性
const postTrendData = computed(() => {
  if (!postStats.value || !postStats.value.monthlyStats) return null;
  return formatTrendData(postStats.value.monthlyStats, 'count');
});

const postCategoryData = computed(() => {
  if (!postStats.value || !postStats.value.categoryStats) return null;
  return formatCategoryData(postStats.value.categoryStats, 'category', 'count');
});

// 匹配统计数据计算属性
const matchTrendData = computed(() => {
  if (!matchStats.value || !matchStats.value.monthlyStats) return null;
  return formatTrendData(matchStats.value.monthlyStats, 'count');
});

const matchStatusData = computed(() => {
  if (!matchStats.value || !matchStats.value.statusStats) return null;
  return formatCategoryData(matchStats.value.statusStats, 'status', 'count');
});

// 处理周期变化
function handlePeriodChange() {
  statisticsStore.updateFilters({ period: filters.value.period })
  statisticsStore.initDateRange()
  fetchAllStatistics()
}

// 重置过滤器
function resetFilters() {
  statisticsStore.resetFilters()
  fetchAllStatistics()
}

// 获取所有统计数据
function fetchAllStatistics() {
  switch (activeTab.value) {
    case 'users':
      statisticsStore.fetchUserStatistics()
      break
    case 'tutors':
      statisticsStore.fetchTutorStatistics()
      break
    case 'posts':
      statisticsStore.fetchPostStatistics()
      break
    case 'matches':
      statisticsStore.fetchMatchStatistics()
      break
    default:
      break
  }
}

// 格式化趋势数据
function formatTrendData(trend, valueKey) {
  if (!trend || !Array.isArray(trend)) {
    return {
      labels: [],
      datasets: [{
        label: valueKey === 'count' ? '数量' : valueKey === 'rate' ? '比率' : '时间',
        data: [],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        tension: 0.4
      }]
    }
  }

  // 按照年月排序
  const sortedTrend = [...trend].sort((a, b) => {
    if (a._id && b._id) {
      if (a._id.year !== b._id.year) {
        return a._id.year - b._id.year;
      }
      return a._id.month - b._id.month;
    }
    return 0;
  });

  return {
    labels: sortedTrend.map(item => {
      if (item._id && item._id.year && item._id.month) {
        return `${item._id.year}-${item._id.month}`;
      }
      return item.date || item.period || item.month || '';
    }),
    datasets: [{
      label: valueKey === 'count' ? '数量' : valueKey === 'rate' ? '比率 (%)' : '时间 (小时)',
      data: sortedTrend.map(item => item[valueKey] || 0),
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 2,
      tension: 0.4
    }]
  }
}

// 格式化分类数据
function formatCategoryData(data, categoryKey, valueKey) {
  if (!data || !Array.isArray(data)) {
    return {
      labels: [],
      datasets: [{
        label: valueKey === 'count' ? '数量' : '比率',
        data: [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(199, 199, 199, 0.6)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)'
        ],
        borderWidth: 1
      }]
    }
  }

  // 处理角色名称显示
  const formatLabel = (label) => {
    const roleMap = {
      'admin': '管理员',
      'teacher': '教师',
      'parent': '家长',
      'student': '学生'
    };
    return roleMap[label] || label;
  };

  return {
    labels: data.map(item => formatLabel(item[categoryKey] || '未知')),
    datasets: [{
      label: valueKey === 'count' ? '数量' : '比率',
      data: data.map(item => item[valueKey] || 0),
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 159, 64, 0.6)',
        'rgba(199, 199, 199, 0.6)'
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(199, 199, 199, 1)'
      ],
      borderWidth: 1
    }]
  }
}

function getRoleCount(role) {
  if (!userStats.value || !userStats.value.roleStats) return 0;
  const roleStat = userStats.value.roleStats.find(stat => stat._id === role);
  return roleStat ? roleStat.count : 0;
}

function getTutorRoleCount(role) {
  if (!tutorStats.value || !tutorStats.value.roleStats) return 0;
  const roleStat = tutorStats.value.roleStats.find(stat => stat._id === role);
  return roleStat ? roleStat.count : 0;
}

// 组件挂载时初始化
onMounted(() => {
  statisticsStore.initDateRange()
  // 默认加载用户统计数据
  statisticsStore.fetchUserStatistics()
  
  // 监听标签页变化，加载相应数据
  watch(activeTab, (newTab) => {
    switch (newTab) {
      case 'users':
        if (!userStats.value) statisticsStore.fetchUserStatistics()
        break
      case 'tutors':
        if (!tutorStats.value) statisticsStore.fetchTutorStatistics()
        break
      case 'posts':
        if (!postStats.value) statisticsStore.fetchPostStatistics()
        break
      case 'matches':
        if (!matchStats.value) statisticsStore.fetchMatchStatistics()
        break
      default:
        break
    }
  })
})
</script>

<style scoped>
.data-statistics-view {
  padding: 1.5rem;
}

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
