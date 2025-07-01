<template>
  <div>
    <!-- Admin Hub Navigation -->
    <div v-if="currentAdminView === 'overview'" class="text-center mb-10">
      <h2 class="text-3xl font-bold text-gray-800 mb-6">Admin Panel</h2>
      <p class="text-lg text-gray-600 mb-8">Choose an action:</p>
      <div class="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
        <button
          @click="currentAdminView = 'manage-users'"
          class="px-8 py-4 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 text-xl font-semibold"
        >
          Manage User Accounts
        </button>
        <button
          @click="currentAdminView = 'manage-tasks'; console.log('Admin view changed to:', currentAdminView);"
          class="px-8 py-4 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors duration-200 text-xl font-semibold"
        >
          Manage User Tasks
        </button>
      </div>
    </div>

    <!-- Back Button for Sub-Views -->
    <button
      v-if="currentAdminView !== 'overview'"
      @click="currentAdminView = 'overview'; viewingUserId = null; viewedUsername = '';"
      class="mb-6 px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200"
    >
      &larr; Back to Admin Home
    </button>

    <!-- Conditional Rendering of Sub-Views -->
    <div v-if="currentAdminView === 'manage-users'">
      <ManageUsers />
    </div>

    <div v-else-if="currentAdminView === 'manage-tasks'">
      <div v-if="!viewingUserId">
        <!-- Controls for view mode and sorting -->
        <div class="flex justify-between items-center mb-6">
          <!-- View Toggle Buttons -->
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

          <!-- Sort Button -->
          <div>
            <button
              @click="toggleSortOrder"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-semibold text-sm"
            >
              Sort by Date: {{ sortOrder === 'asc' ? 'Oldest First (Asc)' : 'Newest First (Desc)' }}
            </button>
          </div>
        </div>

        <!-- Display UserTable or UserCardGrid based on viewMode -->
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
        <!-- Show specific user's tasks -->
        <h2 class="text-2xl font-bold mb-4 text-gray-800 text-center">
          Tasks for <span class="text-blue-600">{{ viewedUsername }}</span>
        </h2>
        
        <TaskForm :assign-to-user-id="viewingUserId" />
        <TaskList :user-id-filter="viewingUserId" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import UserTable from './UserTable.vue';
import UserCardGrid from './UserCardGrid.vue';
import TaskList from './TaskList.vue';
import TaskForm from './TaskForm.vue';
import ManageUsers from './ManageUsers.vue';

const authStore = useAuthStore();

const currentAdminView = ref('overview');

const users = ref([]);
const loading = ref(false);
const error = ref(null);
const viewMode = ref('table');
const sortOrder = ref('desc');

const viewingUserId = ref(null);
const viewedUsername = ref('');

const fetchUsersForTaskOverview = async () => {
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
      throw new Error(errorData.message || 'Failed to fetch users for task overview.');
    }

    users.value = await response.json();
  } catch (err) {
    error.value = err.message;
    console.error('Error fetching all users for admin task overview:', err);
  } finally {
    loading.value = false;
  }
};

const sortedUsers = computed(() => {
  if (!users.value || users.value.length === 0) return [];
  
  const sorted = [...users.value].sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    
    if (sortOrder.value === 'asc') {
      return dateA.getTime() - dateB.getTime();
    } else {
      return dateB.getTime() - dateA.getTime();
    }
  });
  return sorted;
});

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

// Watch currentAdminView to fetch data only when necessary
watch(currentAdminView, (newView) => {
  if (newView === 'manage-tasks') {
    fetchUsersForTaskOverview(); // Fetch users when entering task management
  }
});

// MODIFIED: onMounted to correctly call the fetch function for task overview
onMounted(() => {
  // If the initial view is 'manage-tasks', fetch users for it.
  // Otherwise, the watch effect will handle it when the button is clicked.
  if (currentAdminView.value === 'manage-tasks') {
    fetchUsersForTaskOverview();
  }
});
</script>

<style scoped>
/* No custom styles needed */
</style>