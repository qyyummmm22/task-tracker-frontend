<template>
  <div class="bg-white p-6 rounded-lg shadow-md mb-6">
    <h2 class="text-2xl font-bold mb-4 text-gray-800 text-center">Manage User Accounts</h2>

    <p v-if="loading" class="text-center text-gray-600">Loading users...</p>
    <p v-else-if="error" class="text-center text-red-500">{{ error }}</p>
    <div v-else-if="users.length === 0" class="text-center py-12 text-gray-500">
      <p class="text-2xl font-semibold mb-2">🚫 No user accounts to manage!</p>
      <p class="text-md">Register new users to see them here.</p>
    </div>

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
            <td class="py-3 px-4 border-b text-gray-600 capitalize">
              <select
                v-model="user.role"
                @change="updateUserRole(user.id, user.username, user.role)"
                :disabled="user.id === authStore.user?.id"
                :class="['block w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-1 text-sm',
                         user.id === authStore.user?.id ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white border-gray-300 focus:border-blue-500']"
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </td>
            <td class="py-3 px-4 border-b text-gray-600">{{ new Date(user.created_at).toLocaleDateString() }}</td>
            <td class="py-3 px-4 border-b text-gray-800 font-semibold">{{ user.task_count }}</td>
            <td class="py-3 px-4 border-b text-center space-x-2">
              <button
                @click="openResetPasswordModal(user)"
                :disabled="user.id === authStore.user?.id || loading"
                :class="['px-3 py-1 text-white rounded-md transition-colors duration-200 text-sm',
                         user.id === authStore.user?.id ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-500 hover:bg-purple-600']"
              >
                Reset PW
              </button>
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

  <div v-if="showResetPasswordModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
      <h2 class="text-2xl font-bold mb-4 text-gray-800">Reset Password for {{ userToReset?.username }}</h2>
      <form @submit.prevent="handlePasswordResetSubmit" class="space-y-4">
        <div>
          <label for="new-password" class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <input
            type="password"
            id="new-password"
            v-model="newPasswordInput"
            @input="validateNewPassword"
            required
            class="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            :class="{'border-red-500': newPasswordError}"
          />
          <p v-if="newPasswordError" class="text-red-500 text-xs mt-1">{{ newPasswordError }}</p>
        </div>
        <div>
          <label for="confirm-password" class="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
          <input
            type="password"
            id="confirm-password"
            v-model="confirmPasswordInput"
            @input="validateConfirmPassword"
            required
            class="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            :class="{'border-red-500': confirmPasswordError}"
          />
          <p v-if="confirmPasswordError" class="text-red-500 text-xs mt-1">{{ confirmPasswordError }}</p>
        </div>

        <div class="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            @click="closeResetPasswordModal"
            class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="loading || !isResetPasswordFormValid"
            class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Set New Password
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from 'vue-toastification';

const authStore = useAuthStore();
const users = ref([]);
const loading = ref(false);
const error = ref(null);
const toast = useToast();

// NEW: State for Reset Password Modal
const showResetPasswordModal = ref(false);
const userToReset = ref(null); // { id: number, username: string }
const newPasswordInput = ref('');
const confirmPasswordInput = ref('');
const newPasswordError = ref('');
const confirmPasswordError = ref('');


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
    users.value.forEach(user => {
      user._originalRole = user.role; // preserve for revert if needed
    });
  } catch (err) {
    error.value = err.message;
    console.error('Error fetching users:', err);
  } finally {
    loading.value = false;
  }
};

const updateUserRole = async (userId, username, newRole) => {
  if (userId === authStore.user?.id) {
    toast.error("You cannot change your own role.");
    const originalUser = users.value.find(u => u.id === userId);
    if (originalUser) originalUser.role = authStore.user.role;
    return;
  }

  if (!confirm(`Change role for "${username}" to "${newRole}"?`)) {
    const user = users.value.find(u => u.id === userId);
    if (user) user.role = user._originalRole;
    return;
  }

  loading.value = true;
  try {
    const response = await fetch(`http://localhost:3000/api/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({ newRole }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update role.');
    }

    toast.success(`Role for "${username}" updated to "${newRole}".`);
    const user = users.value.find(u => u.id === userId);
    if (user) user._originalRole = newRole;
  } catch (err) {
    toast.error(`Failed to update role: ${err.message}`);
    const user = users.value.find(u => u.id === userId);
    if (user) user.role = user._originalRole;
  } finally {
    loading.value = false;
  }
};

// const resetUserPassword = async (userId, username) => {
//   if (userId === authStore.user?.id) {
//     toast.error("You cannot reset your own password.");
//     return;
//   }
//   if (!confirm(`Reset password for "${username}"? A new password will be generated.`)) {
//     return;
//   }

//   loading.value = true;
//   try {
//     const response = await fetch(`http://localhost:3000/api/users/${userId}/reset-password`, {
//       method: 'PUT',
//       headers: {
//         'Authorization': `Bearer ${authStore.token}`,
//       },
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.message || 'Failed to reset password.');
//     }

//     const data = await response.json();
//     toast.success(`Password reset. New password: ${data.new_password}`);
//     alert(`New password for ${username}: ${data.new_password}`);
//   } catch (err) {
//     toast.error(`Failed to reset password: ${err.message}`);
//   } finally {
//     loading.value = false;
//   }
// };

const deleteUser = async (userId, username) => {
  if (userId === authStore.user?.id) {
    toast.error("You cannot delete your own account.");
    return;
  }
  if (!confirm(`Delete user "${username}" (ID: ${userId}) and all tasks?`)) return;

  loading.value = true;
  try {
    const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
      },
    });

    if (!response.ok && response.status !== 204) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete user.');
    }

    users.value = users.value.filter(user => user.id !== userId);
    toast.success(`User "${username}" deleted.`);
  } catch (err) {
    toast.error(`Delete failed: ${err.message}`);
  } finally {
    loading.value = false;
  }
};

// NEW: Open Reset Password Modal
const openResetPasswordModal = (user) => {
  userToReset.value = { id: user.id, username: user.username };
  newPasswordInput.value = ''; // Clear fields
  confirmPasswordInput.value = '';
  newPasswordError.value = ''; // Clear errors
  confirmPasswordError.value = '';
  showResetPasswordModal.value = true;
};

// NEW: Close Reset Password Modal
const closeResetPasswordModal = () => {
  showResetPasswordModal.value = false;
  userToReset.value = null;
};

// NEW: Client-side validation for New Password in Modal
const validateNewPassword = () => {
  if (!newPasswordInput.value) {
    newPasswordError.value = 'New password is required.';
  } else if (newPasswordInput.value.length < 6) { // Min length 6, match backend
    newPasswordError.value = 'Password must be at least 6 characters.';
  } else {
    newPasswordError.value = '';
  }
  validateConfirmPassword(); // Re-validate confirm password if new password changes
  return !newPasswordError.value;
};

// NEW: Client-side validation for Confirm Password in Modal
const validateConfirmPassword = () => {
  if (!confirmPasswordInput.value) {
    confirmPasswordError.value = 'Confirmation is required.';
  } else if (confirmPasswordInput.value !== newPasswordInput.value) {
    confirmPasswordError.value = 'Passwords do not match.';
  } else {
    confirmPasswordError.value = '';
  }
  return !confirmPasswordError.value;
};

// NEW: Computed property for overall form validity in modal
const isResetPasswordFormValid = computed(() => {
  return !newPasswordError.value && !confirmPasswordError.value &&
         newPasswordInput.value.length >= 6 && newPasswordInput.value === confirmPasswordInput.value;
});

// NEW: Handle Password Reset Submission from Modal
const handlePasswordResetSubmit = async () => {
  // Final validation before sending
  if (!validateNewPassword() || !validateConfirmPassword()) {
    toast.error("Please fix password errors in the form.");
    return;
  }

  if (!userToReset.value) { // Should not happen
    toast.error("Error: User not selected for password reset.");
    return;
  }

  loading.value = true; // Use the main loading state
  try {
    const response = await fetch(`http://localhost:3000/api/users/${userToReset.value.id}/reset-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({ newPassword: newPasswordInput.value }), // Send new password
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to reset password.');
    }

    toast.success(`Password for "${userToReset.value.username}" reset successfully.`);
    closeResetPasswordModal(); // Close modal on success

  } catch (err) {
    toast.error(`Failed to reset password: ${err.message}`);
    console.error('Error resetting password from modal:', err);
  } finally {
    loading.value = false;
  }
};


onMounted(fetchUsers);
</script>

<style scoped>
/* optional custom styles */
</style>
