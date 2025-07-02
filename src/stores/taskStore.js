// src/stores/taskStore.js
import { defineStore } from 'pinia';
import { useAuthStore } from '@/stores/authStore';

const API_BASE_URL = 'http://localhost:3000/api/tasks'; // Base for tasks

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [],
    loading: false,
    error: null,
  }),
  actions: {
    // Helper function to get authenticated headers
    // MODIFIED: Accept contentType to allow for FormData (no Content-Type)
    getAuthHeaders(contentType = 'application/json') {
      const authStore = useAuthStore();
      if (authStore.token) {
        // Log partial token for debugging, but avoid logging full token in production
        // console.log('taskStore: Using authenticated headers with token (first 10 chars):', authStore.token.substring(0, 10) + '...');
        return {
          'Authorization': `Bearer ${authStore.token}`,
          // Conditionally add Content-Type
          ...(contentType ? { 'Content-Type': contentType } : {}),
        };
      }
      // console.log('taskStore: No authentication token found. Sending request without token.');
      // If no token, only return Content-Type if specified
      return contentType ? { 'Content-Type': contentType } : {};
    },

    async fetchTasks(filters = {}) { // <--- MODIFIED to accept filters object
      console.log('taskStore: fetchTasks received argument:'); // <--- NEW LOG
      console.log('  Type of filters:', typeof filters);       // <--- NEW LOG
      console.log('  Value of filters:', filters);             // <--- NEW LOG

      this.loading = true;
      this.error = null;
      try {
        let url = API_BASE_URL;
        const queryParams = [];

        // userIdFilter (for admin's specific user view) is now part of filters
        if (filters.userIdFilter) {
          queryParams.push(`userId=${filters.userIdFilter}`);
        }

        // NEW: Add other filter parameters
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
          queryParams.push(`startDate=${filters.startDate}`); // Expecting YYYY-MM-DD HH:MM:SS format
        }
        if (filters.endDate) {
          queryParams.push(`endDate=${filters.endDate}`); // Expecting YYYY-MM-DD HH:MM:SS format
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
          headers: this.getAuthHeaders(), // Default 'application/json'
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
          headers: this.getAuthHeaders(), // Default 'application/json'
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
      // console.log('taskStore: Attempting to delete task with ID:', id); // Debug log

      try {
        const url = `${API_BASE_URL}/${id}`;
        // console.log('taskStore: Delete URL:', url); // Debug log

        const response = await fetch(url, {
          method: 'DELETE',
          headers: this.getAuthHeaders(), // Default 'application/json'
        });
        // console.log('taskStore: Fetch response received. Status:', response.status); // Debug log

        if (!response.ok && response.status !== 204) {
            // console.log('taskStore: Response not OK and not 204. Status:', response.status); // Debug log
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to delete task: Server responded with status ${response.status}`);
        } else if (response.status === 204) {
            // console.log('taskStore: Delete successful (204 No Content).'); // Debug log for 204
        } else if (!response.ok) {
            throw new Error(`Failed to delete task: Server responded with status ${response.status}`);
        }

        // console.log('taskStore: Filtering tasks after successful delete.'); // Debug log
        this.tasks = this.tasks.filter(task => task.id !== id);
        // console.log('taskStore: Task list updated.'); // Debug log

      } catch (err) {
        this.error = 'Failed to delete task: ' + err.message;
        console.error('taskStore: Delete error (caught):', err);
      } finally {
        this.loading = false;
        // console.log('taskStore: Delete action finished.'); // Debug log
      }
    },

    // --- NEW ACTION: Upload PDF to a specific task ---
    async uploadTaskPdf(taskId, file) {
      this.loading = true;
      this.error = null;

      try {
        const formData = new FormData();
        formData.append('pdfFile', file); // 'pdfFile' must match the field name in Multer config (upload.single('pdfFile'))

        // For FormData, browser sets Content-Type itself, so we pass null/empty string to getAuthHeaders
        const response = await fetch(`${API_BASE_URL}/${taskId}/upload-pdf`, {
          method: 'POST',
          headers: this.getAuthHeaders(null), // Pass null to prevent explicit 'Content-Type: application/json'
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

    // --- NEW ACTION: Download PDF for a specific task ---
    async downloadTaskPdf(taskId) {
        this.loading = true;
        this.error = null;
        try {
            const url = `${API_BASE_URL}/${taskId}/download-pdf`;
            const response = await fetch(url, {
                method: 'GET',
                // Pass null to getAuthHeaders so Content-Type isn't set for GET requests
                headers: this.getAuthHeaders(null),
            });

            if (!response.ok) {
                const errorData = await response.text(); // Read as text, as it might be HTML or JSON error
                let errorMessage = `Download failed with status: ${response.status}`;
                try {
                    const parsedError = JSON.parse(errorData); // Try parsing as JSON
                    errorMessage = parsedError.message || errorMessage;
                } catch (e) {
                    errorMessage = errorData || errorMessage; // Not JSON, use raw text or default
                }
                throw new Error(errorMessage);
            }

            // Return the response as a Blob
            return await response.blob();

        } catch (err) {
            this.error = `Failed to download document: ${err.message}`;
            console.error('taskStore: PDF download error:', err);
            return false;
        } finally {
            this.loading = false;
        }
    }
  },
});