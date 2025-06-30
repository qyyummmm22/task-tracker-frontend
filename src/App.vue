<template>
  <div class="min-h-screen bg-white flex items-center justify-center px-4 py-16">
    <div class="w-full max-w-4xl">
      <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center text-gray-900 mb-10 drop-shadow-lg">
        My Task Tracker
      </h1>

      <div class="mb-8">
        <TaskForm />
      </div>

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
