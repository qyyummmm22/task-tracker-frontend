// src/stores/taskStore.js
import { defineStore } from 'pinia';
import { useAuthStore } from '@/stores/authStore';

const API_BASE_URL = 'http://localhost:3000/api/tasks';

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [],
    loading: false,
    error: null,
  }),
  actions: {
    getAuthHeaders() {
      const authStore = useAuthStore();
      if (authStore.token) {
        // Only log part of the token for security
        console.log('taskStore: Using authenticated headers with token (first 10 chars):', authStore.token.substring(0, 10) + '...');
        return {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.token}`,
        };
      }
      console.log('taskStore: No authentication token found. Sending request without token.');
      return {
        'Content-Type': 'application/json',
      };
    },

    async fetchTasks(userIdFilter = null) {
      this.loading = true;
      this.error = null;
      try {
        let url = API_BASE_URL;
        if (userIdFilter) {
          url += `?userId=${userIdFilter}`;
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
          this.tasks[index] = responseData;
        }
      } catch (err) {
        this.error = 'Failed to update task: ' + err.message;
        console.error('Update error:', err);
      } finally {
        this.loading = false;
      }
    },

    // --- REPLACE YOUR EXISTING deleteTask ACTION WITH THIS CODE BLOCK ---
    async deleteTask(id) {
      this.loading = true;
      this.error = null;
      console.log('taskStore: Attempting to delete task with ID:', id); // Debug log 1

      try {
        const url = `${API_BASE_URL}/${id}`;
        console.log('taskStore: Delete URL:', url); // Debug log 2
        console.log('taskStore: Headers for delete:', this.getAuthHeaders()); // Debug log 3

        const response = await fetch(url, {
          method: 'DELETE',
          headers: this.getAuthHeaders(),
        });
        console.log('taskStore: Fetch response received. Status:', response.status); // Debug log 4

        // If response is not OK (e.g., 4xx, 5xx) AND not a successful 204 (No Content)
        if (!response.ok && response.status !== 204) {
            console.log('taskStore: Response not OK and not 204. Status:', response.status); // Debug log 5
            const errorData = await response.json(); // Try to parse error body if not 204
            throw new Error(errorData.message || `Failed to delete task: Server responded with status ${response.status}`);
        } else if (response.status === 204) {
            console.log('taskStore: Delete successful (204 No Content).'); // Debug log for 204
        } else if (!response.ok) { // Generic error for other non-204 non-ok statuses
            throw new Error(`Failed to delete task: Server responded with status ${response.status}`);
        }

        console.log('taskStore: Filtering tasks after successful delete.'); // Debug log 6
        this.tasks = this.tasks.filter(task => task.id !== id);
        console.log('taskStore: Task list updated.'); // Debug log 7

      } catch (err) {
        this.error = 'Failed to delete task: ' + err.message;
        console.error('taskStore: Delete error (caught):', err); // Debug log (if error is caught)
      } finally {
        this.loading = false;
        console.log('taskStore: Delete action finished.'); // Debug log 8
      }
    }
    // --- END OF deleteTask ACTION ---
  }
});