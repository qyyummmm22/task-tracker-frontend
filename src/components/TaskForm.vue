<template>
  <div class="bg-white p-6 rounded-lg shadow-md mb-6">
    <h2 class="text-2xl font-bold mb-4 text-gray-800">{{ formTitle }}</h2>
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Title -->
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
        <input
          type="text"
          id="title"
          v-model="newTask.title"
          @input="validateTitle"
          placeholder="e.g., Finish project report"
          required
          class="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-900"
          :class="{ 'border-red-500': titleError }"
        />
        <p v-if="titleError" class="text-red-500 text-xs mt-1">{{ titleError }}</p>
      </div>

      <!-- Description -->
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

      <!-- Due Date -->
      <div>
        <label for="due_date" class="block text-sm font-medium text-gray-700 mb-1">Due Date (Optional)</label>
        <input
          type="datetime-local"
          id="due_date"
          v-model="newTask.due_date"
          class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        />
      </div>

      <!-- Priority -->
      <div>
        <label for="priority" class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
        <select
          id="priority"
          v-model="newTask.priority"
          class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <!-- Submit -->
      <button
        type="submit"
        :disabled="taskStore.loading || !isFormValid"
        class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ taskStore.loading ? 'Adding Task...' : 'Add Task' }}
      </button>
    </form>

    <p v-if="taskStore.error" class="text-red-500 text-sm mt-3">{{ taskStore.error }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useTaskStore } from '@/stores/taskStore';

const taskStore = useTaskStore();

const props = defineProps({
  assignToUserId: {
    type: Number,
    default: null,
  },
});

const newTask = ref({
  title: '',
  description: '',
  due_date: '',     // NEW
  priority: 'medium', // NEW
});

const titleError = ref('');

const formTitle = computed(() => {
  return props.assignToUserId ? `Add Task for User ID ${props.assignToUserId}` : 'Add New Task';
});

const validateTitle = () => {
  if (!newTask.value.title.trim()) {
    titleError.value = 'Task title is required.';
  } else {
    titleError.value = '';
  }
  return !titleError.value;
};

const isFormValid = computed(() => {
  return newTask.value.title.trim() !== '' && !titleError.value;
});

const handleSubmit = async () => {
  if (!validateTitle()) return;

  const formattedDueDate = newTask.value.due_date
    ? new Date(newTask.value.due_date).toISOString().slice(0, 19).replace('T', ' ')
    : null;

  const taskData = {
    title: newTask.value.title,
    description: newTask.value.description,
    due_date: formattedDueDate,
    priority: newTask.value.priority,
  };

  const success = await taskStore.addTask(taskData, props.assignToUserId);

  if (success) {
    newTask.value.title = '';
    newTask.value.description = '';
    newTask.value.due_date = '';
    newTask.value.priority = 'medium';
    titleError.value = '';
  }
};
</script>

<style scoped>
/* Tailwind CSS is used */
</style>
