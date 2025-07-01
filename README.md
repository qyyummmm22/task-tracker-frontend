# My Task Tracker Application

![Task Tracker Screenshot Placeholder](https://via.placeholder.com/800x450?text=Task+Tracker+Screenshot)


## Project Description

This project is a full-stack web application designed to help users manage their daily tasks efficiently. It serves as a comprehensive demonstration of modern web development practices, integrating a responsive frontend with a robust backend and a persistent database.

## Features

* **Task Management:**
    * Add new tasks with a title and optional description.
    * Mark tasks as completed/uncompleted.
    * Edit existing tasks (title and description).
    * Delete tasks.
* **Persistent Storage:** All tasks are stored in a MySQL database, ensuring data is saved even after closing the application.
* **Responsive Interface:** Built with Tailwind CSS for a modern, mobile-first, and responsive user experience.
* **Clear & Intuitive UI:** Designed for ease of use, allowing quick task management.

## Technologies Used

This application is built using the following technologies:

### Frontend
* **Vue.js 3:** A progressive JavaScript framework for building user interfaces.
* **Vite:** A blazing-fast build tool for modern web projects.
* **Tailwind CSS:** A utility-first CSS framework for rapidly building custom designs.
* **Pinia:** The official state management library for Vue.js, used for managing task data.

### Backend
* **Node.js:** A JavaScript runtime environment.
* **Express.js:** A fast, unopinionated, minimalist web framework for Node.js, used for building the REST API.
* **`mysql2`:** A high-performance Node.js driver for MySQL, supporting Promises.
* **`cors`:** Node.js middleware for enabling Cross-Origin Resource Sharing (CORS).
* **`dotenv`:** To load environment variables from a `.env` file for secure credential management.

### Database
* **MySQL:** An open-source relational database management system for persistent data storage.

## Setup and Installation

Follow these steps to get a local copy of the project up and running.

### Prerequisites

Make sure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (LTS version, e.g., v20.x or v22.x) and npm
* [MySQL Server](https://dev.mysql.com/downloads/mysql/) (and a client like MySQL Workbench or a command-line client)

### 1. Database Setup

First, you need to create the database and table for your tasks.

* Log in to your MySQL server (e.g., using MySQL Workbench or the command line):
    ```bash
    mysql -u root -p
    # Enter your MySQL root password when prompted
    ```
* Once logged in, execute the following SQL commands to create the database and the `tasks` table:
    ```sql
    CREATE DATABASE IF NOT EXISTS task_tracker_db;
    USE task_tracker_db;

    CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ```

### 2. Backend Setup

Navigate into the backend project directory and set it up.

```bash
# In your terminal
cd task-tracker-backend

# Install backend dependencies
npm install

# Create a .env file for database credentials
# In C:\task-tracker-backend, create a file named .env
# Add your MySQL credentials (replace with your actual user/password)
# Example:
# DB_USER=root
# DB_PASSWORD=admin123
# DB_HOST=localhost
# DB_DATABASE=task_tracker_db
