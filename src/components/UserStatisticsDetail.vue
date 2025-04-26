<template>
  <div>
    <div class="flex gap-4 mb-4">
      <div class="card bg-[#23272f] text-white font-semibold p-4 rounded shadow">总用户数：<span class="text-blue-300">{{ data.totalUsers }}</span></div>
      <div class="card bg-[#23272f] text-white font-semibold p-4 rounded shadow">活跃用户：<span class="text-green-400">{{ data.activeUsers }}</span></div>
      <div class="card bg-[#23272f] text-white font-semibold p-4 rounded shadow">今日新增：<span class="text-yellow-300">{{ data.newUsersToday }}</span></div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- 饼图 -->
      <BarChart v-if="monthlyBarData" :chart-data="monthlyBarData" />
      <PieChart v-if="rolePieData" :chart-data="rolePieData" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import BarChart from './BarChart.vue'
import PieChart from './PieChart.vue'
const props = defineProps({ data: Object })

const rolePieData = computed(() => {
  if (!props.data.roleStats) return null
  return {
    labels: props.data.roleStats.map(r => r._id),
    datasets: [{
      data: props.data.roleStats.map(r => r.count),
      backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0']
    }]
  }
})
const monthlyBarData = computed(() => {
  if (!props.data.monthlyStats) return null
  return {
    labels: props.data.monthlyStats.map(m => `${m._id.year}-${m._id.month}`),
    datasets: [{
      label: '注册数',
      data: props.data.monthlyStats.map(m => m.count),
      backgroundColor: '#36A2EB'
    }]
  }
})
</script>
