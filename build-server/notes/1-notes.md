## 🚀 CodeBay – Vercel Clone Deployment System

![[Pasted image 20250805173111.png]]

CodeBay is a self-hosted deployment platform inspired by Vercel. It lets users deploy frontend projects directly from GitHub repositories. Behind the scenes, CodeBay builds the project inside an isolated Docker container and hosts the final static files on AWS S3. This setup ensures builds are reproducible, isolated, and secure.

This document explains the architecture and then walks through the complete deployment setup using Docker, Node.js, and AWS services.

---
## 🧠 How CodeBay Works – High-Level Architecture

This section provides an overview of the entire deployment workflow, from user input to live hosting.

1. **User Input:**
    - A user enters a **GitHub repository URL** via the CodeBay UI.
        
2. **API Trigger:**
    - The backend (Node.js) receives the URL and generates a unique `private_key` (used as an identifier).
    - It then triggers a build by launching a Docker container on **AWS ECS**.
        
3. **Docker-based Build:**
    - Inside this short-lived container:
        - The repo is cloned.
        - Dependencies are installed.
        - The frontend project is built (e.g., using `npm run build`).
        - The output directory (`/dist` or `/build`) is uploaded to AWS S3 under a name spaced folder using the `private_key`.
            
4. **Static File Hosting:**
    - The uploaded files are served directly from S3 (with public access), simulating how Vercel delivers builds.
        
> ✅ Each deployment is isolated, disposable, and repeatable.  
> 🔁 The container runs, builds, uploads, and exits automatically.

---
## 🔧 1. Dockerfile – Build Environment

This Dockerfile defines a clean, controlled environment that installs Node.js, Git, and other necessary tools to automate project builds inside the container.

```dockerfile
FROM ubuntu:focal

RUN apt-get update && apt-get install -y curl git

# Install Node.js v20
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get upgrade -y && \
    apt-get install -y nodejs

# Set working directory
WORKDIR /home/app

# Copy the bootstrapping script
COPY main.sh main.sh

# Run deployment logic automatically on container start
ENTRYPOINT [ "/home/app/main.sh" ]
```

> ✅ This image is built once and stored in **AWS ECR**.  
> 🔁 For every deployment, ECS launches a container from this image.

---
## 🖥️ 2. main.sh – Bootstrapping Script

This shell script runs when the container starts. It’s responsible for fetching the code and triggering the build logic.
### Responsibilities:
- Reads the GitHub repo URL from an environment variable.
- Clones the repo into a directory.
- Launches the Node.js script that handles build + upload.

```bash
#!/bin/bash

GIT_REPOSITORY_URL="$GIT_REPOSITORY_URL"
git clone "$GIT_REPOSITORY_URL" /home/app/output

exec node script.js
```

> 📌 Ensure the env variable `GIT_REPOSITORY_URL` is passed while running the container.

---
## 📦 3. script.js – Build & Upload Logic

This Node.js script handles the main logic after the repo is cloned.
### Responsibilities:

- Navigates into the project directory (`/home/app/output`)
- Installs project dependencies with `npm install`
- Builds the project (`npm run build`)
- Recursively reads the output folder (usually `dist/`)
- Uploads each file to the specified S3 bucket under a path like: `__outputs/{private_key}/`

### Requirements:
- AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)
- `AWS_REGION`, `BUCKET_NAME`, and `PROJECT_ID` as environment variables
- Use `mime-types` npm package to detect content types properly for S3

> ✅ This script makes your deployment portable, platform-independent, and cloud-ready.
---



## ☁️ 4. AWS Setup – S3 and IAM Configuration

This section covers setting up AWS resources for hosting static files and securing access.

### 📁 Step 1: Create an S3 Bucket

- Go to the AWS Console → S3 → Create Bucket
- Choose a unique bucket name
- Select a region near your users
- Uncheck **"Block all public access"**

### 🔓 Step 2: Add a Public Read Policy

This allows public access to the uploaded static files.
Replace `s3name` with your bucket name:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::codebay-outputs/*"
    },
    {
      "Sid": "AllowWebAccess",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::codebay-outputs/*"
    }
  ]
}
```

Basically, we are making all contents of the S3 bucket public
### 📖 **Explanation for CodeBay**

This is a **public read access policy** applied to your S3 bucket `codebay-outputs`
#### 🔍 What it does:

- **`"Action": "s3:GetObject"`** → allows reading files from the bucket (i.e., GET requests via URL).
    
- **`"Principal": "*"`** → allows **anyone on the internet** (anonymous users) to access the files.
    
- **`"Resource": "arn:aws:s3:::vercel-clone-outputs/*"`** → applies to **all files inside the bucket**.
    
#### 🔁 Why are there two similar blocks?

- Functionally, they’re **identical**.
- The second one has a `"Sid": "AllowWebAccess"` (statement ID), which is optional and just labels the rule.
- You can **remove the duplicate** — one is enough.



### 👤 Step 3: Create an IAM User with S3 Access

- Go to IAM → Users → Create New User
- Choose "Programmatic Access"
- Attach the `AmazonS3FullAccess` policy (or use a tighter scoped custom policy)
- Save the access key and secret — you'll use these in `script.js`

> 📌 Consider using environment variables or AWS Secrets Manager to manage keys securely.

---
## ✅ Summary

- CodeBay runs a **short-lived ECS container** per deployment.
- Each container builds the user’s repo and uploads static files to an **S3 bucket**.
- This approach provides strong isolation, reproducibility, and cloud-native scalability.
- You can extend this setup to support preview URLs, custom domains, or backend deployments using ECS (heavier setup).
    
