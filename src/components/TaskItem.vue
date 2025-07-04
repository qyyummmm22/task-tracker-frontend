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
  @click="saveEdit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
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
import { ref, computed } from 'vue'; // Add 'computed' for isFormValid
import { useTaskStore } from '@/stores/taskStore';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from "vue-toastification";
import ConfirmModal from './ConfirmModal.vue';

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
const editDescription = ref(''); // Initialize without props.task.description to ensure it's reactive from startEdit
const editDueDate = ref(''); // Initialize
const editPriority = ref('medium'); // Initialize

// Existing: For file upload/download
const selectedFile = ref(null);
const fileInput = ref(null);
const uploadLoading = ref(false);
const uploadError = ref(null);
const downloadError = ref(null);
const downloadLoading = ref(false);

// NEW: State for Delete Task Confirmation Modal
const showDeleteTaskModal = ref(false);

const openDeleteTaskModal = () => {
  console.log('TaskItem: Delete button clicked! Attempting to open modal for task ID:', props.task.id);
  showDeleteTaskModal.value = true;
  console.log('TaskItem: showDeleteTaskModal.value set to:', showDeleteTaskModal.value);
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString.endsWith('Z') ? dateString : `${dateString}Z`);
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
  return date.toLocaleDateString(undefined, options);
};

const priorityClass = (priority) => {
  return {
    low: 'text-green-600 font-medium',
    medium: 'text-yellow-600 font-medium',
    high: 'text-red-600 font-medium',
  }[priority] || 'text-gray-600';
};

// Corrected handleFileChange function
const handleFileChange = (event) => {
  selectedFile.value = event.target.files ? event.target.files[0] : null;
  // Clear previous errors if a new file is selected
  uploadError.value = null;
};

// Corrected and consolidated uploadDocument function
const uploadDocument = async () => {
  if (!selectedFile.value) {
    toast.error('Please select a file to upload.');
    return;
  }
  if (selectedFile.value.type !== 'application/pdf') {
    toast.error('Only PDF files are allowed.');
    selectedFile.value = null;
    if (fileInput.value) fileInput.value.value = ''; // Reset file input
    return;
  }
  if (selectedFile.value.size > 5 * 1024 * 1024) { // 5MB limit
    toast.error('File size exceeds 5MB limit.');
    selectedFile.value = null;
    if (fileInput.value) fileInput.value.value = ''; // Reset file input
    return;
  }

  uploadLoading.value = true;
  uploadError.value = null; // Clear previous upload error

  try {
    const data = await taskStore.uploadTaskPdf(props.task.id, selectedFile.value);
    if (data) {
      toast.success('Document uploaded successfully.');
      props.task.document_path = data.document_path; // Update task with new document path
      selectedFile.value = null; // Reset file input
      if (fileInput.value) fileInput.value.value = ''; // Reset file input
    } else {
      toast.error(taskStore.error || 'Failed to upload document.');
    }
  } catch (err) {
    uploadError.value = err.message || 'An unexpected error occurred during upload.';
    toast.error(uploadError.value);
  } finally {
    uploadLoading.value = false;
  }
};

const handleDownloadDocument = async () => {
  downloadLoading.value = true;
  downloadError.value = null; // Clear previous download error

  try {
    const blob = await taskStore.downloadTaskPdf(props.task.id);
    if (blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      // Extract original filename from document_path, if it contains the unique ID prefix
      const fileNameParts = props.task.document_path.split('-');
      const originalFileName = fileNameParts.length > 1 ? fileNameParts.slice(1).join('-') : props.task.document_path;
      link.setAttribute('download', originalFileName); // Use original filename for download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Document download initiated.');
    } else {
      downloadError.value = taskStore.error || 'Download failed.';
      toast.error(downloadError.value);
    }
  } catch (err) {
    downloadError.value = err.message || 'An unexpected error occurred during download.';
    toast.error(downloadError.value);
  } finally {
    downloadLoading.value = false;
  }
};

const toggleCompletion = async () => {
  // Optimistically update UI
  props.task.completed = !props.task.completed;
  try {
    await taskStore.updateTask({ ...props.task, completed: props.task.completed });
    toast.success('Task completion status updated!');
  } catch (error) {
    toast.error('Failed to update task completion.');
    // Revert UI if update fails
    props.task.completed = !props.task.completed;
  }
};

const startEdit = () => {
  editTitle.value = props.task.title;
  editDescription.value = props.task.description || '';
  // Convert date to 'YYYY-MM-DDTHH:MM' format for datetime-local input
  editDueDate.value = props.task.due_date ? new Date(props.task.due_date).toISOString().slice(0, 16) : '';
  editPriority.value = props.task.priority || 'medium';
  isEditing.value = true;
};

// Add a computed property for form validation
const isFormValid = computed(() => {
  // Ensure 'editTitle' is accessible and correctly referenced here
  const isValid = editTitle.value.trim() !== '';
  console.log('isFormValid check:', isValid, 'editTitle value:', editTitle.value); // Keep this for debugging
  return isValid;
});

// Define loading state for the edit modal save button
const loading = ref(false);

const saveEdit = async () => {
  console.log('Save Edit button clicked!'); // Add this line
  if (!editTitle.value.trim()) {
    toast.error('Task title cannot be empty.');
    return;
  }

  loading.value = true; // Set loading to true when saving starts

  const updatedTask = {
    id: props.task.id,
    title: editTitle.value,
    description: editDescription.value,
    completed: props.task.completed, // Keep current completion status
    due_date: editDueDate.value ? new Date(editDueDate.value).toISOString() : null, // Convert back to ISO string
    priority: editPriority.value,
  };

  try {
    const success = await taskStore.updateTask(updatedTask);
    if (success) {
      toast.success('Task updated successfully!');
      // Manually update the task prop to reflect changes without a full reload
      props.task.title = updatedTask.title;
      props.task.description = updatedTask.description;
      props.task.due_date = updatedTask.due_date;
      props.task.priority = updatedTask.priority;
      cancelEdit(); // Close the modal
    } else {
      toast.error(taskStore.error || 'Failed to update task.');
    }
  } catch (err) {
    toast.error(`Update failed: ${err.message}`);
    console.error('Error updating task:', err);
  } finally {
    loading.value = false; // Set loading to false when saving finishes
  }
};

const cancelEdit = () => {
  isEditing.value = false;
  // Optionally reset edit fields to current task values or clear them
  editTitle.value = '';
  editDescription.value = '';
  editDueDate.value = '';
  editPriority.value = 'medium';
};

// Corrected deleteThisTask to be a simple alias or removed if openDeleteTaskModal is directly used
// The 'Delete' button directly calls openDeleteTaskModal, so deleteThisTask is redundant if not used elsewhere.
// const deleteThisTask = () => { // This function now *opens* the modal
//   showDeleteTaskModal.value = true; // Open the confirmation modal
// };


const handleDeleteTaskConfirm = async () => {
  closeDeleteTaskModal(); // Close modal immediately

  const taskIdToDelete = props.task.id;
  const taskTitleToDelete = props.task.title;

  try {
    const success = await taskStore.deleteTask(taskIdToDelete);
    if (success !== false) { // Check for explicit false from store to handle errors
      toast.success(`Task "${taskTitleToDelete}" deleted successfully.`);
    } else {
      toast.error(taskStore.error || 'Failed to delete task.');
    }
  } catch (err) {
    toast.error(`Delete failed: ${err.message}`);
    console.error('Error deleting task from modal:', err);
  }
};

const closeDeleteTaskModal = () => {
  showDeleteTaskModal.value = false;
};
</script>

<style scoped>
/* No specific scoped styles needed if using Tailwind extensively */
</style>