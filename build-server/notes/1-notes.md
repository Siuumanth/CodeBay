## 🔧 Vercel Clone – Deployment Setup Documentation

### 1. **Dockerfile**

Prepare a `Dockerfile` to define your build environment. It should contain instructions to:

- Use a base Node.js image
- Git clone and copy project files

```dockerfile
# base image

FROM ubuntu:focal

RUN apt-get update
RUN apt-get install -y curl

# for making api calls to install dependencies
# setting up node version 20
# -sL for silent download, silent download means no progress bar
# adding node source repo

RUN curl -sL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get upgrade -y
  
# actually installing node n git
RUN apt-get install -y nodejs
RUN apt-get install git -y
# Chanige working directory
WORKDIR /home/app
COPY main.sh main.sh
# After everyting gets installed
ENTRYPOINT [ "/home/app/main.sh" ]
```

> This ensures the build process is repeatable and platform-independent.

---

### 2. **Shell Script**

Create a shell script (e.g., `deploy.sh`) to automate:

- Navigating to the working directory
- Running the Docker build process
- Executing the Node.js build script
- Triggering the upload process (via `script.js`)
```bash
    #!/bin/bash

export GIT_REPOSITORY_URL = "$GIT_REPPOSITORY_URL"
git clone "$GIT_REPOSITORY_URL" /home/app/output # clones the repo to this dir
exec node script.js
```

> This will automate the full deployment pipeline.

---

### 3. **script.js**

This script is responsible for:

- Installing project dependencies (`npm install`)
- Building the project (`npm run build`)
- Reading all files from the `dist/` folder recursively
- Uploading them to the specified S3 bucket using AWS SDK's `PutObjectCommand`

Ensure:

- Environment variables like `PROJECT_ID`, `AWS credentials`, and `Bucket name` are set.
- MIME types are detected properly for each file using the `mime-types` package.

---

### 4. **AWS Setup**

#### Step 1: **Create an S3 Bucket**

- Go to the AWS Management Console → S3.
- Create a new bucket .
- **Region**: Choose one near your user base.
- Uncheck block all public access.

#### Step 2: **Bucket Policy for Public Access**

Add the following policy to **Permissions > Bucket Policy**:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::s3name/*"
    },
    {
      "Sid": "AllowWebAccess",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::s3name/*"
    }
  ]
}
```

> Replace `s3name` with your actual bucket name. This allows public read access to all objects, making the uploaded site accessible via the web.


#### Step 5: **Create an IAM User**

- Go to IAM Management Console.
- Create a new user for programmatic access.
- Attach the managed policy: `AmazonS3FullAccess`.
- Save the Access Key ID and Secret Access Key.

> This IAM user will be used in `script.js` to programmatically upload files to S3.