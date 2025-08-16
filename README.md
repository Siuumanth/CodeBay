# CodeBay - Deployment Platform

<Project is incomplete, and most of the readme rn is random n ai generated, so bear with it :) >

CodeBay is a modern web application that allows developers to deploy their projects from Git repositories with real-time build monitoring and automatic deployment.

## Features

- 🔐 **User Authentication** - Secure login/register system with JWT
- 🚀 **Git Integration** - Deploy directly from GitHub, GitLab, or any Git repository
- 📊 **Real-time Monitoring** - Live build logs with WebSocket integration
- 🐳 **Container Deployment** - AWS ECS-based container deployment
- 📱 **Modern UI** - Beautiful, responsive interface built with React and Tailwind CSS
- 📈 **Build History** - Track all your deployments and their status
- 🌐 **Custom Domains** - Choose your own project subdomain

## Project Structure

```
CodeBay/
├── api-server/          # Backend API server (Node.js/Express)
├── codebay-frontend/    # Frontend React application
├── build-server/        # Build server for container builds
└── s3-reverse-proxy/    # S3 reverse proxy service
```

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Redis instance
- AWS ECS cluster (for deployment)
- Docker (for local development)

## Environment Variables

### Backend (api-server/.env)
```env
# Database
DB_USER=your_db_user
DB_HOST=your_db_host
DB_NAME=your_db_name
DB_PASS=your_db_password
DB_PORT=5432

# JWT
JWT_SECRET=your_jwt_secret_key

# Redis
AIVEN_REDIS_URL=your_redis_url

# AWS
AWS_REGION=ap-south-1
IAM_ACCESS_KEY=your_aws_access_key
IAM_SECRET_KEY=your_aws_secret_key

# Server
PORT=9000
NODE_ENV=development
```

## Quick Start

### 1. Backend Setup

```bash
cd api-server

# Install dependencies
npm install

# Set up environment variables
cp env.template .env

# Edit .env with your actual values:
# - Database credentials
# - JWT secret
# - Redis URL
# - AWS credentials

# Start the server
npm run dev
```

The backend will be available at `http://localhost:9000`

### 2. Frontend Setup

```bash
cd codebay-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 3. Database Setup

Create the required tables in your PostgreSQL database:

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  created_by INTEGER REFERENCES users(id),
  git_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deployments table
CREATE TABLE deployments (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id),
  status VARCHAR(50) DEFAULT 'queued',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Log events table
CREATE TABLE log_events (
  id SERIAL PRIMARY KEY,
  deployment_id INTEGER REFERENCES deployments(id),
  logs TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Projects
- `GET /api/projects` - Get user's projects
- `GET /api/projects/:id` - Get specific project
- `DELETE /api/projects/:id` - Delete project

### Deployments
- `GET /api/deployments/getall` - Get all user deployments
- `GET /api/deployments/:id` - Get deployment with logs
- `POST /api/deploy` - Start new deployment

### Logs
- `POST /api/logs` - Save build logs

## Development

### Backend Development
```bash
cd api-server
npm run dev  # Starts with nodemon for auto-reload
```

### Frontend Development
```bash
cd codebay-frontend
npm run dev  # Starts Vite dev server
```

### Building for Production
```bash
# Frontend
cd codebay-frontend
npm run build

# Backend
cd api-server
npm start
```

## Architecture

- **Frontend**: React 19 + Vite + Tailwind CSS
- **Backend**: Node.js + Express + Socket.io
- **Database**: PostgreSQL
- **Cache**: Redis
- **Deployment**: AWS ECS + Docker
- **Real-time**: WebSocket connections for live logs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC License

## Support

For support and questions, please open an issue in the repository.

