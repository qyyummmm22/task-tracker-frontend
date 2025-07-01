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
        class="block w-full px-3 py-2 border text-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
      />
      <textarea
        v-model="editDescription"
        placeholder="Task Description (Optional)"
        rows="3"
        class="block w-full px-3 py-2 border text-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
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
import { useAuthStore } from '@/stores/authStore';

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
});

const taskStore = useTaskStore();
const authStore = useAuthStore();

const isEditing = ref(false);
const editTitle = ref('');
const editDescription = ref(props.task.description || '');

const selectedFile = ref(null);
const fileInput = ref(null);
const uploadLoading = ref(false);
const uploadError = ref(null);

const downloadError = ref(null);
const downloadLoading = ref(false);

const handleFileChange = (event) => {
  selectedFile.value = event.target.files[0];
  uploadError.value = null;
};

const uploadDocument = async () => {
  if (!selectedFile.value) {
    uploadError.value = 'Please select a file first.';
    return;
  }
  if (selectedFile.value.type !== 'application/pdf') {
    uploadError.value = 'Only PDF files are allowed.';
    selectedFile.value = null;
    if (fileInput.value) fileInput.value.value = '';
    return;
  }
  if (selectedFile.value.size > 5 * 1024 * 1024) {
    uploadError.value = 'File size exceeds 5MB limit.';
    selectedFile.value = null;
    if (fileInput.value) fileInput.value.value = '';
    return;
  }

  uploadLoading.value = true;
  uploadError.value = null;
  try {
    const data = await taskStore.uploadTaskPdf(props.task.id, selectedFile.value);
    if (data) {
      alert('Document uploaded successfully!');
      // Update the local task object's document_path so UI reflects immediately
      props.task.document_path = data.document_path;
      selectedFile.value = null;
      if (fileInput.value) fileInput.value.value = '';
    } else {
      uploadError.value = taskStore.error || 'Upload failed.';
    }
  } catch (err) {
    uploadError.value = err.message || 'An unexpected error occurred during upload.';
  } finally {
    uploadLoading.value = false;
  }
};

const handleDownloadDocument = async () => {
  downloadLoading.value = true;
  downloadError.value = null;
  try {
    const blob = await taskStore.downloadTaskPdf(props.task.id);
    if (blob) {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', props.task.document_path);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } else {
      downloadError.value = taskStore.error || 'Download failed.';
    }
  } catch (err) {
    downloadError.value = err.message || 'An unexpected error occurred during download.';
  } finally {
    downloadLoading.value = false;
  }
};

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