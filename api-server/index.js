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
    CLUSTER: 'arn:aws:ecs:ap-south-1:448049830963:cluster/builder-cluster3',
    TASK: 'arn:aws:ecs:ap-south-1:448049830963:task-definition/builder-task2'
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




app.listen(PORT, () => console.log(`API server Running..${PORT}`))