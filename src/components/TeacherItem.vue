<template>
  <div
    class="teacher-item bg-gray-800 rounded-lg shadow-md p-5 border border-gray-700 relative hover:shadow-lg transition-all duration-300"
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
        <h3 class="text-lg font-semibold text-gray-100">教师ID: {{ teacher.tutorId || teacher._id }}</h3>
        <div class="flex items-center mt-2">
          <span 
            class="ml-2 px-2 py-0.5 rounded-full text-xs font-medium"
            :class="teacher.isVerified ? 'bg-green-700 text-green-100' : 'bg-yellow-700 text-yellow-100'"
          >
            {{ teacher.isVerified ? '已认证' : '未认证' }}
          </span>
          <span class="text-gray-400 text-sm ml-2">{{ formatDate(teacher.createdAt) }}</span>
        </div>
      </div>
      <div class="teacher-actions flex space-x-3">
        <router-link
          :to="`/teachers/${teacher.tutorId || teacher._id}`"
          class="text-blue-400 hover:text-blue-300 transition-colors duration-200 flex items-center"
        >
          <span class="material-icons-outlined text-sm mr-1">visibility</span>
          查看详情
        </router-link>
        <router-link
          :to="`/teachers/${teacher.tutorId || teacher._id}/verification`"
          class="text-green-400 hover:text-green-300 transition-colors duration-200 flex items-center"
        >
          <span class="material-icons-outlined text-sm mr-1">verified</span>
          {{ teacher.isVerified ? '更新认证' : '认证教师' }}
        </router-link>
      </div>
    </div>

    <div class="teacher-content mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
      <div class="flex items-center">
        <span class="text-gray-400 mr-2 font-medium">姓名:</span>
        <span class="text-gray-200">{{ formatName(teacher) }}</span>
      </div>
      <div class="flex items-center">
        <span class="text-gray-400 mr-2 font-medium">地区:</span>
        <span class="text-gray-200">{{ formatLocation(teacher) }}</span>
      </div>
      <div class="flex items-center">
        <span class="text-gray-400 mr-2 font-medium">科目:</span>
        <span class="text-gray-200">{{ formatSubjects(teacher) }}</span>
      </div>
      <div class="flex items-center">
        <span class="text-gray-400 mr-2 font-medium">注册时间:</span>
        <span class="text-gray-200">{{ formatDate(teacher.createdAt) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import StatusBadge from './StatusBadge.vue'

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
  transition: all 0.3s ease;
}

.teacher-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2);
}
</style>
