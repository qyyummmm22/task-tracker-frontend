<template>
  <div class="p-4 sm:p-8 bg-gray-100 min-h-screen">
    <!-- Admin Hub Navigation -->
    <div v-if="currentAdminView === 'overview'" class="bg-white shadow-xl rounded-xl p-10 max-w-3xl mx-auto text-center mb-10 transition-all duration-300">
      <h2 class="text-4xl font-extrabold text-gray-900 mb-4">Admin Panel</h2>
      <p class="text-lg text-gray-600 mb-6">Choose an action:</p>
      <div class="flex flex-col sm:flex-row justify-center gap-4">
        <button
          @click="currentAdminView = 'manage-users'"
          class="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 text-lg font-semibold"
        >
          Manage User Accounts
        </button>
        <button
          @click="currentAdminView = 'manage-tasks'"
          class="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transform hover:scale-105 transition-all duration-300 text-lg font-semibold"
        >
          Manage User Tasks
        </button>
      </div>
    </div>

    <!-- Context-Aware Back Button -->
    <button
      v-if="currentAdminView !== 'overview'"
      @click="
        if (viewingUserId) {
          viewingUserId = null;
          viewedUsername = '';
        } else {
          currentAdminView = 'overview';
        }
      "
      class="flex items-center gap-2 mb-6 px-4 py-2 bg-white text-gray-800 rounded-lg shadow hover:bg-gray-100 transition-all duration-300 font-medium"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
           viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      {{ backButtonText }}
    </button>

    <!-- Conditional Rendering of Sub-Views -->
    <div v-if="currentAdminView === 'manage-users'" class="transition-opacity duration-500 ease-in-out">
      <ManageUsers />
    </div>

    <div v-else-if="currentAdminView === 'manage-tasks'" class="transition-all duration-500 ease-in-out">
      <div v-if="!viewingUserId" class="bg-white rounded-xl shadow p-6">
        <!-- Controls for view mode and sorting -->
        <div class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <!-- View Toggle Buttons -->
          <div class="flex rounded-md overflow-hidden border border-gray-300">
            <button
              @click="viewMode = 'table'"
              :class="['px-4 py-2 font-semibold text-sm', viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200']"
            >
              Table View
            </button>
            <button
              @click="viewMode = 'card'"
              :class="['px-4 py-2 font-semibold text-sm', viewMode === 'card' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200']"
            >
              Card View
            </button>
          </div>

          <!-- Sort Button -->
          <button
            @click="toggleSortOrder"
            class="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 font-semibold text-sm transition"
          >
            Sort by Date: {{ sortOrder === 'asc' ? 'Oldest First (Asc)' : 'Newest First (Desc)' }}
          </button>
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

      <div v-else class="bg-white shadow rounded-xl p-6">
        <!-- Show specific user's tasks -->
        <h2 class="text-2xl font-bold mb-4 text-gray-800 text-center">
          Tasks for <span class="text-blue-600">{{ viewedUsername }}</span>
        </h2>

        <TaskForm :assign-to-user-id="viewingUserId" />
<TaskList 
  :user-id-filter="viewingUserId" 
  :username-filter="viewedUsername" 
/>

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

  return [...users.value].sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return sortOrder.value === 'asc' ? dateA - dateB : dateB - dateA;
  });
});

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
};

const showUserTasks = (userId, username) => {
  viewingUserId.value = userId;
  viewedUsername.value = username;
};

const backButtonText = computed(() => {
  if (viewingUserId.value) return 'Back to Users';
  if (currentAdminView.value === 'manage-users' || currentAdminView.value === 'manage-tasks') return 'Back to Admin Home';
  return 'Back';
});

watch(currentAdminView, (newView) => {
  if (newView === 'manage-tasks') {
    fetchUsersForTaskOverview();
  }
});

onMounted(() => {
  if (currentAdminView.value === 'manage-tasks') {
    fetchUsersForTaskOverview();
  }
});
</script>

<style scoped>
/* Optional custom styles */
</style>
