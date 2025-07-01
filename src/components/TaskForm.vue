<template>
  <div class="bg-white p-6 rounded-lg shadow-md mb-6">
    <h2 class="text-2xl font-bold mb-4 text-gray-800">{{ formTitle }}</h2>
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
        <input
          type="text"
          id="title"
          v-model="newTask.title"
          placeholder="e.g., Finish project report"
          required
          class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-900"
        />
      </div>
      <div>
        <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
        <textarea
          id="description"
          v-model="newTask.description"
          placeholder="Add more details about the task..."
          rows="3"
          class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-900"
        ></textarea>
      </div>
      <button
        type="submit"
        :disabled="taskStore.loading"
        class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ taskStore.loading ? 'Adding Task...' : 'Add Task' }}
      </button>
    </form>
    <p v-if="taskStore.error" class="text-red-500 text-sm mt-3">{{ taskStore.error }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'; // NEW: computed for formTitle
import { useTaskStore } from '@/stores/taskStore';

const taskStore = useTaskStore();

// NEW: Define assignToUserId prop
const props = defineProps({
  assignToUserId: {
    type: Number,
    default: null, // Default is null, meaning assign to current logged-in user
  },
});

const newTask = ref({
  title: '',
  description: '',
});

// NEW: Computed property for dynamic form title
const formTitle = computed(() => {
  return props.assignToUserId ? `Add Task for User ID ${props.assignToUserId}` : 'Add New Task';
});

const handleSubmit = async () => {
  if (newTask.value.title.trim() === '') {
    alert('Task title is required!');
    return;
  }
  // NEW: Pass assignToUserId to addTask action
  await taskStore.addTask({ ...newTask.value }, props.assignToUserId);
  newTask.value.title = '';
  newTask.value.description = '';
};
</script>

<style scoped>
/* No specific scoped styles needed if using Tailwind extensively */
</style>