### 🔸 AWS ECR (Elastic Container Registry)

**What it is:**  
ECR is a managed container image registry by AWS. Think of it as GitHub but for Docker images.

**Why you use it:**

- You build a Docker image on your system or in CI (which includes your app logic like `main.sh`, `script.js`, etc.).
    
- You **push that image to ECR** so that AWS services like ECS can pull and run it.
    
**Key Points:**
- Private by default, but ECS has permissions to pull images.
- Secure, version-controlled, and integrated with IAM (so you control who can push/pull).

---
### 🔸 AWS ECS (Elastic Container Service)

**What it is:**  
ECS is a fully managed container orchestration service. It runs and manages Docker containers for you, like a lightweight Kubernetes.

**Why you use it:**

- You define a "Task" that says:
    - What Docker image to run (from ECR)
    - What environment variables to pass
    - How much CPU/RAM to allocate
    - What command to run inside the container (in your case, `main.sh`)

Then ECS runs that task:
- Spins up a container using your image
- Executes everything inside (npm install, build, S3 upload)
- Shuts down after the task is complete

**Types of ECS launch:**

1. **Fargate (serverless)** – You don't manage any infrastructure; AWS handles all compute.
2. **EC2-backed** – You provide EC2 instances, and ECS runs containers on them.

For your use case, **Fargate is ideal** because:
- You only need short-lived builds.
- You don't want to manage servers.
- You only pay for the time the container runs.

---
### ✅ Summary:

|Service|Purpose|
|---|---|
|**ECR**|Stores your custom Docker image with your build logic|
|**ECS**|Pulls that image and runs your app inside a container|

Together, they let you build a scalable, serverless deployment system where user code is processed, built, and deployed without manual intervention.

Let me know if you want the cost breakdown or architectural improvements.

---


## Steps involved here:

1. Make sure AWS CLI is installed and configured with the keys of the created user.

2. Create ECR -> View push commands -> copy command and run it on terminal
`aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin <userId>.dkr.ecr.ap-south-1.amazonaws.com`

This is for setting your credentials .

After this, execute all the push commands stated in the console, to set up.

![[Screenshot 2025-05-27 053445.png]]
The 4 Docker push commands are used to:

> **Upload your local Docker images to AWS ECR**, so they can be pulled and deployed on EC2, ECS, or anywhere else.

Each push:

- Pushes a different image (or tag)
- Makes it available in your **private AWS container registry**
    
Useful when deploying microservices or multi-container apps.

---

## Elastic Container Service (ECS)

1. Go and create a new Cluster
2. Create a New task definition.
####  ECS Task Definition – Quick Overview

A **task definition** is like a blueprint that tells ECS **how to run your container(s)**. It includes:

#### 1. **Container Definitions**

- Name of the container
- **Image URI from ECR** (e.g., `123456789012.dkr.ecr.us-east-1.amazonaws.com/myapp:latest`)
- CPU and memory allocation
- Port mappings (e.g., container port 3000)
- Environment variables (if needed)
- Logging configuration (usually to CloudWatch)

#### 2. **Task-Level Settings**

- **Task role** (IAM role for accessing AWS resources from within the container)
- **Operating System**: Choose **Linux** (unless your image is Windows-based)
- **Launch Type**:
    - `FARGATE` (serverless)
    - `EC2` (if you're managing EC2 instances yourself)