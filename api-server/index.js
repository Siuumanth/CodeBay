const express = require('express')
// To generate random ids
const { generateSlug } = require('random-word-slugs')
const { ECSClient, RunTaskCommand, LaunchType } = require('@aws-sdk/client-ecs')
require('dotenv').config()                
const cors = require('cors') // Add this

const Redis =  require("ioredis")
const { Server } = require("socket.io");

const subscriber = new Redis(process.env.AIVEN_REDIS_URL)

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
    TASK: 'arn:aws:ecs:ap-south-1:448049830963:task-definition/builder-task'
}

app.use(express.json())

// from here, we will run the task on ECS with the specific configs
app.post('/project', async (req, res) => {
    const{ gitURL } = req.body
    projectSlug = generateSlug();

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
                    }
                ]
            }
        ]
        }
    })

    await initRedisSubscriber();

  try {
        const response = await ecsClient.send(command);
        console.log('Task started:');

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


// This listens from the docker container
async function initRedisSubscriber() {
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