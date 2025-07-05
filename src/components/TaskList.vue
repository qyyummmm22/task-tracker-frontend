<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h2 v-if="!usernameFilter" class="text-2xl font-bold mb-4 text-gray-800">
      Your Tasks
    </h2>
    
    <div class="mb-6 space-y-4">
      <div>
        <label for="task-search" class="sr-only">Search Tasks</label>
        <input
          type="text"
          id="task-search"
          v-model="filters.search"
          placeholder="Search tasks by title or description..."
          class="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @input="debouncedFetchTasks"
        />
      </div>

      <div class="flex flex-wrap items-center gap-4">
        <div>
          <label for="filter-completed" class="block text-sm font-medium text-gray-700 mb-1">Status:</label>
          <select
            id="filter-completed"
            v-model="filters.completed"
            @change="fetchTasksWithFilters"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option :value="null">All</option>
            <option :value="false">Pending</option>
            <option :value="true">Completed</option>
          </select>
        </div>

        <div>
          <label for="filter-priority" class="block text-sm font-medium text-gray-700 mb-1">Priority:</label>
          <select
            id="filter-priority"
            v-model="filters.priority"
            @change="fetchTasksWithFilters"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option :value="null">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        
         <!-- <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Sort:</label>
          <button
            @click="taskStore.toggleSortByDate" class="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-semibold text-sm"
          >
            Date:
            <span v-if="taskStore.sortBy === 'created_at'">
              ({{ taskStore.sortDirection === 'asc' ? 'Oldest First' : 'Newest First' }})
            </span>
            <span v-else>Default</span> </button>
        </div> -->

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">&nbsp;</label>
          <button
            @click="clearFilters"
            class="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-semibold text-sm"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
    <p v-if="taskStore.loading" class="text-center text-gray-600 py-4">Loading tasks...</p>
    <p v-else-if="taskStore.error" class="text-center text-red-500">{{ taskStore.error }}</p>
    <div v-else-if="taskStore.tasks.length === 0" class="text-center py-12 text-gray-500">
      <p class="text-2xl font-semibold mb-2">🎉 No tasks here yet!</p>
      <p class="text-md">Start by adding your first task above.</p>
    </div>
    <div v-else>
      <TaskItem v-for="task in taskStore.tasks" :key="task.id" :task="task" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
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

const filters = ref({
  search: '',
  completed: null,
  priority: null,
  startDate: null,
  endDate: null,
  sortOrder: 'desc',
});

const clearFilters = () => {
  console.log('Clear Filters button clicked!'); // <-- Add this line
  filters.value.search = '';
  filters.value.completed = null;
  filters.value.priority = null;
  filters.value.startDate = null;
  filters.value.endDate = null;
  taskStore.sortBy = 'created_at';
  taskStore.sortDirection = 'desc';
  fetchTasksWithFilters();
};

let debounceTimeout = null;

const fetchTasksWithFilters = () => {
  const currentFilters = { ...filters.value };
  if (props.userIdFilter) {
    currentFilters.userIdFilter = props.userIdFilter;
  }
  taskStore.fetchTasks(currentFilters);
};

const debouncedFetchTasks = () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    fetchTasksWithFilters();
  }, 300);
};

// const toggleSortOrder = () => {
//   filters.value.sortOrder = filters.value.sortOrder === 'asc' ? 'desc' : 'asc';
//   fetchTasksWithFilters();
// };



// --- THIS IS THE CORRECTED PART ---
// Initial fetch when component is mounted (will call fetchTasksWithFilters directly)
// The watch effect with immediate:true will also call it, so it will be called twice initially, which is harmless.
onMounted(fetchTasksWithFilters);

// Watch for changes in userIdFilter prop (when admin switches user view)
watch(() => props.userIdFilter, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    // Clear filters when viewing new user or switching from/to user filter
    filters.value.search = '';
    filters.value.completed = null;
    filters.value.priority = null;
    filters.value.startDate = null;
    filters.value.endDate = null;
    // Reset store's sorting state too
    taskStore.sortBy = 'created_at';
    taskStore.sortDirection = 'desc';
    fetchTasksWithFilters(); // Fetch tasks for new user with fresh filters
  }
}, { immediate: true }); // immediate: true ensures it runs on initial mount as well if userIdFilter is non-null
</script>

<style scoped>
/* No specific scoped styles needed */
</style>