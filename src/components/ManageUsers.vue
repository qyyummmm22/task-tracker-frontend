<template>
  <div class="bg-white p-6 rounded-lg shadow-md mb-6">
    <h2 class="text-2xl font-bold mb-4 text-gray-800 text-center">Manage User Accounts</h2>
    
    <p v-if="loading" class="text-center text-gray-600">Loading users...</p>
    <p v-else-if="error" class="text-center text-red-500">{{ error }}</p>
    <p v-else-if="users.length === 0" class="text-center text-gray-500 p-4">No users found.</p>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full bg-white border border-gray-200">
        <thead>
          <tr>
            <th class="py-2 px-4 border-b text-left text-gray-700">ID</th>
            <th class="py-2 px-4 border-b text-left text-gray-700">Username</th>
            <th class="py-2 px-4 border-b text-left text-gray-700">Role</th>
            <th class="py-2 px-4 border-b text-left text-gray-700">Created At</th>
            <th class="py-2 px-4 border-b text-left text-gray-700">Tasks</th>
            <th class="py-2 px-4 border-b text-center text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
            <td class="py-3 px-4 border-b text-gray-800">{{ user.id }}</td>
            <td class="py-3 px-4 border-b text-gray-800">{{ user.username }}</td>
            <td class="py-3 px-4 border-b text-gray-600 capitalize">{{ user.role }}</td>
            <td class="py-3 px-4 border-b text-gray-600">{{ new Date(user.created_at).toLocaleDateString() }}</td>
            <td class="py-3 px-4 border-b text-gray-800 font-semibold">{{ user.task_count }}</td>
            <td class="py-3 px-4 border-b text-center">
              <button
                @click="deleteUser(user.id, user.username)"
                :disabled="user.id === authStore.user?.id || loading"
                :class="['px-3 py-1 text-white rounded-md transition-colors duration-200 text-sm',
                         user.id === authStore.user?.id ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600']"
              >
                Delete
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
    console.error('Error fetching all users for admin dashboard:', err);
  } finally {
    loading.value = false;
  }
};

const deleteUser = async (userId, username) => {
  if (userId === authStore.user?.id) {
    alert("You cannot delete your own account from this panel. Please ask another admin or delete directly via database if absolutely necessary.");
    return;
  }
  if (!confirm(`Are you sure you want to delete user "${username}" (ID: ${userId})? This will also delete all their tasks.`)) {
    return;
  }

  loading.value = true;
  error.value = null;
  try {
    const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
      },
    });

    if (!response.ok) {
        if (response.status !== 204) { // 204 is No Content on successful delete
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete user.');
        }
    }
    
    // If successful (204), remove user from local list
    users.value = users.value.filter(user => user.id !== userId);
    alert(`User "${username}" deleted successfully.`);

  } catch (err) {
    error.value = err.message;
    console.error('Error deleting user:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchUsers);
</script>

<style scoped>
/* No specific scoped styles needed */
</style>