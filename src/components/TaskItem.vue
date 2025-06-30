<template>
  <div class="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm mb-3">
    <div class="flex items-center flex-grow">
      <input
        type="checkbox"
        :checked="task.completed"
        @change="toggleCompletion"
        class="mr-3 h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
      />
      <div :class="{ 'line-through text-gray-500': task.completed }">
        <h3 class="text-lg font-semibold text-gray-800">{{ task.title }}</h3>
        <p v-if="task.description" class="text-sm text-gray-600">{{ task.description }}</p>
      </div>
    </div>
    <div class="flex items-center space-x-2">
      <button
        @click="startEdit"
        class="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors duration-200"
      >
        Edit
      </button>
      <button
        @click="deleteThisTask"
        class="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
      >
        Delete
      </button>
    </div>
  </div>

  <div v-if="isEditing" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
      <h2 class="text-2xl font-bold mb-4 text-gray-800">Edit Task</h2>
      <input
        v-model="editTitle"
        placeholder="Task Title"
        class="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3 text-gray-800 "
      />
      <textarea
        v-model="editDescription"
        placeholder="Task Description (Optional)"
        rows="3"
        class="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 text-gray-800 "
      ></textarea>
      <div class="flex justify-end space-x-3">
        <button
          @click="cancelEdit"
          class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          @click="saveEdit"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useTaskStore } from '@/stores/taskStore';

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
});

const taskStore = useTaskStore();

const isEditing = ref(false);
const editTitle = ref('');
const editDescription = ref('');

const toggleCompletion = () => {
  taskStore.updateTask({ ...props.task, completed: !props.task.completed });
};

const deleteThisTask = () => {
  if (confirm('Are you sure you want to delete this task?')) {
    taskStore.deleteTask(props.task.id);
  }
};

const startEdit = () => {
  editTitle.value = props.task.title;
  editDescription.value = props.task.description || '';
  isEditing.value = true;
};

const saveEdit = () => {
  if (editTitle.value.trim() === '') {
    alert('Task title cannot be empty.');
    return;
  }
  taskStore.updateTask({
    id: props.task.id,
    title: editTitle.value.trim(),
    description: editDescription.value.trim(),
  });
  isEditing.value = false;
};

const cancelEdit = () => {
  isEditing.value = false;
};
</script>

<style scoped>
/* No specific scoped styles needed if using Tailwind extensively */
</style>