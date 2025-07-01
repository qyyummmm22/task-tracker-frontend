<template>
  <div class="bg-white p-6 rounded-lg shadow-md mb-6">
    <h2 class="text-2xl font-bold mb-4 text-gray-800 text-center">Register New Account</h2>
    <form @submit.prevent="handleRegister" class="space-y-4">
      <div>
        <label for="register-username" class="block text-sm font-medium text-gray-700 mb-1">Username</label>
        <input
          type="text"
          id="register-username"
          v-model="username"
          placeholder="Choose a username"
          required
          class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-900"
        />
      </div>
      <div>
        <label for="register-password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          id="register-password"
          v-model="password"
          placeholder="Choose a strong password"
          required
          class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-900"
        />
      </div>
      <div>
        <label for="role" class="block text-sm font-medium text-gray-700 mb-1">Role</label>
        <select
          id="role"
          v-model="role"
          class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        >
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <button
        type="submit"
        :disabled="authStore.loading"
        class="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ authStore.loading ? 'Registering...' : 'Register' }}
      </button>
    </form>
    <p v-if="authStore.error" class="text-red-500 text-sm mt-3 text-center">{{ authStore.error }}</p>
    <p class="text-center text-sm text-gray-600 mt-4">
      Already have an account? <a href="#" @click.prevent="$emit('toggle-mode')" class="text-blue-600 hover:underline">Login here.</a>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();
const username = ref('');
const password = ref('');
const role = ref('staff'); // Default to staff

const emit = defineEmits(['toggle-mode']); // Emit event to switch between login/register

const handleRegister = async () => {
  const success = await authStore.register(username.value, password.value, role.value);
  if (success) {
    alert('Registration successful! You are now logged in.');
    // Optionally, clear form or redirect
    username.value = '';
    password.value = '';
    role.value = 'staff';
  }
};
</script>

<style scoped>
/* Scoped styles specific to RegisterForm */
</style>