<template>
  <div>
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  chartData: {
    type: Object,
    required: true
  },
  chartOptions: {
    type: Object,
    default: () => ({})
  }
})

const chartCanvas = ref(null)
let chart = null

// 创建图表
const createChart = () => {
  if (chart) {
    chart.destroy()
  }
  
  const ctx = chartCanvas.value.getContext('2d')
  chart = new Chart(ctx, {
    type: 'line',
    data: props.chartData,
    options: props.chartOptions
  })
}

// 监听数据变化
watch(() => props.chartData, () => {
  if (chart) {
    chart.data = props.chartData
    chart.update()
  } else {
    createChart()
  }
}, { deep: true })

// 监听选项变化
watch(() => props.chartOptions, () => {
  if (chart) {
    chart.options = props.chartOptions
    chart.update()
  }
}, { deep: true })

// 组件挂载时创建图表
onMounted(() => {
  if (props.chartData) {
    createChart()
  }
})
</script>
