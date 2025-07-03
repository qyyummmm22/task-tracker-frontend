<template>
  <div class="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm mb-3">
    <div class="flex items-center flex-grow">
      <input
        type="checkbox"
        :checked="task.completed"
        @change="toggleCompletion"
        class="mr-3 h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        v-if="task.user_id === authStore.user?.id" />

      <div :class="{ 'line-through text-gray-500': task.completed }">
        <h3 class="text-lg font-semibold text-gray-800">{{ task.title }}</h3>
        <p v-if="task.description" class="text-sm text-gray-600">{{ task.description }}</p>

        <p v-if="task.added_by_username" class="text-xs text-gray-500 mt-1">
          Added by: <span class="font-medium">{{ task.added_by_username }}</span>
        </p>

        <div class="flex items-center space-x-4 text-xs text-gray-600 mt-1">
            <p v-if="task.due_date">Due: {{ formatDate(task.due_date) }}</p>
            <p :class="priorityClass(task.priority)">Priority: {{ task.priority.charAt(0).toUpperCase() + task.priority.slice(1) }}</p>
        </div>

        <div class="mt-2 text-sm">
          <div v-if="task.document_path">
            <p class="text-gray-600">Document: 
              <span 
                @click="handleDownloadDocument" 
                class="text-blue-600 hover:underline cursor-pointer"
                :title="task.document_path">
                {{ task.document_path.split('-').pop() || task.document_path }} (Download)
              </span>
              <span v-if="downloadError" class="text-red-500 text-xs ml-2">{{ downloadError }}</span>
            </p>
          </div>
          <div v-else>
            <p class="text-gray-500">No document attached.</p>
          </div>

          <div v-if="task.user_id === authStore.user?.id" class="mt-2 flex items-center space-x-2">
            <input type="file" ref="fileInput" @change="handleFileChange" accept="application/pdf" class="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
            <button
              @click="uploadDocument"
              :disabled="!selectedFile || uploadLoading"
              class="px-3 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ uploadLoading ? 'Uploading...' : 'Upload PDF' }}
            </button>
            <p v-if="uploadError" class="text-red-500 text-xs">{{ uploadError }}</p>
          </div>
        </div>

      </div>
    </div>
    <div class="flex items-center space-x-2">
      <button
        @click="startEdit"
        :disabled="uploadLoading || downloadLoading"
        class="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Edit
      </button>
      <button
        @click="openDeleteTaskModal"
        :disabled="uploadLoading || downloadLoading"
        class="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
        class="block w-full px-3 py-2 border text-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
      />
      <textarea
        v-model="editDescription"
        placeholder="Task Description (Optional)"
        rows="3"
        class="block w-full px-3 py-2 border text-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
      ></textarea>

      <div>
        <label for="edit_due_date" class="block text-sm font-medium text-gray-700 mb-1">Due Date (Optional)</label>
        <input
          type="datetime-local"
          id="edit_due_date"
          v-model="editDueDate"
          class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 mb-4"
        />
      </div>

      <div>
        <label for="edit_priority" class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
        <select
          id="edit_priority"
          v-model="editPriority"
          class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 mb-4"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>


      <div class="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          @click="cancelEdit"
          class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="loading || !isFormValid"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>

  <ConfirmModal
    v-if="showDeleteTaskModal"
    :message='`Are you sure you want to delete task "${task.title}"?`'
    @confirm="handleDeleteTaskConfirm"
    @cancel="closeDeleteTaskModal"
  />
</template>

<script setup>
import { ref } from 'vue';
import { useTaskStore } from '@/stores/taskStore';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from "vue-toastification"; // Ensure this is imported
import ConfirmModal from './ConfirmModal.vue'; // NEW: Import ConfirmModal

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
});

const taskStore = useTaskStore();
const authStore = useAuthStore();
const toast = useToast();

const isEditing = ref(false);
const editTitle = ref('');
const editDescription = ref(props.task.description || '');

// Existing: For file upload/download
const selectedFile = ref(null);
const fileInput = ref(null);
const uploadLoading = ref(false);
const uploadError = ref(null);
const downloadError = ref(null);
const downloadLoading = ref(false);

// NEW: State for Delete Task Confirmation Modal
const showDeleteTaskModal = ref(false);
// taskToDelete is implied by props.task when modal is opened from TaskItem itself

const openDeleteTaskModal = () => {
  console.log('TaskItem: Delete button clicked! Attempting to open modal for task ID:', props.task.id); // <-- ADD THIS LOG
  showDeleteTaskModal.value = true;
  console.log('TaskItem: showDeleteTaskModal.value set to:', showDeleteTaskModal.value); // <-- ADD THIS LOG
};

const formatDate = (dateString) => { /* ... unchanged ... */ };
const priorityClass = (priority) => { /* ... unchanged ... */ };
const handleFileChange = (event) => { /* ... unchanged ... */ };
const uploadDocument = async () => { /* ... unchanged ... */ };
const handleDownloadDocument = async () => { /* ... unchanged ... */ };
const toggleCompletion = () => { /* ... unchanged ... */ };
const startEdit = () => { /* ... unchanged ... */ };
const saveEdit = async () => { /* ... unchanged ... */ };
const cancelEdit = () => { /* ... unchanged ... */ };

// MODIFIED: Delete Task - opens modal
const deleteThisTask = () => { // This function now *opens* the modal
  showDeleteTaskModal.value = true; // Open the confirmation modal
};

// NEW: Handle confirmation from delete task modal
const handleDeleteTaskConfirm = async () => {
  closeDeleteTaskModal(); // Close modal immediately

  const taskIdToDelete = props.task.id;
  const taskTitleToDelete = props.task.title;
  
  try {
    const success = await taskStore.deleteTask(taskIdToDelete); 
    if (success !== false) {
      toast.success(`Task "${taskTitleToDelete}" deleted successfully.`);
    } else {
      toast.error(taskStore.error || 'Failed to delete task.');
    }
  } catch (err) {
    toast.error(`Delete failed: ${err.message}`);
    console.error('Error deleting task from modal:', err);
  }
};

// NEW: Close Delete Task Modal
const closeDeleteTaskModal = () => {
  showDeleteTaskModal.value = false;
};
</script>

<style scoped>
/* No specific scoped styles needed if using Tailwind extensively */
</style>