<template>
  <div>
    <div v-if="!viewingUserId">
      <UserTable @view-user-tasks="showUserTasks" />
    </div>
    <div v-else>
      <h2 class="text-2xl font-bold mb-4 text-gray-800 text-center">
        Tasks for <span class="text-blue-600">{{ viewedUsername }}</span>
      </h2>
      <button
        @click="clearUserTasks"
        class="mb-6 px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200"
      >
        &larr; Back to All Users
      </button>
      
      <TaskList :user-id-filter="viewingUserId" />
      
      <TaskForm :assign-to-user-id="viewingUserId" /> 
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import UserTable from './UserTable.vue'; // NEW
import TaskList from './TaskList.vue';
import TaskForm from './TaskForm.vue'; // Admin might want to add tasks for other users too

const viewingUserId = ref(null);
const viewedUsername = ref('');

const showUserTasks = (userId, username) => {
  viewingUserId.value = userId;
  viewedUsername.value = username;
};

const clearUserTasks = () => {
  viewingUserId.value = null;
  viewedUsername.value = '';
};
</script>

<style scoped>
/* No custom styles needed */
</style>