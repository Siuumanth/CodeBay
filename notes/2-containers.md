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

Now we try to login and push our Image to ECR using AWS CLI from our CLI

## Steps involved here:

1. Make sure AWS CLI is installed and configured with the keys of the created user.

2. Configuration steps: `aws configure`:  and enter your IAM access and Secret Key. 

3. Create ECR -> View push commands -> copy command and run it on terminal
```bash 
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin <userId>.dkr.ecr.ap-south-1.amazonaws.com
```

This is for setting your credentials .

4. Build image `docker build -t builder-server .`
5. Tag the image 
```bash
docker tag builder-server:latest 448049830963.dkr.ecr.ap-south-1.amazonaws.com/builder-server:latest
```
After this, execute all the push commands stated in the console, to set up.

![[Screenshot 2025-05-27 053445.png]]
The 4 Docker push commands are used to:

> **Upload your local Docker images to AWS ECR**, so they can be pulled and deployed on EC2, ECS, or anywhere else.

Each push:

- Pushes a different image (or tag)
- Makes it available in your **private AWS container registry**
    
Useful when deploying microservices or multi-container apps.



After pushing everything, you should see this:

![[Pasted image 20250805220529.png]]

In this , the last one, is the actual image

---

## Elastic Container Service (ECS)

1. Go and create a new Cluster - `builder-cluster` in using Amazon Fargate
2. Create a New task definition.
####  ECS Task Definition – Quick Overview


## 🧱 What is a Task Definition?

A **Task Definition** in ECS is like a **blueprint** for running Docker containers.
It tells ECS:

- What image to run
- What ports to expose
- What environment variables to set
- What resources (CPU, memory) are needed
- What command/entrypoint to run

#### 1. **Container Definitions**

- Name of the container  `builder-task`
- **Image URI from ECR**, The image which we had pushed (e.g., `123456789012.dkr.ecr.us-east-1.amazonaws.com/myapp:latest`) `builder-image`
- CPU and memory allocation
- Port mappings (e.g., container port 3000)
- ADD ENVIRONMENT VARIABLES - VERY IMPORTANT:
- add AWS secret key, access key and region, which are defined in 
   your Script.js and which will be used.

#### 2. **Task-Level Settings**

- **Task role** (IAM role for accessing AWS resources from within the container)
- **Operating System**: Choose **Linux** (unless your image is Windows-based)
- **Launch Type**:
    - `FARGATE` (serverless)
    - `EC2` (if you're managing EC2 instances yourself)




NOW:

The image has been successfully registered there, now we have to set up so that the task runs dynamically, i.e. the task is initiated by our API server whenever a user wants to deploy a code 








---



ISSUES encountered:
- I had a leading / in my relative file path so the actual S3 bucket file path was like : 

`s3://codebay-outputs/__outputs/p1//home/app/output/dist/index.html`
which should have been 
`s3://codebay-outputs/__outputs/p1/index.html`
- Fixed using the following

- Windows uses \ while unix based use / for paths, so i faced a lot of issues with S3 bucket file paths being wrong and longer then needed. Did this while uploading to fix the issue.
```js
// 1. Strip any leading slashes or backslashes:
let cleaned = relativePath.replace(/^[/\\]+/, '');

// 2. Turn all backslashes into forward-slashes:
cleaned = cleaned.replace(/\\/g, '/');

// 3. Build your S3 key:
const Key = `__outputs/${PROJECT_ID}/${cleaned}`;

```




# TEST

Testing if our code works with a simple project, If our codes successfully get uploaded to S3 bucket, then it works.

1. Create a simple react project and push it to github .
2.  Go to AWS cluster > your cluster > tasks > run new task > configure it to match builder , Launch type, add ENV variables

In the below screen, the existing env variables like access key, region and secret key should be shown.

![[Pasted image 20250528015605.png]]

But to go further and running this task , you will need a VPC with a subnet, so create that first, let it be default settings and come back and assign that VPC here.

After that , create the task to run, and it should enter provisioning mode.
- After than , the logs should show properly and the folder should be uploaded to S3 bucket.

This means our code and set up works




---

## 🧠 ECS Concepts in Simple Terms

### 🔹 1. **Task Definition = Blueprint**

- Think of it like a **Docker Compose file** or a **deployment config**.
- It defines:
    > “What container do I want to run, with which env vars, image, memory, ports, etc.”
    
You only create/edit this **once**, unless you want to version or update it later.

---
### 🔹 2. **Cluster = ECS Playground**
- A **cluster** is just a group of AWS-managed resources (usually Fargate or EC2) where your containers/tasks can be launched.
- You can have 1 or more clusters, but for most setups (like CodeBay), just **1 cluster** is enough.

---
### 🔹 3. **Run Task = Actually Launch It**

Once you have a task definition, you go to:
> **Cluster > Run new task > Choose the task definition (family)**
At this point, you’re saying:
> “Hey ECS, I want to **start one instance** of that blueprint (task definition) — run it now.”
---
## 🧱 Visual Flow:

```bash
[Task Definition] —> (registered once, acts as a template)
       ↓
      ECS Cluster
       ↓
[Run Task] —> uses task definition to spin up container (on Fargate)
```

---
## 📌 So why separate task definition and run?

Because ECS is designed for both:
- **Repeated use** (like microservices that restart)
- **One-time jobs** (like your CodeBay builds)

By defining the "task" once, you can **run it again and again**, maybe with different env vars each time, using the same structure.

---
## ✅ TL;DR

| Term            | What it is                              |
| --------------- | --------------------------------------- |
| Task Definition | A template for how to run a container   |
| Cluster         | Where your tasks actually run           |
| Run Task        | Launches an instance of that definition |

---

