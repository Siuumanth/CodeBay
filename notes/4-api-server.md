## API Server ECS Integration: Detailed Notes

This document provides a comprehensive walkthrough of how our Express.js API server integrates with AWS ECS Fargate to launch containerized build tasks on demand. Each section begins with context and motivation before diving into configuration details, code examples, and best practices.

---


```js

const express = require('express')
// To generate random ids
const { generateSlug } = require('random-word-slugs')
const { ECSClient, RunTaskCommand, LaunchType } = require('@aws-sdk/client-ecs')
require('dotenv').config()                

const app = express()
const PORT = 9000
// Set up ECS client
const ecsClient = new ECSClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.IAM_ACCESS_KEY,
        secretAccessKey: process.env.IAM_SECRET_KEY
    }
})

// Cluster and task details
const config = {
    CLUSTER: 'cluster arn',
    TASK: 'task arn'

}
app.use(express.json())
  
// from here, we will run the task on ECS with the specific configs
app.post('/project', async (req, res) => {
    const{ gitURL } = req.body
    const projectSlug = generateSlug();
    // Spin the container when a URL is recieved
    // Give proper creds, same as what we set up manually in aws
    const command = new RunTaskCommand({
        cluster: config.CLUSTER,
        taskDefinition: config.TASK,
        launchType: 'FARGATE',
        count: 1,
        networkConfiguration: {
            awsvpcConfiguration: {
                assignPublicIp: 'ENABLED',
                // Available in network configurations
                subnets: [add list of subnets],
                securityGroups : [security group]
            }
        },
        overrides: {
            containerOverrides: [
            {
                name: 'builder-image',
                // ENV variables
                environment: [
                    {
                        name: 'GIT_REPOSITORY_URL', value: gitURL
                    },
                    {
                        name: 'PROJECT_ID', value: projectSlug
                    }
                ]
            }
        ]
        }
    })
  
  try {
        const response = await ecsClient.send(command);
       // console.log('Task started:', JSON.stringify(response, null, 2));
  
        return res.json({
            status: 'queued',
            data: {
                projectSlug,
                url: `http://${projectSlug}.localhost:8000`
            }
        });
  
    } catch (err) {
        console.error('Failed to run ECS task:', err);
        return res.status(500).json({
            error: 'Failed to start ECS task',
            details: err.message
        });
    }
  
})

app.listen(PORT, () => console.log(`API server Running..${PORT}`))
```
### 1. Project Setup & Configuration

> _Context:_ We need a lightweight HTTP API to trigger build tasks remotely. This section describes how we set up our Node.js project and environment.

- **Dependencies**
    - `express` for HTTP routing and request handling.
    - `random-word-slugs` to generate unique, human-readable project IDs.
    - `@aws-sdk/client-ecs` (v3) for programmatic ECS interactions.
    - `dotenv` for loading sensitive credentials from a `.env` file.
        
- **Environment Variables** (`.env`)
    
    ```env
    IAM_ACCESS_KEY=AKIA...       # Programmatic IAM user access key
    IAM_SECRET_KEY=...           # Corresponding secret key
    AWS_REGION=ap-south-1        # Region for ECS, ECR, CloudWatch, etc.
    ```
    
    - **Validation:** The console logs `[dotenv@17.2.1] injecting env (3) from .env`, confirming 3 vars loaded.
    - **Security:** Ensure `.env` is added to `.gitignore` to prevent accidental commits.
- **Express Server Initialization**
    ```js
    const app = express();
    app.use(express.json());         // Parse JSON payloads
    app.listen(9000, () => console.log('API server running on port 9000'));
    ```
    
    - **Middleware:** You can add logging or security middleware (e.g., `morgan`, `helmet`) here.

---
### 2. ECS Client & Credentials

> _Purpose:_ We need to authenticate to AWS and configure the ECS SDK client for subsequent API calls.

- **ECSClient** setup:
    
    ```js
    const ecsClient = new ECSClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.IAM_ACCESS_KEY,
        secretAccessKey: process.env.IAM_SECRET_KEY
      }
    });
    ```
    
    - **Automatic Credential Providers:** In production, consider using IAM roles attached to EC2/ECS Task Roles instead of hardcoding credentials.
- **IAM Permissions**
    - **Developer IAM User** temporarily uses **AdminAccess** for rapid prototyping.
    - **ECS Task Execution Role** (`ecsTaskExecutionRole`) must include:
        - `AmazonECSTaskExecutionRolePolicy` (ECR pull, CloudWatch Logs).

---
### 3. Task Definition Requirements

> _Goal:_ Define how the container should run—CPU/memory, networking, logging, and IAM execution permissions.

- **Top-Level Fields**
    
    ```json
    {
      "family": "builder-task2",
      "requiresCompatibilities": ["FARGATE"],     // Fargate-only
      "networkMode": "awsvpc",                   // ENI-per-task
      "executionRoleArn": "arn:aws:iam::448049830963:role/ecsTaskExecutionRole",
      "cpu": "512",                              // 0.5 vCPU
      "memory": "1024"                           // 1 GB RAM
    }
    ```
    
    - **CPU/Memory Allocation:** Choose values within Free Tier (256 CPU / 512 MB) or adjust for performance.
    - **Task Role vs Execution Role:** The **executionRoleArn** is for ECS to pull images; a separate **taskRoleArn** can grant your app AWS permissions.
        
    
    - **PortMappings:** Only specify `containerPort`; Fargate handles host port.
    - **Logging:** Ensures you can debug build steps and errors in CloudWatch.
- **Register Task Definition**
    
    ```bash
    aws ecs register-task-definition \
      --cli-input-json file://builder-task2.json
    ```

---
### 4. Running Tasks Programmatically

> _Objective:_ Dynamically launch build containers in response to HTTP requests.

- **Route Handler** (`/project`):
    
    ```js
    app.post('/project', async (req, res) => {
      const { gitURL } = req.body;
      const projectSlug = generateSlug();
    
      const command = new RunTaskCommand({
        cluster: config.CLUSTER,
        taskDefinition: config.TASK,
        launchType: LaunchType.FARGATE,          // CamelCase
        count: 1,
        networkConfiguration: {
          awsvpcConfiguration: {
            assignPublicIp: 'ENABLED',            // requires public subnet
            subnets: [/* public subnet IDs */],
            securityGroups: [/* SG allowing egress to ECR/HTTPS */]
          }
        },
        overrides: {
          containerOverrides: [{
            name: 'builder-image',
            environment: [
              { name: 'GIT_REPOSITORY_URL', value: gitURL },
              { name: 'PROJECT_ID', value: projectSlug }
            ]
          }]
        }
      });
    
      try {
        const response = await ecsClient.send(command);
        console.log('ECS RunTask response:', response.tasks[0].taskArn);
        res.json({ status: 'queued', projectSlug });
      } catch (err) {
        console.error('Failed to run ECS task:', err);
        res.status(500).json({ error: err.message });
      }
    });
    ```
    
    - **Error Handling:** Always wrap in `try/catch` to return meaningful errors.
    - **Response Payload:** Return the `projectSlug` so users know their build URL.

---
### 5. Troubleshooting & Best Practices
> _Summary of errors encountered, root causes, and hard-learned lessons, plus tips for stability._
1. **InvalidParameterException: Assign public IP not supported**
    - **Cause:** `launchType` property misnamed or used in private subnet.
    - **Fix:** Use `launchType: LaunchType.FARGATE` and ensure subnets have auto-assign public IPv4 on.
        
2. **Missing executionRoleArn**
    - **Cause:** Task definition missing role for ECR pulls and logs.
    - **Fix:** Add `executionRoleArn` pointing at ECS Task Execution Role with `AmazonECSTaskExecutionRolePolicy`.
        
3. **No Container Instances in cluster**
    - **Cause:** SDK defaulted to EC2 launch type.
    - **Fix:** Correct camelCase `launchType`.
        
4. **Stuck in PENDING / ECR auth timeout**
    - **Cause:** Network misconfiguration (no IGW/NAT or missing VPC endpoints).
    - **Fix:** Enable public subnets with IGW, or configure NAT Gateway and add ECR interface endpoints.
        
5. **No logs in CloudWatch**
    - **Cause:** Missing `logConfiguration`.
    - **Fix:** Configure `awslogs` log driver with group/stream prefix.

**Additional Tips:**

- **Capacity Provider Strategy:** For production, bind your service to `FARGATE_SPOT` or `FARGATE` for cost optimization.
- **IAM Roles:** Use least-privilege policies for both task and execution roles.
- **Health Checks:** If you turn this into an ECS Service, configure health checks and auto-scaling.
---
### 6. Final Deployment Checklist

> _Before going into production, verify the following to ensure reliability and security._
-  **Task Definition:** Logs, roles, networking, and resource specs are correct.
-  **VPC Setup:** Public/private subnet strategy finalized; NAT or IGW in place.
-  **IAM Security:** `.env` files are excluded; roles follow least-privilege.
-  **Observability:** CloudWatch alarms on task failures; structured logging enabled.
-  **CI/CD Integration:** Automate task definition registration and API deployments.
    

---


```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": [
        "arn:aws:logs:ap-south-1:448049830963:log-group:/ecs/builder-task2",
        "arn:aws:logs:ap-south-1:448049830963:log-group:/ecs/builder-task2:*"
      ]
    }
  ]
}

// Add this to user permissions as inline policy to allow create logs 
```









---










---
## 📘 ECS Task Deployment – Common Issues & Root Causes

### ✅ **Goal**

Deploy a Docker container (API builder) on AWS ECS Fargate with logging enabled to CloudWatch.

---
### 🧩 **Issue 1: Task fails to start — "No container instances found"**

**❌ Error:**

```
"Failed to start ECS task", "No Container Instances were found in your cluster."
```

**🔍 Root Cause:**  
You were trying to run an ECS task with Fargate, but either:
- Subnet wasn't associated with a public IP (for internet access), OR
- No appropriate subnet+security group configuration for Fargate.

**✅ Fix:**
- Set network mode to `awsvpc`.
- Ensure subnet has **auto-assign public IP = true**.
- In task run settings: set **Auto-assign public IP = ENABLED**.

---
### 🧩 **Issue 2: ECS Task shows `No logs to display`**

**❌ Error:**

```
No logs to display. Check your task definition to turn on the awslogs driver.
```

**🔍 Root Cause:**  
You didn’t define log configuration in the task definition.

**✅ Fix:**  
You added the `logConfiguration` section in your task definition like:

```json
"logConfiguration": {
  "logDriver": "awslogs",
  "options": {
    "awslogs-group": "/ecs/builder-task2",
    "awslogs-region": "ap-south-1",
    "awslogs-stream-prefix": "ecs"
  }
}
```

---
### 🧩 **Issue 3: CloudWatch error — Log group does not exist**

**❌ Error:**

```
ResourceInitializationError: failed to validate logger args: failed to create Cloudwatch log stream: ResourceNotFoundException: The specified log group does not exist.
```

**🔍 Root Cause:**  
You provided the log group name (`/ecs/builder-task2`) but it didn’t exist yet, and your ECS task role did **not have permission to auto-create log groups**.

**✅ Fix Options:**

**Path 1 (what you did):**
- Manually created the log group in CloudWatch: `/ecs/builder-task2`
    
**Path 2 (alternative):**
- Attach custom inline policy to ECS execution role with permission:

```json
{
  "Effect": "Allow",
  "Action": [
    "logs:CreateLogGroup",
    "logs:CreateLogStream",
    "logs:PutLogEvents"
  ],
  "Resource": "*"
}
```

---
### 🧩 **Confusion: Why is my URL showing `.localhost` domain?**

**❓ Problem:**  
`http://callous-tender-dog.localhost:8000`

**✅ Clarification:**  
That’s not from ECS. That’s from **Docker Desktop or local dev proxy**. ECS-generated URLs are usually public DNS names or IPs from Load Balancer or directly from the task’s IP (if public).

You must have run the container or used `localhost` mapping in a dev environment like:
- Docker Compose
- VSCode dev containers
- Or it’s a placeholder from a local dev tool

---
### ✅ Final Working Setup

- ECS Task using **Fargate**
- **Public IP assigned**
- **Logs pushed to CloudWatch**
- **Task execution role** has correct permissions
- Task definition includes `logConfiguration`

---

