<template>
  <div class="bg-white p-6 rounded-lg shadow-md mb-6">
    <h2 class="text-2xl font-bold mb-4 text-gray-800 text-center">Login to Your Account</h2>
    <form @submit.prevent="handleLogin" class="space-y-4">
      <div>
        <label for="login-username" class="block text-sm font-medium text-gray-700 mb-1">Username</label>
        <input
          type="text"
          id="login-username"
          v-model="username"
          placeholder="Your username"
          required
          class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-900"
        />
      </div>
      <div>
        <label for="login-password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          id="login-password"
          v-model="password"
          placeholder="Your password"
          required
          class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-900"
        />
      </div>

      <button
        type="submit"
        :disabled="authStore.loading"
        class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ authStore.loading ? 'Logging in...' : 'Login' }}
      </button>
    </form>
    <p v-if="authStore.error" class="text-red-500 text-sm mt-3 text-center">{{ authStore.error }}</p>
    <p class="text-center text-sm text-gray-600 mt-4">
      Don't have an account? <a href="#" @click.prevent="$emit('toggle-mode')" class="text-blue-600 hover:underline">Register here.</a>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from "vue-toastification"; // NEW

const authStore = useAuthStore();
const username = ref('');
const password = ref('');
const toast = useToast(); // NEW


const emit = defineEmits(['toggle-mode']); // Emit event to switch between login/register

const handleLogin = async () => {
  const result = await authStore.login(username.value, password.value); // MODIFIED
  if (result.success) {
    toast.success(result.message); // MODIFIED: Use toast
    // Login successful, app.vue will react to isAuthenticated
  } else {
    toast.error(result.message); // MODIFIED: Use toast for error
  }
};
</script>

<style scoped>
/* Scoped styles specific to LoginForm */
</style>