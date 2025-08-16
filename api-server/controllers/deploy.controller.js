
const Redis =  require("ioredis")
const { Server } = require("socket.io");
const { generateSlug } = require('random-word-slugs')
const { ECSClient, RunTaskCommand, LaunchType } = require('@aws-sdk/client-ecs')

const subscriber = new Redis(process.env.AIVEN_REDIS_URL)
// Socket server
const io = new Server({ cors: '*'});
require('dotenv').config()



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
