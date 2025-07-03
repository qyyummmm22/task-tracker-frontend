<template>
  <div class="bg-white p-6 rounded-lg shadow-md mb-6">
    <h2 class="text-2xl font-bold mb-4 text-gray-800 text-center">My Profile</h2>

    <div class="space-y-4 mb-8">
      <p class="text-lg text-gray-700"><strong>Username:</strong> {{ user?.username }}</p>
      <p class="text-lg text-gray-700"><strong>Role:</strong> <span class="capitalize">{{ user?.role }}</span></p>
      <p class="text-lg text-gray-700"><strong>Joined:</strong> {{ new Date(user?.created_at).toLocaleDateString() }}</p>
    </div>

    <hr class="my-6 border-gray-200" />

    <h3 class="text-xl font-bold mb-4 text-gray-800">Change Password</h3>
    <form @submit.prevent="handleChangePassword" class="space-y-4">
      <div>
        <label for="old-password" class="block text-sm font-medium text-gray-700 mb-1">Old Password</label>
        <input
          type="password"
          id="old-password"
          v-model="oldPassword"
          @input="validateOldPassword"
          required
          class="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          :class="{'border-red-500': oldPasswordError}"
        />
        <p v-if="oldPasswordError" class="text-red-500 text-xs mt-1">{{ oldPasswordError }}</p>
      </div>
      <div>
        <label for="new-password" class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
        <input
          type="password"
          id="new-password"
          v-model="newPassword"
          @input="validateNewPassword"
          required
          class="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          :class="{'border-red-500': newPasswordError}"
        />
        <p v-if="newPasswordError" class="text-red-500 text-xs mt-1">{{ newPasswordError }}</p>
      </div>
      <div>
        <label for="confirm-new-password" class="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
        <input
          type="password"
          id="confirm-new-password"
          v-model="confirmNewPassword"
          @input="validateConfirmNewPassword"
          required
          class="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          :class="{'border-red-500': confirmNewPasswordError}"
        />
        <p v-if="confirmNewPasswordError" class="text-red-500 text-xs mt-1">{{ confirmNewPasswordError }}</p>
      </div>

      <div class="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          @click="$emit('back-to-tasks')"
          class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="loading || !isFormValid"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Change Password
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from "vue-toastification";

const authStore = useAuthStore();
const toast = useToast();

const user = ref(null); // Current user's profile data
const loading = ref(false);

const oldPassword = ref('');
const newPassword = ref('');
const confirmNewPassword = ref('');
const oldPasswordError = ref('');
const newPasswordError = ref('');
const confirmNewPasswordError = ref('');

const emit = defineEmits(['back-to-tasks']); // To go back to task list

const fetchUserProfile = async () => {
  loading.value = true;
  try {
    const response = await fetch('http://localhost:3000/api/users/me', {
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch user profile.');
    }
    user.value = await response.json();
  } catch (err) {
    toast.error(`Failed to load profile: ${err.message}`);
    console.error('Error fetching user profile:', err);
  } finally {
    loading.value = false;
  }
};

const validateOldPassword = () => {
  if (!oldPassword.value) {
    oldPasswordError.value = 'Old password is required.';
  } else {
    oldPasswordError.value = '';
  }
  return !oldPasswordError.value;
};

const validateNewPassword = () => {
  if (!newPassword.value) {
    newPasswordError.value = 'New password is required.';
  } else if (newPassword.value.length < 6) {
    newPasswordError.value = 'Password must be at least 6 characters.';
  } else if (newPassword.value === oldPassword.value) {
    newPasswordError.value = 'New password cannot be the same as old password.';
  } else {
    newPasswordError.value = '';
  }
  validateConfirmNewPassword(); // Re-validate confirm password
  return !newPasswordError.value;
};

const validateConfirmNewPassword = () => {
  if (!confirmNewPassword.value) {
    confirmNewPasswordError.value = 'Confirmation is required.';
  } else if (confirmNewPassword.value !== newPassword.value) {
    confirmNewPasswordError.value = 'Passwords do not match.';
  } else {
    confirmNewPasswordError.value = '';
  }
  return !confirmNewPasswordError.value;
};

const isFormValid = computed(() => {
  return !oldPasswordError.value && !newPasswordError.value && !confirmNewPasswordError.value &&
         oldPassword.value && newPassword.value && confirmNewPassword.value &&
         newPassword.value.length >= 6 && newPassword.value === confirmNewPassword.value &&
         newPassword.value !== oldPassword.value;
});

const handleChangePassword = async () => {
  if (!validateOldPassword() || !validateNewPassword() || !validateConfirmNewPassword()) {
    toast.error("Please fix errors in the password change form.");
    return;
  }

  loading.value = true;
  try {
    const response = await fetch('http://localhost:3000/api/users/me/password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({
        oldPassword: oldPassword.value,
        newPassword: newPassword.value,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to change password.');
    }

    toast.success('Password changed successfully!');
    // Clear form fields after success
    oldPassword.value = '';
    newPassword.value = '';
    confirmNewPassword.value = '';
    // Optional: Log user out or force token refresh (for changed password)
    // For simplicity, we just clear fields and rely on next login for new password check.
  } catch (err) {
    toast.error(`Failed to change password: ${err.message}`);
    console.error('Error changing password:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchUserProfile);
</script>

<style scoped>
/* No specific scoped styles needed */
</style>