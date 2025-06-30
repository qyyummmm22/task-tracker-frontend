<template>
  <div class="min-h-screen w-full bg-white flex items-center justify-center px-4 py-16 overflow-auto">
    <div class="w-full max-w-2xl bg-white shadow-lg rounded-lg p-8">
      <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center text-gray-900 mb-10 drop-shadow-lg">
        My Task Tracker
      </h1>

      <TaskForm class="mb-8" />
      <TaskList />
    </div>
  </div>
</template>

<script setup>
import TaskForm from './components/TaskForm.vue';
import TaskList from './components/TaskList.vue';
</script>

<style scoped>
/* No custom styles needed */
</style>
