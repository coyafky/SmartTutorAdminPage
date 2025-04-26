<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div class="bg-[#23272f] rounded-lg shadow-lg relative w-[90vw] max-w-3xl p-6 text-white">
      <button class="absolute top-2 right-2 text-xl text-gray-400 hover:text-white" @click="$emit('close')">×</button>
      <h2 class="text-xl font-bold mb-4 text-blue-200">{{ title }}</h2>
      <slot />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: String
})
</script>
