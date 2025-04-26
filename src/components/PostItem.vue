<template>
  <div
    class="post-item bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-4 mb-4 hover:shadow-md transition-shadow duration-200"
  >
    <div class="flex justify-between">
      <div class="post-header">
        <h3 class="text-lg fo
        nt-medium text-gray-300">请求ID: {{ post.requestId || post._id }}</h3>
        <div class="flex items-center mt-1">
          <StatusBadge :status="post.status" />
          <span class="text-gray-500 text-sm ml-2">{{ formatDate(post.createdAt) }}</span>
        </div>
      </div>
      <div class="post-actions flex space-x-4">
        <router-link 
          :to="{ name: 'post-detail', params: { id: post.requestId } }"
          class="text-blue-500 hover:text-blue-400 transition-colors duration-200"
        >
          详情页
        </router-link>
      </div>
    </div>

    <div class="post-content mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
      <div class="flex items-center">
        <span class="text-gray-400 mr-2">地区:</span>
        <span class="text-gray-300">{{ formatLocation(post.location) }}</span>
      </div>
      <div class="flex items-center">
        <span class="text-gray-400 mr-2">科目:</span>
        <span class="text-gray-300">{{ formatSubjects(post.subjects) }}</span>
      </div>
      <div class="flex items-center">
        <span class="text-gray-400 mr-2">年级:</span>
        <span class="text-gray-300">{{ formatGrade(post.grade) }}</span>
      </div>
      <div class="flex items-center">
        <span class="text-gray-400 mr-2">预算:</span>
        <span class="text-gray-300">{{ formatBudget(post.preferences?.budget) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import StatusBadge from './StatusBadge.vue'

defineProps({
  post: {
    type: Object,
    required: true,
  },
})

defineEmits(['review'])

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

function formatSubjects(subjects) {
  if (!subjects || !Array.isArray(subjects)) return '无'

  if (typeof subjects[0] === 'string') {
    return subjects.join(', ')
  }

  return subjects.map((subject) => subject.name).join(', ')
}

function formatGrade(grade) {
  if (!grade) return '未知年级'

  const gradeMap = {
    primary_1: '小学一年级',
    primary_2: '小学二年级',
    primary_3: '小学三年级',
    primary_4: '小学四年级',
    primary_5: '小学五年级',
    primary_6: '小学六年级',
    junior_1: '初中一年级',
    junior_2: '初中二年级',
    junior_3: '初中三年级',
    senior_1: '高中一年级',
    senior_2: '高中二年级',
    senior_3: '高中三年级',
  }

  return gradeMap[grade] || grade
}

function formatLocation(location) {
  if (!location) return '未知'

  const { city, district } = location
  if (city && district) {
    return `${city} ${district}`
  } else if (city) {
    return city
  } else if (district) {
    return district
  }

  return '未知'
}

function formatBudget(budget) {
  if (!budget) return '未设置'

  const { min, max, period } = budget
  const periodText =
    {
      per_hour: '每小时',
      per_session: '每课时',
      per_day: '每天',
      per_week: '每周',
      per_month: '每月',
    }[period] || '未知'

  if (min && max) {
    return `¥${min}-${max} ${periodText}`
  } else if (min) {
    return `¥${min}+ ${periodText}`
  } else if (max) {
    return `¥${max}以下 ${periodText}`
  }

  return '未设置'
}
</script>
