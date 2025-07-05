# Advanced Task Tracker Application

A robust, full-stack web application built to help individuals and teams efficiently manage tasks. This project features a responsive and modern UI along with a secure backend, showcasing a strong understanding of web development principles and best practices.

---

## 🔧 Key Features

### ✅ Core Task Management
- **CRUD Operations**: Create, Read, Update, Delete tasks
- **Task Completion**: Mark tasks as completed or pending with visual checkmarks
- **Due Dates & Priorities**: Assign deadlines and priorities (Low, Medium, High)
- **File Attachments**: Upload and download PDF documents securely

### 👤 User Management & Authentication
- **User Registration & Login**
- **Role-Based Access Control**: Admin and Staff roles with different permissions
- **JWT Authentication** for secure API communication
- **Password Hashing** using `bcryptjs`
- **User Profiles**: View profile and securely change passwords

### 🛠 Admin Dashboard
- **User Management**:
  - View all users and their task counts
  - Edit user roles (Admin/Staff)
  - Reset user passwords securely via modal
  - Delete user accounts with cascading task deletion
- **Task Management**:
  - View all tasks or filter by user
  - Filter tasks by keyword, status, or priority
  - Admins can assign tasks to users

### 💬 Collaboration & Notifications
- **Task Comments**: Add discussion threads to tasks
- **Expandable Comment Section** for clean UI

### 🎯 User Experience Enhancements
- **Toast Notifications**
- **Loading Indicators**
- **Empty State Messages**
- **Client-Side Form Validation**
- **Custom Confirmation Modals**

---

## 💻 Technologies Used

### Frontend
- Vue.js 3
- Vite
- Tailwind CSS
- Pinia
- vue-toastification

### Backend
- Node.js
- Express.js
- MySQL2
- bcryptjs
- jsonwebtoken
- multer
- dotenv
- cors
- fs

### Database
- MySQL

---

## ⚙️ Setup & Installation

### 1. Prerequisites
Ensure the following are installed:
- Node.js (LTS)
- npm
- MySQL Server

---

### 2. Database Setup

Run the following SQL in your MySQL client:

```sql
CREATE DATABASE IF NOT EXISTS task_tracker_db;
USE task_tracker_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'staff') DEFAULT 'staff',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id INT NOT NULL,
  added_by_user_id INT NULL,
  document_path VARCHAR(255),
  due_date DATETIME,
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (added_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
