<template>
  <AdminLayout>
    <div class="statistics-grid grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="stat-block cursor-pointer bg-[#23272f] rounded-lg shadow p-6 hover:shadow-lg transition text-white" @click="openModal('user')">
        <div class="text-lg font-bold mb-2 text-blue-300">用户数据统计</div>
        <div class="text-base font-semibold">总用户数：<span class="text-white">{{ userStats.totalUsers ?? '-' }}</span></div>
        <div class="text-base font-semibold">活跃用户：<span class="text-green-400">{{ userStats.activeUsers ?? '-' }}</span></div>
        <div class="text-base font-semibold">今日新增：<span class="text-yellow-300">{{ userStats.newUsersToday ?? '-' }}</span></div>
        <div class="mt-4">
          <PieChart v-if="userStats.roleStats" :chart-data="rolePieData" />
        </div>
        <div class="mt-6">
          <BarChart v-if="userStats.monthlyStats" :chart-data="barChartData" />
        </div>
      </div>
      <div class="stat-block cursor-pointer bg-[#23272f] rounded-lg shadow p-6 hover:shadow-lg transition text-white" @click="openModal('tutor')">
        <div class="text-lg font-bold mb-2 text-purple-300">教师用户统计</div>
        <div class="text-base font-semibold">总教师数：<span class="text-white">{{ tutorStats?.totalTutors ?? '-' }}</span></div>
        <div class="text-base font-semibold">活跃教师：<span class="text-green-400">{{ tutorStats?.activeTutors ?? '-' }}</span></div>
        <div class="text-base font-semibold">验证教师：<span class="text-yellow-300">{{ tutorStats?.verifiedTutors ?? '-' }}</span></div>
        <div class="mt-4">
          <BarChart v-if="tutorStats.locationStats" :chart-data="tutorLocationBarData" />
        </div>
      </div>
      <div class="stat-block cursor-pointer bg-[#23272f] rounded-lg shadow p-6 hover:shadow-lg transition text-white" @click="openModal('post')">
        <div class="text-lg font-bold mb-2 text-pink-300">帖子数据统计</div>
        <div class="text-base font-semibold">总帖子数：<span class="text-white">{{ postStats?.totalPosts ?? '-' }}</span></div>
        <div class="text-base font-semibold">发布帖子：<span class="text-yellow-300">{{ postStats?.publishedPosts ?? '-' }}</span></div>
        <div class="text-base font-semibold">未发布帖子：<span class="text-yellow-300">{{ postStats?.pendingPosts ?? '-' }}</span></div>
        <div class="text-base font-semibold">拒绝帖子：<span class="text-yellow-300">{{ postStats?.rejectedPosts ?? '-' }}</span></div>
      </div>
      <div class="stat-block cursor-pointer bg-[#23272f] rounded-lg shadow p-6 hover:shadow-lg transition text-white" @click="openModal('match')">
        <div class="text-lg font-bold mb-2 text-cyan-300">匹配数据统计</div>
        <div class="text-base font-semibold">总匹配数：<span class="text-white">{{ matchStats?.totalMatches ?? '-' }}</span></div>
        <div class="text-base font-semibold">接收匹配：<span class="text-yellow-300">{{ matchStats?.acceptedMatches ?? '-' }}</span></div>
        <div class="text-base font-semibold">拒绝匹配：<span class="text-yellow-300">{{ matchStats?.rejectedMatches  ?? '-' }}</span></div>
      </div>
    </div>

    <!-- 用户统计弹窗 -->
    <StatisticsModal v-if="showModal==='user'" :title="'用户数据统计'" @close="closeModal">
      <UserStatisticsDetail :data="userStats" />
    </StatisticsModal>
    <!-- 教师统计弹窗 -->
    <StatisticsModal v-if="showModal==='tutor'" :title="'教师数据统计'" @close="closeModal">
      <TutorStatisticsDetail :data="tutorStats" />
    </StatisticsModal>
    <!-- 帖子、匹配统计弹窗可按需后续扩展 -->
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import StatisticsModal from '@/components/StatisticsModal.vue'
import UserStatisticsDetail from '@/components/UserStatisticsDetail.vue'
import PieChart from '@/components/PieChart.vue'
import BarChart from '@/components/BarChart.vue'
import TutorStatisticsDetail from '@/components/TutorStatisticsDetail.vue'
import { useStatisticsStore } from '@/stores/statisticsStore'

const statisticsStore = useStatisticsStore()
const { userStats, tutorStats, postStats, matchStats, fetchAllStatistics } = statisticsStore

const showModal = ref('')
const openModal = type => showModal.value = type
const closeModal = () => showModal.value = ''

const rolePieData = computed(() => {
  if (!userStats.roleStats) return null
  return {
    labels: userStats.roleStats.map(r => r._id),
    datasets: [{
      data: userStats.roleStats.map(r => r.count),
      backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0']
    }]
  }
})

const barChartData = computed(() => {
  if (!userStats.monthlyStats) return null
  return {
    labels: userStats.monthlyStats.map(m => `${m._id.year}-${m._id.month}`),
    datasets: [{
      label: '注册数',
      data: userStats.monthlyStats.map(m => m.count),
      backgroundColor: '#36A2EB'
    }]
  }
})

const tutorLocationBarData = computed(() => {
  if (!tutorStats.locationStats) return null
  return {
    labels: tutorStats.locationStats.map(l => l._id),
    datasets: [{
      label: '教师数',
      data: tutorStats.locationStats.map(l => l.count),
      backgroundColor: '#8B5CF6'
    }]
  }
})

onMounted(() => fetchAllStatistics())
</script>