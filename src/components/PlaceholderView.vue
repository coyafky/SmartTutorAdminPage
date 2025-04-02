<template>
  <div class="p-4">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-2xl font-bold">{{ title }}</h2>
        <p class="text-lg my-4">此功能正在开发中，敬请期待...</p>
        <div class="flex justify-center my-8">
          <div class="loading loading-spinner loading-lg text-primary"></div>
        </div>
        <div class="card-actions justify-end">
          <button class="btn btn-primary" @click="goBack">返回</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  title: {
    type: String,
    default: '功能开发中'
  }
})

const router = useRouter()

const goBack = () => {
  router.back()
}
</script>
