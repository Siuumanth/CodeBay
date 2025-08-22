# CodeBay – Web App Deployment Platform

CodeBay is a modern web application that enables developers to **deploy React-based projects directly from Git repositories** with real-time build monitoring, containerized infrastructure, and automated hosting on AWS.

## 🚀 Key Features

- 🌐 **Git Integration** – Deploy from any Git repository (GitHub, GitLab, etc.)
- 📊 **Real-Time Build Monitoring** – Live build logs via WebSocket streaming
- 🐳 **Container Deployment** – Scalable builds & deployments on AWS ECS with Docker
- 📁 **Static Hosting with Reverse Proxy** – Efficient routing to S3-hosted static assets
- 🔐 **Secure Authentication** – JWT-based login and session management
- 📈 **Deployment History** – Track project status, builds, and logs over time
- ⚡ **Scalable Infrastructure** – Designed for concurrent builds and smooth load handling

## 🏗 Project Structure

```
CodeBay/
├── api-server/          # Backend API (Node.js/Express, PostgreSQL, Redis)
├── codebay-frontend/    # React + Tailwind frontend dashboard
├── build-server/        # Handles Git cloning, builds, and deployment
└── s3-reverse-proxy/    # Reverse proxy for serving S3 static builds
```

## 🖼 System Overview

- **System Architecture**  
    The architecture leverages **AWS ECS for deployments**, **S3 for static hosting**, **Redis for log streaming**, and a **reverse proxy** for mapping custom project domains.
    
    ![System Architecture](https://github.com/Siuumanth/codebay/notes/sysdesign.png)
    
- **System Flow**
    1. User links Git repository
    2. CodeBay clones and builds project in container
    3. Build logs are streamed in real time via Redis + Socket.io
    4. Static build artifacts are stored in S3
    5. Reverse proxy maps subdomains (e.g., `project.codebay.com`) to the correct build
    
    ![Schema](https://github.com/Siuumanth/codebay/notes/db.png)
    

## ⚙️ Tech Stack
    
- **Backend** → Node.js, Express, Socket.io
- **Frontend** → React, Vite, Tailwind CSS
- **Database** → PostgreSQL
- **Cache & Logs** → Redis (Aiven-hosted)
- **Deployment** → AWS ECS, S3, Docker
- **Authentication** → JWT
- Custom domain support

## APIs:
```js
// const BASE_URL = "http://localhost:9000";
// const API_BASE_URL = "http://localhost:9000";
// const SOCKET_URL = "http://localhost:9000";

const BASE_URL = "https://codebay-1.onrender.com";
const API_BASE_URL = "https://codebay-1.onrender.com";
const SOCKET_URL = "https://codebay-1.onrender.com";

const API_ENDPOINTS = {
  // Auth
  REGISTER: `${BASE_URL}/api/auth/register`,
  LOGIN: `${BASE_URL}/api/auth/login`,
  LOGOUT: `${BASE_URL}/api/auth/logout`,

  // Projects
  GET_PROJECTS: `${BASE_URL}/api/projects`,
  GET_PROJECT: (id) => `${BASE_URL}/api/projects/${id}`,
  DELETE_PROJECT: (id) => `${BASE_URL}/api/projects/${id}`,

  // Deployments
  GET_ALL_DEPLOYMENTS: `${BASE_URL}/api/deployments/getall`,
  GET_DEPLOYMENT: (id) => `${BASE_URL}/api/deployments/${id}`,

  // Deploy & Logs
  START_DEPLOY: `${BASE_URL}/api/deploy`,
  SAVE_LOGS: `${BASE_URL}/api/logs`,
};

export { BASE_URL, API_BASE_URL, SOCKET_URL, API_ENDPOINTS };
export default API_ENDPOINTS;

```

---

