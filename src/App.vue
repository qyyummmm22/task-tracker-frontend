<template>
  <div class="min-h-screen w-full bg-gray-100 py-16 px-4">
    <div class="mx-auto w-full max-w-7xl bg-white shadow-lg rounded-lg p-8">
      <div v-if="authStore.isAuthenticated" class="flex justify-between items-center mb-8">
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 drop-shadow-lg">
          My Task Tracker
        </h1>
        <div class="flex items-center space-x-4">
          <span class="text-gray-700 text-lg">Welcome, <span class="font-semibold">{{ authStore.user?.username }}</span>! ({{ authStore.user?.role }})</span>

          <button
            @click="currentView = 'profile'"
            :class="['px-4 py-2 rounded-md transition-colors duration-200', currentView === 'profile' ? 'bg-blue-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white']"
          >
            My Profile
          </button>
          
          <button
            @click="currentView = 'tasks'"
            :class="['px-4 py-2 rounded-md transition-colors duration-200', currentView === 'tasks' ? 'bg-blue-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white']"
          >
            <span v-if="authStore.isAdmin">Admin Panel</span> <span v-else>My Tasks</span> </button>


          <button
            @click="authStore.logout()"
            class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      </div>

      <h1 v-else class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center text-gray-900 mb-10 drop-shadow-lg">
        Welcome to Task Tracker!
      </h1>

      <div v-if="!authStore.isAuthenticated">
        <LoginForm v-if="authMode === 'login'" @toggle-mode="authMode = 'register'" />
        <RegisterForm v-else @toggle-mode="authMode = 'login'" />
      </div>
      
      <div v-else>
        <UserProfile v-if="currentView === 'profile'" @back-to-tasks="currentView = 'tasks'" />

        <AdminDashboard v-else-if="authStore.isAdmin" />
        <div v-else-if="currentView === 'tasks'"> <TaskForm class="mb-8" />
          <TaskList />
        </div>
        <div v-else>
            <TaskForm class="mb-8" />
            <TaskList />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import TaskForm from './components/TaskForm.vue';
import TaskList from './components/TaskList.vue';
import LoginForm from './components/LoginForm.vue';
import RegisterForm from './components/RegisterForm.vue';
import AdminDashboard from './components/AdminDashboard.vue';
import UserProfile from './components/UserProfile.vue';


const authStore = useAuthStore();
const authMode = ref('login'); // 'login' or 'register' - controls which form is shown

const currentView = ref('tasks');
</script>

<style scoped>
/* No custom styles needed here */
</style>