<template>
  <div>
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { Chart, PieController, ArcElement, Tooltip, Legend } from 'chart.js'
Chart.register(PieController, ArcElement, Tooltip, Legend)

const props = defineProps({
  chartData: Object
})
const canvas = ref(null)
let chartInstance = null

const renderChart = () => {
  if (chartInstance) chartInstance.destroy()
  if (!props.chartData) return
  chartInstance = new Chart(canvas.value, {
    type: 'pie',
    data: props.chartData,
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } }
    }
  })
}

onMounted(renderChart)
watch(() => props.chartData, renderChart, { deep: true })
</script>
