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
          @input="validateUsername" placeholder="Your username"
          required
          class="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-900"
          :class="{'border-red-500': usernameError}" />
        <p v-if="usernameError" class="text-red-500 text-xs mt-1">{{ usernameError }}</p> </div>
      <div>
        <label for="login-password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          id="login-password"
          v-model="password"
          @input="validatePassword" placeholder="Your password"
          required
          class="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-900"
          :class="{'border-red-500': passwordError}" />
        <p v-if="passwordError" class="text-red-500 text-xs mt-1">{{ passwordError }}</p> </div>

      <button
        type="submit"
        :disabled="authStore.loading || !isFormValid" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
import { ref, computed } from 'vue'; // NEW: computed
import { useAuthStore } from '@/stores/authStore';
import { useToast } from "vue-toastification";

const authStore = useAuthStore();
const toast = useToast();

const username = ref('');
const password = ref('');

// NEW: Validation error messages
const usernameError = ref('');
const passwordError = ref('');

const emit = defineEmits(['toggle-mode']);

// NEW: Validation methods
const validateUsername = () => {
  if (!username.value) {
    usernameError.value = 'Username is required.';
  } else {
    usernameError.value = '';
  }
  return !usernameError.value;
};

const validatePassword = () => {
  if (!password.value) {
    passwordError.value = 'Password is required.';
  } else {
    passwordError.value = '';
  }
  return !passwordError.value;
};

// NEW: Overall form validation
const validateForm = () => {
  const isUsernameValid = validateUsername();
  const isPasswordValid = validatePassword();
  return isUsernameValid && isPasswordValid;
};

// NEW: Computed property to check if form is generally valid
const isFormValid = computed(() => {
  // Initial check ensures errors are not shown prematurely
  if (!username.value || !password.value) return false;
  
  // If fields have content, then check against validation rules
  return !usernameError.value && !passwordError.value;
});

const handleLogin = async () => {
  // NEW: Perform validation before sending to backend
  if (!validateForm()) {
    toast.error("Please fill in all required fields.");
    return;
  }

  const result = await authStore.login(username.value, password.value);
  if (result.success) {
    toast.success(result.message);
    // Clear validation errors after successful submission
    usernameError.value = '';
    passwordError.value = '';
  } else {
    toast.error(result.message);
  }
};
</script>

<style scoped> /* ... */ </style>