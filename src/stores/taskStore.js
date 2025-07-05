// src/stores/taskStore.js
import { defineStore } from 'pinia';
import { useAuthStore } from '@/stores/authStore';

const API_BASE_URL = 'http://localhost:3000/api/tasks'; // Base for tasks
const AUTH_API_BASE_URL = 'http://localhost:3000/api'; // Base for auth

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [],
    loading: false,
    error: null,
    // --- NEW: Sorting State ---
    sortBy: 'created_at',    // Default field to sort by
    sortDirection: 'desc',   // Default direction (descending for newest first)
  }),
  // --- NEW: Getters for sorting ---
  getters: {
    sortedTasks: (state) => {
      // Create a shallow copy to prevent direct mutation of the original tasks array
      // Array.prototype.sort() modifies the array in place, so we copy it first.
      const tasksCopy = [...state.tasks];

      return tasksCopy.sort((a, b) => {
        // Ensure the fields exist and are valid for comparison
        const aValue = a[state.sortBy];
        const bValue = b[state.sortBy];

        // Handle date sorting specifically for 'created_at' and 'due_date'
        if (state.sortBy === 'created_at' || state.sortBy === 'due_date') {
          const dateA = aValue ? new Date(aValue).getTime() : 0; // Treat null/undefined dates as epoch 0
          const dateB = bValue ? new Date(bValue).getTime() : 0;

          if (state.sortDirection === 'asc') {
            return dateA - dateB; // Ascending: oldest first
          } else {
            return dateB - dateA; // Descending: newest first
          }
        } else {
          // Default string/number comparison for other fields if you add them later
          // Ensure values are not null/undefined to avoid errors
          const valA = aValue == null ? '' : String(aValue).toLowerCase();
          const valB = bValue == null ? '' : String(bValue).toLowerCase();

          if (valA < valB) {
            return state.sortDirection === 'asc' ? -1 : 1;
          }
          if (valA > valB) {
            return state.sortDirection === 'asc' ? 1 : -1;
          }
          return 0;
        }
      });
    },
  },
  actions: {
    // Helper function to get authenticated headers
    getAuthHeaders(contentType = 'application/json') {
      const authStore = useAuthStore();
      if (authStore.token) {
        return {
          'Authorization': `Bearer ${authStore.token}`,
          ...(contentType ? { 'Content-Type': contentType } : {}),
        };
      }
      return contentType ? { 'Content-Type': contentType } : {};
    },

    async fetchTasks(filters = {}) {
      console.log('taskStore: fetchTasks received argument:');
      console.log('   Type of filters:', typeof filters);
      console.log('   Value of filters:', filters);

      this.loading = true;
      this.error = null;
      try {
        let url = API_BASE_URL;
        const queryParams = [];

        if (filters.userIdFilter) {
          queryParams.push(`userId=${filters.userIdFilter}`);
        }
        if (filters.search) {
          queryParams.push(`search=${encodeURIComponent(filters.search)}`);
        }
        if (filters.completed !== undefined && filters.completed !== null) {
          queryParams.push(`completed=${filters.completed}`);
        }
        if (filters.priority) {
          queryParams.push(`priority=${filters.priority}`);
        }
        if (filters.startDate) {
          queryParams.push(`startDate=${filters.startDate}`);
        }
        if (filters.endDate) {
          queryParams.push(`endDate=${filters.endDate}`);
        }

        if (queryParams.length > 0) {
          url += `?${queryParams.join('&')}`;
        }

        const response = await fetch(url, {
          headers: this.getAuthHeaders(),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Network response was not ok');
        }
        this.tasks = await response.json();
      } catch (err) {
        this.error = 'Failed to fetch tasks: ' + err.message;
        console.error('Fetch error:', err);
      } finally {
        this.loading = false;
      }
    },

    async addTask(newTask, assignToUserId = null) {
      this.loading = true;
      this.error = null;
      try {
        const payload = { ...newTask };
        if (assignToUserId) {
          payload.user_id = assignToUserId;
        }

        const response = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to add task');
        }
        const addedTask = await response.json();
        this.tasks.unshift(addedTask);
      } catch (err) {
        this.error = 'Failed to add task: ' + err.message;
        console.error('Add error:', err);
      } finally {
        this.loading = false;
      }
    },

    async updateTask(updatedTask) {
      this.loading = true;
      this.error = null;
      try {
        const response = await fetch(`${API_BASE_URL}/${updatedTask.id}`, {
          method: 'PUT',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(updatedTask),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update task');
        }
        const responseData = await response.json();
        const index = this.tasks.findIndex(task => task.id === updatedTask.id);
        if (index !== -1) {
          // Merge or replace. Assuming responseData contains the fully updated task from server
          this.tasks[index] = responseData;
        }
        return true;
      } catch (err) {
        this.error = 'Failed to update task: ' + err.message;
        console.error('Update error:', err);
        return false;
      } finally {
        this.loading = false;
      }
    },

    async deleteTask(id) {
      this.loading = true;
      this.error = null;
      try {
        const url = `${API_BASE_URL}/${id}`;
        const response = await fetch(url, {
          method: 'DELETE',
          headers: this.getAuthHeaders(),
        });

        if (!response.ok && response.status !== 204) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to delete task: Server responded with status ${response.status}`);
        } else if (!response.ok) { // This else-if is technically redundant due to the first if, but harmless.
          throw new Error(`Failed to delete task: Server responded with status ${response.status}`);
        }

        this.tasks = this.tasks.filter(task => task.id !== id);

      } catch (err) {
        this.error = 'Failed to delete task: ' + err.message;
        console.error('taskStore: Delete error (caught):', err);
      } finally {
        this.loading = false;
      }
    },

    async uploadTaskPdf(taskId, file) {
      this.loading = true;
      this.error = null;

      try {
        const formData = new FormData();
        formData.append('pdfFile', file);

        const authStore = useAuthStore();

        const response = await fetch(`${API_BASE_URL}/${taskId}/upload-pdf`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authStore.token}`, // Only Authorization header
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Upload failed with status: ${response.status}`);
        }

        const data = await response.json();
        return data; // Return data which should include document_path
      } catch (err) {
        this.error = 'PDF upload failed: ' + err.message;
        console.error('taskStore: PDF upload error:', err);
        return false;
      } finally {
        this.loading = false;
      }
    },

    async downloadTaskPdf(taskId) {
      this.loading = true;
      this.error = null;
      try {
        const url = `${API_BASE_URL}/${taskId}/download-pdf`;
        const response = await fetch(url, {
          method: 'GET',
          headers: this.getAuthHeaders(null),
        });

        if (!response.ok) {
          const errorData = await response.text();
          let errorMessage = `Download failed with status: ${response.status}`;
          try {
            const parsedError = JSON.parse(errorData);
            errorMessage = parsedError.message || errorMessage;
          } catch (e) {
            errorMessage = errorData || errorMessage;
          }
          throw new Error(errorMessage);
        }

        return await response.blob();

      } catch (err) {
        this.error = `Failed to download document: ${err.message}`;
        console.error('taskStore: PDF download error:', err);
        return false;
      } finally {
        this.loading = false;
      }
    },

    // --- NEW ACTION: Toggle Sorting ---
    toggleSortByDate() {
      // If currently sorting by 'created_at', reverse the direction
      if (this.sortBy === 'created_at') {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        // If sorting by something else, switch to 'created_at' and default to 'desc'
        this.sortBy = 'created_at';
        this.sortDirection = 'desc';
      }
      // The `sortedTasks` getter will automatically react to these state changes
    },

    // Optional: set a specific sort type/direction
    setSort(field, direction) {
        this.sortBy = field;
        this.sortDirection = direction;
    },
  },
});