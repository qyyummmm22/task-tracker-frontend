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
        return {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.token}`,
        };
      }
      return {
        'Content-Type': 'application/json',
      };
    },

    // MODIFIED: fetchTasks now accepts a userIdFilter
    async fetchTasks(userIdFilter = null) { // <--- MODIFIED to accept userIdFilter
      this.loading = true;
      this.error = null;
      try {
        let url = API_BASE_URL;
        if (userIdFilter) { // If userIdFilter is provided, append it as a query parameter
          url += `?userId=${userIdFilter}`;
        }

        const response = await fetch(url, { // <--- MODIFIED to use dynamic URL
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

    // MODIFIED: addTask now accepts a userId (for admin to assign tasks)
    async addTask(newTask, assignToUserId = null) { // <--- MODIFIED to accept assignToUserId
      this.loading = true;
      this.error = null;
      try {
        const payload = { ...newTask };
        if (assignToUserId) {
          payload.user_id = assignToUserId; // Add user_id to payload for backend
        }

        const response = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(payload), // <--- MODIFIED to send payload
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

    // updateTask and deleteTask remain mostly the same regarding headers
    async updateTask(updatedTask) {
        // ... existing code ...
        // No changes needed here specific to admin viewing tasks
    },

    async deleteTask(id) {
        // ... existing code ...
        // No changes needed here specific to admin viewing tasks
    }
  }
});