import express from 'express';
// To generate random ids
import { generateSlug } from 'random-word-slugs';
import { ECSClient, RunTaskCommand, LaunchType } from '@aws-sdk/client-ecs';
import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import http from 'http';
import cors from 'cors'; 
import path from 'path';
import pool from "./config/db.js";
import cookieParser from "cookie-parser";

const filePath = path.resolve('./queries/deployment.queries.json');
const queries = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
import { verifyJWT } from "./middlewares/auth.mw.js";


import Redis from "ioredis";
import { Server } from "socket.io";

// routers
import authRouter from "./routes/auth.routes.js";
import projectRouter from "./routes/project.routes.js";
import deployRouter from "./routes/deploy.routes.js";

let subscriber;

try {
    subscriber = new Redis(process.env.AIVEN_REDIS_URL);
} catch (error) {
    console.error(error);
    process.exit(1); // don’t forget `process.` 
}


const app = express()
const PORT = process.env.PORT || 9000
const server = http.createServer(app); // Express + HTTP server

// Socket server
const io = new Server(server, { cors: { origin: '*' } });

// Tis runs once per client when first connection happens
// this is from the frontend user
io.on('connection', (socket) => {
     // This socket represents *this* client
    // So all event handlers for this client go here

    // event name is subscribe in from container, channel is data sent
    socket.on('subscribe', channel => {
        socket.join(channel);
        // node js instance subscribes to redis 
        socket.emit('message', `Joined ${channel}`)
    });
});


// continuously listns for socket connections
//io.listen(9002, () => console.log(`Socket server Running..${9002}`))


// Add CORS middleware
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true
}))
app.use(express.json())
app.use(cookieParser());


app.use("/api/auth", authRouter);
app.use("/api/projects", projectRouter);
app.use("/api/deployments", deployRouter);


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
    CLUSTER: 'arn:aws:ecs:ap-south-1:448049830963:cluster/builder-cluster3',
    TASK: 'arn:aws:ecs:ap-south-1:448049830963:task-definition/builder-task2'
}


// Step 1: start deployment
// from here, we will run the task on ECS with the specific configs
app.post('/api/deploy', verifyJWT, async (req, res) => {
    const userId = req.user.id; // or req.user._id depending on your model

    // Project Id is basically project slug
    const{ gitURL } = req.body
    let projectSlug = req.body.projectSlug

    if( !gitURL) {
        return res.status(400).json({
            error: 'Missing projectSlug or gitURL'
        })
    }

    // if project slug exists, then check for existing project
    if(projectSlug){
        const existingProj = await pool.query(queries.findProjectBySlug, [projectSlug]);

        if(existingProj.rows.length > 0) {
            return res.status(400).json({
                error: 'Project already exists, please choose any other name'
            })
        }

        if (!/^[a-z-]+$/.test(projectSlug)) {
            return res.status(400).json({
                error: 'Project slug can only contain alphabets and -'
            })
        }
    }
    else{
        projectSlug = generateSlug();
    }
    console.log(projectSlug)

    // Create a project first, then deployment due to forien key constraints
    const newProject = await pool.query(queries.createProject, [
          projectSlug, // subdomain
          userId,
          gitURL
    ]);

   // console.log(newProject)

    if(newProject.rowCount === 0) {
        return res.status(500).json({
            error: 'Failed to create'
        })
    }

    // Adding a new deployment record    
    const newDeployment = await pool.query(queries.createDeployment, [projectSlug, "q"]);
    if(newDeployment.rowCount === 0) {
        return res.status(500).json({
            error: 'Failed to create'
        })
    }
   // console.log(newDeployment)

    const deploymentId = newDeployment.rows[0].id

    try {
    
    // If deploy succeeds, we will pass to projects
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
                subnets: ['subnet-0c56cbfc98a17e3fe', 'subnet-0d2b19d68e1ca4a03','subnet-05ebfc44dde98d299'],
                securityGroups : ['sg-055397065bb925dae']
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
                    },
                ]
            }
        ]
        }
    })

    await initRedisSubscriber(projectSlug);
  
    // sending deploy command
        const response = await ecsClient.send(command);
        console.log('Deployment task started:', projectSlug);

        // Respond immediately to frontend
        res.json({
          status: 'queued',
          projectSlug,
          url: `http://${projectSlug}.codebay.xyz`,
          deploymentId: deploymentId
        });

      // For example, when container finishes, insert into projects
          subscriber.on('message', async (channel, message) => {
        if (message.includes('Done...')) { // your container success message
        // Insert project into projects table

          // Update deployment status
          await pool.query(queries.updateDeploymentStatus, ['ready', deploymentId]);
        }
        if (message.includes('Error')) {
          await pool.query(queries.updateDeploymentStatus, ['fail', deploymentId]);
        }
      });
    // socket functino ends 

    } catch (err) {
        // delete project if fail
      await pool.query(queries.deleteProject, [projectSlug]);
      console.error('Failed to run ECS task:', err);
      await pool.query(queries.updateDeploymentStatus, ['fail', deploymentId]);
      res.status(500).json({ error: 'Failed to start deployment', details: err.message });
    }
})

// After all deployment is done , frontend will save logs 
app.post('/api/logs', async (req, res) => {
    const {deploymentId, logs} = req.body;
    await pool.query(queries.insertLogs, [deploymentId, logs]);
    res.json({
        status: 'success', message: 'Logs saved successfully'});
})    


// This listens from the docker container
async function initRedisSubscriber(projectSlug) {
    const channel = `logs:${projectSlug}`;
    console.log(`Subscribing to Redis channel: ${channel}`);

    // subscribe to that channel
    await subscriber.subscribe(channel); // use exact match

    // whenver a message is recieved, send ws msg to user
    subscriber.on('message', (channel, message) => {
        io.to(channel).emit('message', message);
        //io.to(channel).emit('message', channel)
    });
    // basically translates to:
    // Whenever we recieve a logs message from redis, emit to user

}


server.listen(PORT, () => console.log(`API server Running..${PORT}`))