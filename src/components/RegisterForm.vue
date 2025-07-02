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
          @input="validateUsername" placeholder="Choose a username"
          required
          class="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-900"
          :class="{'border-red-500': usernameError}" />
        <p v-if="usernameError" class="text-red-500 text-xs mt-1">{{ usernameError }}</p> </div>
      <div>
        <label for="register-password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          id="register-password"
          v-model="password"
          @input="validatePassword" placeholder="Choose a strong password"
          required
          class="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-900"
          :class="{'border-red-500': passwordError}" />
        <p v-if="passwordError" class="text-red-500 text-xs mt-1">{{ passwordError }}</p> </div>
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
        :disabled="authStore.loading || !isFormValid" class="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
import { ref, computed } from 'vue'; // NEW: computed
import { useAuthStore } from '@/stores/authStore';
import { useToast } from "vue-toastification";

const authStore = useAuthStore();
const toast = useToast();

const username = ref('');
const password = ref('');
const role = ref('staff');

// NEW: Validation error messages
const usernameError = ref('');
const passwordError = ref('');

const emit = defineEmits(['toggle-mode']);

// NEW: Validation methods
const validateUsername = () => {
  if (!username.value) {
    usernameError.value = 'Username is required.';
  } else if (username.value.length < 3) {
    usernameError.value = 'Username must be at least 3 characters.';
  } else {
    usernameError.value = '';
  }
  return !usernameError.value; // Return true if valid
};

const validatePassword = () => {
  if (!password.value) {
    passwordError.value = 'Password is required.';
  } else if (password.value.length < 6) {
    passwordError.value = 'Password must be at least 6 characters.';
  } else {
    passwordError.value = '';
  }
  return !passwordError.value; // Return true if valid
};

// NEW: Overall form validation before submission
const validateForm = () => {
  const isUsernameValid = validateUsername();
  const isPasswordValid = validatePassword();
  return isUsernameValid && isPasswordValid;
};

// NEW: Computed property to check if form is generally valid (for button disabled state)
const isFormValid = computed(() => {
  // This initial check ensures errors are not shown prematurely
  // but button is disabled if fields are empty/invalid
  if (!username.value && !password.value) return false;
  
  // If fields have content, then check against validation rules
  return !usernameError.value && !passwordError.value && username.value.length >= 3 && password.value.length >= 6;
});


const handleRegister = async () => {
  // NEW: Perform validation before sending to backend
  if (!validateForm()) {
    toast.error("Please fix the errors in the form."); // Or a more specific message
    return;
  }

  const result = await authStore.register(username.value, password.value, role.value);
  if (result.success) {
    toast.success(result.message);
    username.value = '';
    password.value = '';
    role.value = 'staff';
    // Clear validation errors after successful submission
    usernameError.value = '';
    passwordError.value = '';
  } else {
    toast.error(result.message);
  }
};
</script>

<style scoped>
/* Scoped styles specific to RegisterForm */
/* You might want to add a specific style for input.border-red-500 if Tailwind doesn't give strong enough */
</style>