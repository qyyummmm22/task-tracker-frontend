// src/stores/taskStore.js
import { defineStore } from 'pinia'

// Base URL for your backend API
const API_BASE_URL = 'http://localhost:3000/api/tasks'; // Make sure this matches your backend server's URL and port

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [],
    loading: false,
    error: null,
  }),
  actions: {
    async fetchTasks() {
      this.loading = true;
      this.error = null;
      try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) {
          throw new Error('Network response was not ok');
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
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newTask),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to add task');
        }
        const addedTask = await response.json();
        this.tasks.unshift(addedTask); // Add to the beginning of the list
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
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedTask),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update task');
        }
        // Update the task in the local state
        const index = this.tasks.findIndex(task => task.id === updatedTask.id);
        if (index !== -1) {
          this.tasks[index] = { ...this.tasks[index], ...updatedTask };
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
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete task');
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