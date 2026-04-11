
# BigO Frontend

**Algorithm Learning & Evaluation Management System**
React (Vite) + Clerk Authentication + REST API Integration



## 📌 Overview

The BigO frontend provides:

* Interactive algorithm visualizations
* Code-to-step synchronization
* Quiz attempt interface
* XP & badge dashboard
* Admin quiz management
* Analytics dashboard
* Secure authentication via Clerk

As defined in the SRS, the frontend is built using **React (Vite)** and communicates with the ASP.NET Web API backend via HTTPS REST endpoints .

---

## 🏗 Architecture

The frontend follows a SPA architecture:

* React (Vite)
* React Router (protected routes)
* Clerk authentication (JWT-based)
* REST API integration with backend
* Responsive UI
* CI/CD integrated with GitHub Actions 

---

## 🔐 Authentication

Authentication is handled via **Clerk**.

The frontend:

* Uses Clerk Publishable Key
* Manages login and registration
* Stores JWT automatically
* Sends JWT in `Authorization` header
* Restricts protected routes
* Redirects unauthenticated users to login

Protected route behavior:

* Unauthenticated → Redirect to login
* Authenticated Student → Access student routes
* Authenticated Admin → Access admin routes 

---

## 🎮 Core Features

### 🟢 Student Features

* Select algorithm (Bubble Sort, Binary Search, Quick Sort, Merge Sort)
* Step-by-step visualization
* Code panel with active line highlighting
* Speed control slider
* Replay/reset functionality
* Quiz attempt interface
* Immediate grading & XP awarding
* Dashboard with:

  * XP total
  * Earned badges
  * Quiz history 

---

### 🔵 Admin Features

* Quiz CRUD management
* View analytics dashboard
* Export performance reports (CSV/PDF)
* Manage user roles

---

## 🌐 Backend Integration

The frontend communicates with:

```
https://<backend-url>/api
```

Key integrations:

* `/api/algorithms`
* `/api/quizzes`
* `/api/quizzes/{id}/attempts`
* `/api/admin/analytics`
* `/api/students/{id}/dashboard`

All communication occurs over HTTPS with JSON payloads .

---

## 🔧 Environment Configuration

All environment variables are injected via CI/CD.

Required variables:

| Variable                     | Purpose                       |
| ---------------------------- | ----------------------------- |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk frontend authentication |
| `VITE_API_BASE_URL`          | Backend API base URL          |

Example `.env` (local development):

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
VITE_API_BASE_URL=https://localhost:5001
```

Access in code:

```javascript
const apiBase = import.meta.env.VITE_API_BASE_URL;
```

---

## 🚀 Running Locally

### 1️⃣ Install Dependencies

```bash
npm install
```

### 2️⃣ Start Development Server

```bash
npm run dev
```

Default Vite URL:

```
http://localhost:5173
```

---

## 🏗 Production Build

```bash
npm run build
```

Build output will be in:

```
/dist
```

---



## 📱 Usability & UI

As defined in the SRS:

* Responsive from 375px to 1920px
* Clear color differentiation for algorithm states
* Inline validation errors
* Dashboard-style XP visualization 

---

## ☁ Deployment

Deployment includes:

* GitHub Actions CI
* Production build validation
* Azure App Service deployment
* Automatic environment variable injection 

---

## 📁 Repository Structure

```
/src
  /components
  /pages
  /hooks
  /services
  /routes
/public
Dockerfile
vite.config.js
```


