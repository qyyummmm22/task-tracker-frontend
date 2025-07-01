<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    <UserCard
      v-for="user in users"
      :key="user.id"
      :user="user"
      @view-user-tasks="handleViewUserTasks" />
  </div>
</template>

<script setup>
import UserCard from './UserCard.vue';

const props = defineProps({
  users: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['view-user-tasks']);

// NEW: This method will explicitly receive the arguments emitted by UserCard
const handleViewUserTasks = (userId, username) => {
  console.log('UserCardGrid: Receiving event with userId:', userId, 'and username:', username); // Debug log
  emit('view-user-tasks', userId, username); // Re-emit the event with the correctly received arguments
};
</script>

<style scoped>
/* No specific scoped styles needed */
</style>