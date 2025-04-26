<template>
  <div>
    <div class="flex gap-4 mb-4">
      <div class="card bg-[#23272f] text-white font-semibold p-4 rounded shadow">总教师数：<span class="text-purple-300">{{ data.totalTutors }}</span></div>
      <div class="card bg-[#23272f] text-white font-semibold p-4 rounded shadow">活跃教师：<span class="text-green-400">{{ data.activeTutors }}</span></div>
      <div class="card bg-[#23272f] text-white font-semibold p-4 rounded shadow">验证教师：<span class="text-yellow-300">{{ data.verifiedTutors }}</span></div>
    </div>
    <div class="mt-6">
      <BarChart v-if="data.locationStats" :chart-data="locationBarData" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import BarChart from './BarChart.vue'
const props = defineProps({ data: Object })

const locationBarData = computed(() => {
  if (!props.data.locationStats) return null
  return {
    labels: props.data.locationStats.map(l => l._id),
    datasets: [{
      label: '教师数',
      data: props.data.locationStats.map(l => l.count),
      backgroundColor: '#8B5CF6'
    }]
  }
})
</script>
