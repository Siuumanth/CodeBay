import express from 'express';
import { RunTaskCommand } from '@aws-sdk/client-ecs';
import ecsClient from '../config/ecsClient.js';
import config from '../config/config.js';
import { subscriber } from '../config/redisClient.js'; 
import { io } from '../socket.js'; // import socket instance
import generateSlug from '../utils/generateSlug.js';

const router = express.Router();

// from here, we will run the task on ECS with the specific configs
router.post('/project', async (req, res) => {
    const { gitURL } = req.body;
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
    });

    await initRedisSubscriber(projectSlug);

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
});


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

export default router;
