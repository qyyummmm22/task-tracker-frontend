<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <!-- Only show heading if not in admin view -->
    <h2 v-if="!usernameFilter" class="text-2xl font-bold mb-4 text-gray-800">
      Your Tasks
    </h2>

   <p v-if="taskStore.loading" class="text-center text-gray-600 py-4">Loading tasks...</p> <p v-else-if="taskStore.error" class="text-center text-red-500">{{ taskStore.error }}</p>
    <div v-else-if="taskStore.tasks.length === 0" class="text-center text-gray-500 p-4">
      No tasks found. Add a new task above!
    </div>
    <div v-else>
      <TaskItem v-for="task in taskStore.tasks" :key="task.id" :task="task" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue';
import { useTaskStore } from '@/stores/taskStore';
import TaskItem from './TaskItem.vue';

const taskStore = useTaskStore();

const props = defineProps({
  userIdFilter: {
    type: Number,
    default: null,
  },
  usernameFilter: {
    type: String,
    default: null,
  },
});

const loadTasks = () => {
  taskStore.fetchTasks(props.userIdFilter);
};

onMounted(loadTasks);

watch(() => props.userIdFilter, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    loadTasks();
  }
});
</script>

<style scoped>
/* No specific scoped styles needed */
</style>
