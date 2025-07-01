<template>
  <div>
    <div v-if="!viewingUserId">
      <div class="flex justify-between items-center mb-6">
        <div>
          <button
            @click="viewMode = 'table'"
            :class="['px-4 py-2 rounded-l-md font-semibold text-sm', viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300']"
          >
            Table View
          </button>
          <button
            @click="viewMode = 'card'"
            :class="['px-4 py-2 rounded-r-md font-semibold text-sm', viewMode === 'card' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300']"
          >
            Card View
          </button>
        </div>

        <div>
          <button
            @click="toggleSortOrder"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-semibold text-sm"
          >
            Sort by Date: {{ sortOrder === 'asc' ? 'Oldest First (Asc)' : 'Newest First (Desc)' }}
          </button>
        </div>
      </div>

      <UserTable 
        v-if="viewMode === 'table'" 
        :users="sortedUsers" 
        :loading="loading" 
        :error="error"
        @view-user-tasks="showUserTasks" 
      />
      <UserCardGrid 
        v-else 
        :users="sortedUsers" 
        :loading="loading" 
        :error="error"
        @view-user-tasks="showUserTasks" 
      />
    </div>
    
    <div v-else>
      <h2 class="text-2xl font-bold mb-4 text-gray-800 text-center">
        Tasks for <span class="text-blue-600">{{ viewedUsername }}</span>
      </h2>
      <button
        @click="clearUserTasks"
        class="mb-6 px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200"
      >
        &larr; Back to All Users
      </button>
      
      <TaskList :user-id-filter="viewingUserId" />
      <TaskForm :assign-to-user-id="viewingUserId" /> 
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'; // NEW: computed
import { useAuthStore } from '@/stores/authStore';
import UserTable from './UserTable.vue';
import UserCardGrid from './UserCardGrid.vue'; // NEW
import TaskList from './TaskList.vue';
import TaskForm from './TaskForm.vue';

const authStore = useAuthStore();

const users = ref([]); // Now, AdminDashboard holds the list of users
const loading = ref(false);
const error = ref(null);

const viewMode = ref('table'); // 'table' or 'card'
const sortOrder = ref('desc'); // 'asc' or 'desc' for date created

const viewingUserId = ref(null);
const viewedUsername = ref('');

// Computed property to sort users based on sortOrder
const sortedUsers = computed(() => {
  if (!users.value || users.value.length === 0) return [];
  
  const sorted = [...users.value].sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    
    if (sortOrder.value === 'asc') {
      return dateA.getTime() - dateB.getTime(); // Oldest first
    } else {
      return dateB.getTime() - dateA.getTime(); // Newest first (default)
    }
  });
  return sorted;
});

// Function to fetch all users (for admin dashboard)
const fetchAllUsers = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await fetch('http://localhost:3000/api/users', {
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch users.');
    }

    users.value = await response.json();
  } catch (err) {
    error.value = err.message;
    console.error('Error fetching all users for admin dashboard:', err);
  } finally {
    loading.value = false;
  }
};

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
};

const showUserTasks = (userId, username) => {
  viewingUserId.value = userId;
  viewedUsername.value = username;
};

const clearUserTasks = () => {
  viewingUserId.value = null;
  viewedUsername.value = '';
};

// Fetch users when component is mounted
onMounted(fetchAllUsers);
</script>

<style scoped>
/* No custom styles needed */
</style>