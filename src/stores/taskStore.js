// src/stores/taskStore.js
import { defineStore } from 'pinia';
import { useAuthStore } from '@/stores/authStore'; // <--- NEW: Import auth store

const API_BASE_URL = 'http://localhost:3000/api/tasks';

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [],
    loading: false,
    error: null,
  }),
  actions: {
    // Helper function to get authenticated headers
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

    async fetchTasks() {
      this.loading = true;
      this.error = null;
      try {
        // Use authenticated headers
        const response = await fetch(API_BASE_URL, {
          headers: this.getAuthHeaders(), // <--- MODIFIED
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

    async addTask(newTask) {
      this.loading = true;
      this.error = null;
      try {
        const response = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: this.getAuthHeaders(), // <--- MODIFIED
          body: JSON.stringify(newTask),
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
          headers: this.getAuthHeaders(), // <--- MODIFIED
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

    async deleteTask(id) {
      this.loading = true;
      this.error = null;
      try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
          method: 'DELETE',
          headers: this.getAuthHeaders(), // <--- MODIFIED
        });
        if (!response.ok) {
           if (response.status !== 204) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Failed to delete task');
           } else {
              // Handle 204 (No Content) response which won't have a body
              throw new Error('Failed to delete task: Server responded with ' + response.status);
           }
        }
        this.tasks = this.tasks.filter(task => task.id !== id);
      } catch (err) {
        this.error = 'Failed to delete task: ' + err.message;
        console.error('Delete error:', err);
      } finally {
        this.loading = false;
      }
    }
  }
});