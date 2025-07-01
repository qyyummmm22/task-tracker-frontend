<template>
  <div class="bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center space-y-2 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
    <div class="bg-blue-100 rounded-full h-16 w-16 flex items-center justify-center text-blue-600 font-bold text-xl mb-2">
      {{ user.username.charAt(0).toUpperCase() }}
    </div>
    <h3 class="text-lg font-semibold text-gray-800">{{ user.username }}</h3>
    <p class="text-sm text-gray-600 capitalize">{{ user.role }}</p>
    <p class="text-xs text-gray-500">Joined: {{ new Date(user.created_at).toLocaleDateString() }}</p>
    <p class="text-sm font-medium text-gray-700">Tasks: {{ user.task_count }}</p> <button
      @click="console.log('UserCard button clicked for user:', user.id); $emit('view-user-tasks', user.id, user.username);"
      class="mt-auto px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 text-sm"
    >
      View Tasks
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['view-user-tasks']);
</script>

<style scoped>
/* No specific scoped styles needed */
</style>