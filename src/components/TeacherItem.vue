<template>
  <div
    class="teacher-item bg-white rounded-lg shadow-sm p-4 border border-gray-100 relative"
  >
    <div class="absolute top-2 right-2 flex space-x-2">
      <StatusBadge :status="teacher.status || 'active'" />
      <StatusBadge
        :status="teacher.isVerified ? 'verified' : 'unverified'"
        :color="teacher.isVerified ? 'success' : 'warning'"
      />
    </div>
    <div class="flex justify-between">
      <div class="teacher-header">
        <h3 class="text-lg font-medium text-gray-800">教师ID: {{ teacher.tutorId || teacher._id }}</h3>
        <div class="flex items-center mt-1">
          <span 
            class="ml-2 px-2 py-0.5 rounded-full text-xs"
            :class="teacher.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
          >
            {{ teacher.isVerified ? '已认证' : '未认证' }}
          </span>
          <span class="text-gray-500 text-sm ml-2">{{ formatDate(teacher.createdAt) }}</span>
        </div>
      </div>
      <div class="teacher-actions flex space-x-2">
        <router-link
          :to="`/teachers/${teacher.tutorId || teacher._id}`"
          class="text-blue-600 hover:text-blue-800 transition-colors duration-200"
        >
          查看详情
        </router-link>
        <router-link
          :to="`/teachers/${teacher.tutorId || teacher._id}/verification`"
          class="text-green-600 hover:text-green-800 transition-colors duration-200"
        >
          {{ teacher.isVerified ? '更新认证' : '认证教师' }}
        </router-link>
      </div>
    </div>

    <div class="teacher-content mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
      <div class="flex items-center">
        <span class="text-gray-500 mr-2">姓名:</span>
        <span class="text-gray-800">{{ formatName(teacher) }}</span>
      </div>
      <div class="flex items-center">
        <span class="text-gray-500 mr-2">地区:</span>
        <span class="text-gray-800">{{ formatLocation(teacher) }}</span>
      </div>
      <div class="flex items-center">
        <span class="text-gray-500 mr-2">科目:</span>
        <span class="text-gray-800">{{ formatSubjects(teacher) }}</span>
      </div>
      <div class="flex items-center">
        <span class="text-gray-500 mr-2">注册时间:</span>
        <span class="text-gray-800">{{ formatDate(teacher.createdAt) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import StatusBadge from './StatusBadge.vue'
import { useRouter } from 'vue-router'

defineProps({
  teacher: {
    type: Object,
    required: true,
  },
})

// 状态映射
const statusMap = {
  active: { text: '活跃', color: 'green' },
  inactive: { text: '未活跃', color: 'gray' },
  suspended: { text: '已封禁', color: 'red' },
}

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

function formatLocation(teacher) {
  if (!teacher) return '未知'
  
  // 处理两种可能的数据结构
  if (teacher.location) {
    const { city, district } = teacher.location
    if (city && district) {
      return `${city} ${district}`
    } else if (city) {
      return city
    } else if (district) {
      return district
    }
  } else if (teacher.city) {
    return teacher.city
  }
  
  return '未知'
}

function formatName(teacher) {
  if (!teacher) return '未知'
  
  // 处理两种可能的数据结构
  if (teacher.name) {
    return teacher.name
  } else if (teacher.firstName && teacher.lastName) {
    return `${teacher.firstName} ${teacher.lastName}`
  }
  
  return '未知'
}

function formatSubjects(teacher) {
  if (!teacher) return '无'
  
  // 处理两种可能的数据结构
  if (teacher.subjects && Array.isArray(teacher.subjects)) {
    return teacher.subjects.map(subject => subject.name).join(', ') || '无'
  } else if (teacher.teachingExperience && teacher.teachingExperience.subjects && Array.isArray(teacher.teachingExperience.subjects)) {
    return teacher.teachingExperience.subjects.map(subject => subject.name).join(', ') || '无'
  }
  
  return '无'
}
</script>

<style scoped>
.teacher-item {
  transition: all 0.2s ease;
}
</style>
