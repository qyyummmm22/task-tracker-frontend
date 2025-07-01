<template>
  <div class="bg-white p-6 rounded-lg shadow-md mb-6">
    <h2 class="text-2xl font-bold mb-4 text-gray-800 text-center">All Users</h2>
    
    <p v-if="loading" class="text-center text-gray-600">Loading users...</p>
    <p v-else-if="error" class="text-center text-red-500">{{ error }}</p>
    <p v-else-if="users.length === 0" class="text-center text-gray-500 p-4">No users found.</p>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full bg-white border border-gray-200">
        <thead>
          <tr>
            <th class="py-2 px-4 border-b text-left text-gray-700">Username</th>
            <th class="py-2 px-4 border-b text-left text-gray-700">Role</th>
            <th class="py-2 px-4 border-b text-left text-gray-700">Created At</th>
            <th class="py-2 px-4 border-b text-center text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
            <td class="py-3 px-4 border-b text-gray-800">{{ user.username }}</td>
            <td class="py-3 px-4 border-b text-gray-600 capitalize">{{ user.role }}</td>
            <td class="py-3 px-4 border-b text-gray-600">{{ new Date(user.created_at).toLocaleDateString() }}</td>
            <td class="py-3 px-4 border-b text-center">
              <button
                @click="$emit('view-user-tasks', user.id, user.username)"
                class="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 text-sm"
              >
                View Tasks
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();
const users = ref([]);
const loading = ref(false);
const error = ref(null);

const emit = defineEmits(['view-user-tasks']); // Emit event to view tasks for a specific user

const fetchUsers = async () => {
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
    console.error('Error fetching users:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchUsers);
</script>

<style scoped>
/* No custom styles needed */
</style>