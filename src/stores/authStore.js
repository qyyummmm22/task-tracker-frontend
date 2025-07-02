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
    async register(username, password, role = 'staff') {
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
          // Return error message for toast
          return { success: false, message: errorData.message || 'Registration failed.' };
        }

        const data = await response.json();
        this.user = data.user;
        this.token = data.token;
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);

        // Return success message for toast
        return { success: true, message: data.message || 'User registered successfully!' };
      } catch (err) {
        this.error = err.message;
        console.error('Registration error:', err);
        // Return error message for toast
        return { success: false, message: err.message || 'An unexpected registration error occurred.' };
      } finally {
        this.loading = false;
      }
    },

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
          // Return error message for toast
          return { success: false, message: errorData.message || 'Login failed.' };
        }

        const data = await response.json();
        this.user = data.user;
        this.token = data.token;
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);

        // Return success message for toast
        return { success: true, message: data.message || 'Logged in successfully!' };
      } catch (err) {
        this.error = err.message;
        console.error('Login error:', err);
        // Return error message for toast
        return { success: false, message: err.message || 'An unexpected login error occurred.' };
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      this.error = null;
      const taskStore = useTaskStore();
      taskStore.tasks = [];
      // No need to return anything for logout here, App.vue can handle it.
    }
  },
});