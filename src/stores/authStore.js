// src/stores/authStore.js
import { defineStore } from 'pinia';
import { useTaskStore } from '@/stores/taskStore'; // Import task store to clear tasks on logout

const AUTH_API_BASE_URL = 'http://localhost:3000/api'; // Base URL for auth endpoints

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'), // Store user data (id, username, role)
    token: localStorage.getItem('token') || null, // Store JWT token
    loading: false,
    error: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token, // True if token exists
    isAdmin: (state) => state.user?.role === 'admin', // True if user is admin
    isStaff: (state) => state.user?.role === 'staff', // True if user is staff
  },
  actions: {
    // Action for user registration
    async register(username, password, role = 'staff') { // Default role is staff
      this.loading = true;
      this.error = null;
      try {
        const response = await fetch(`${AUTH_API_BASE_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, role }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Registration failed.');
        }

        const data = await response.json();
        this.user = data.user;
        this.token = data.token;
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);

        return true; // Indicate success
      } catch (err) {
        this.error = err.message;
        console.error('Registration error:', err);
        return false; // Indicate failure
      } finally {
        this.loading = false;
      }
    },

    // Action for user login
    async login(username, password) {
      this.loading = true;
      this.error = null;
      try {
        const response = await fetch(`${AUTH_API_BASE_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Login failed.');
        }

        const data = await response.json();
        this.user = data.user;
        this.token = data.token;
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);

        return true; // Indicate success
      } catch (err) {
        this.error = err.message;
        console.error('Login error:', err);
        return false; // Indicate failure
      } finally {
        this.loading = false;
      }
    },

    // Action for user logout
    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      this.error = null; // Clear any previous errors

      // Optionally, clear tasks from the taskStore on logout
      const taskStore = useTaskStore();
      taskStore.tasks = [];
    }
  },
});