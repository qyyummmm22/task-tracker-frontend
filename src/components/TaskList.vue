<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-4 text-gray-800">Your Tasks</h2>
    <p v-if="taskStore.loading" class="text-center text-gray-600">Loading tasks...</p>
    <p v-else-if="taskStore.error" class="text-center text-red-500">{{ taskStore.error }}</p>
    <div v-else-if="taskStore.tasks.length === 0" class="text-center text-gray-500 p-4">
      No tasks found. Add a new task above!
    </div>
    <div v-else>
      <TaskItem v-for="task in taskStore.tasks" :key="task.id" :task="task" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'; // <--- NEW: watch for prop changes
import { useTaskStore } from '@/stores/taskStore';
import TaskItem from './TaskItem.vue';

const taskStore = useTaskStore();

// NEW: Define userIdFilter prop
const props = defineProps({
  userIdFilter: {
    type: Number, // Expecting user ID as a number
    default: null, // Default is null, meaning fetch current user's tasks (or all for admin if not filtered)
  },
});

// Function to fetch tasks based on current filter
const loadTasks = () => {
  taskStore.fetchTasks(props.userIdFilter);
};

// Fetch tasks when the component is mounted
onMounted(loadTasks);

// Watch for changes in userIdFilter prop (when admin switches user view)
watch(() => props.userIdFilter, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    loadTasks(); // Reload tasks when filter changes
  }
});
</script>

<style scoped>
/* No specific scoped styles needed if using Tailwind extensively */
</style>