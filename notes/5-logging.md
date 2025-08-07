We will be using Aiven Valkey for a hosted redis database

## 📦 CodeBay Logging System (Socket.IO + Redis)

### 🧠 Overview

This setup allows real-time **log streaming** from the **Build Server (Docker container)** to **clients (like dashboards)** using a combination of **Redis pub/sub** and **Socket.IO**. It decouples log producers (build servers) from consumers (users watching the logs), improving scalability and clarity.

---
### ⚙️ System Structure (Component Roles)

#### 1. **Build Server (Docker Container)**
- **Role**: Emits logs as a project builds.
- **How**: Publishes logs to a Redis channel using `publish("logs:<projectSlug>", logMessage)`.
- **Environment**: Containerized Node.js app connected to Redis.

#### 2. **Redis**
- **Role**: Acts as a broker using **pub/sub**.
- **Functionality**: Forwards logs published by the Build Server to any subscribed services.
- **Why**: Decouples the backend emitting logs from clients consuming them.

#### 3. **API Server (Log Server)**
- **Role**: Subscribes to Redis channel and emits logs to Socket.IO clients.
- **Key tasks**:
    - Listens for new WebSocket connections.
    - Subscribes to Redis `logs:<projectSlug>`.
    - Emits received log messages via `io.to(channel).emit(...)`.

#### 4. **Client/Dashboard**
- **Role**: Connects to API Server via WebSocket and receives logs live.
- **Uses**: `socket.emit("join", { channel })` to join the relevant log room.

---
### 🧩 Redis Pub/Sub Explained

- Redis supports **pub/sub** natively.
    
- We used the `subscribe()` method (not `pSubscribe`) since we only need **exact matches** like `logs:project-123`.
    
- Message flow:
    - Build Server: `redisClient.publish('logs:project-123', 'Build started...')`
    - API Server: `subscriber.subscribe('logs:project-123')`
    - API Server emits to Socket.IO: `io.to('logs:project-123').emit(...)`

> ❗Note: `pSubscribe` is used for wildcard channels (like `logs:*`) but was **not supported by your Redis client** (Aiven Redis setup). Hence `subscribe()` was used.

---






## 🔁 Full Flow: WebSocket + Redis (with Docker Context)

This document explains the end-to-end message flow using **Socket.IO** and **Redis Pub/Sub**, from the point a message is sent by a source (like a Docker container or API server) to when it's received by a connected frontend user.

---
### 🧠 Actors Involved
1. **Frontend (User browser)** — connects via WebSocket
2. **Socket Server** (API-server) — handles WebSocket connections
3. **Redis** — used for message pub/sub
4. **Log Generator / API Server / Docker container** — pushes logs/events to Redis

---
### ⚙️ Setup Overview

- The **Socket server** listens on a port (e.g., 9002) and accepts WebSocket connections using `socket.io`.
    
- The **Redis client** (subscriber) subscribes to a channel like `logs:<projectSlug>`.
    
- A **Redis publisher** (e.g., running inside a Docker container or API server) sends logs to the Redis channel.
    
- When Redis receives a message, it triggers an event handler which then emits the message to all relevant WebSocket clients via `io.to(channel).emit()`.

---

## 🚦 Detailed Step-by-Step Flow

### 1. 🔌 Frontend Connects to WebSocket Server

#### Code Snippet:

```js
  
// Tis runs once per client when first connection happens
// this is from the frontend user
io.on('connection', (socket) => {
     // This socket represents *this* client
    // So all event handlers for this client go here
    // event name is subscribe in from container, channel is data sent
    socket.on('subscribe', channel => {
    // Joins the room (e.g., 'logs:asobi')
        socket.join(channel);
        // node js instance subscribes to redis
        socket.emit('message', `Joined ${channel}`)
        // Sends confirmation back to client
    });
});

io.listen(9002, () => console.log(`Socket server running on port 9002`));
```

#### 🎯 **Goal**

You want the frontend to tell the server:  
👉 “Hey, I want to listen to logs for `logs:projectSlug`”

This happens using a **WebSocket event** system powered by `socket.io`.

---
#### 📦 Code Breakdown (From Your API Server)

#### 🔄 Flow of Events

##### 1. 🔌 `io.on('connection', ...)`

This event is triggered **automatically** whenever a **client connects to your WebSocket server** at `ws://localhost:9002`.

- `socket` here represents **one specific client connection**.
- Inside this, you define all event listeners for this particular client.
```js
io.on('connection', (socket) => {
    socket.on('subscribe', channel => {
        socket.join(channel);  // join this room
        socket.emit('message', `Joined ${channel}`)
    });
});
```
---
##### 2. 🧠 `socket.on('subscribe', channel => { ... })`

This waits for the client to **emit** an event called `'subscribe'` with a payload (the channel to join, like `'logs:asobi'`).

➡️ **Who sends this `subscribe`?**  
👉 The **frontend client** using something like this:

```js
const socket = io('http://localhost:9002');

socket.emit('subscribe', 'logs:asobi');  // this triggers socket.on('subscribe') in your backend
socket.on('message', msg => {
  console.log('Server says:', msg);      // Receives "Joined logs:asobi"
});
```

---
##### 3. 🧩 `socket.join(channel)`

This tells Socket.IO to add this client to a **room**.  
Rooms let you send messages to a **subset** of connected clients.

Example: `io.to('logs:asobi').emit(...)` will **only send to clients in that room**.

---
##### 4. 📤 `socket.emit('message', ...)`
This sends a **response** (just to this client) confirming the join.

---
#### ✅ Summary: Who Does What

|Action|Who Does It|Purpose|
|---|---|---|
|`io.on('connection', cb)`|**API server**|Listens for new client connections|
|`socket.on('subscribe', cb)`|**API server**|Waits for client to say which logs they want|
|`socket.emit('subscribe', ...)`|**Frontend client**|Tells server "I want to join `logs:XYZ`"|
|`socket.join(...)`|**API server**|Adds client to room named `logs:XYZ`|
|`io.to(...).emit(...)`|**API server (from Redis msg)**|Sends logs to all subscribed clients|

---

    

---

### 2. 🧊 Redis Subscriber Listens to a Channel

##### Code Snippet:

```js
async function initRedisSubscriber() {
    const channel = `logs:${projectSlug}`;
    console.log(`Subscribing to Redis channel: ${channel}`);

    await subscriber.subscribe(channel);

    subscriber.on('message', (channel, message) => {
        io.to(channel).emit('message', message);
    });
}
```

#### Explanation:

- Redis `subscriber` listens for messages from a specific channel (e.g., `logs:my-app`).
    
- When a message is received, it emits that message to all clients joined in that Socket.IO room (same name as the channel).
    
- The key idea is: **Redis message ➝ Socket.IO room broadcast**.

---
#### 3. 📦 Redis Publisher (From Docker/API)

##### Example Code (Docker container, API server, etc):

```js
const Redis =  require("ioredis")
const publisher = new Redis(process.env.AIVEN_REDIS_URL)
// Put object command is for putting files in S3

const publishLog = async(log) => {
    // logs project Id is our channel name
    // push to this channel
    publisher.publish(`logs:${PROJECT_ID}`, JSON.stringify({log}))
}
```

#### Explanation:
- A separate Node.js process or container publishes messages to Redis channel `logs:my-app`.
- This can be done from inside a Docker container.
- Once published, the message gets picked up by the **subscriber** (from step 2).
---
#### 4. 📡 Message Sent to Frontend

#### Code Path:
1. Publisher sends ➝ `logs:my-app`
2. Redis receives it
3. Subscriber listens and catches message
4. `io.to(channel).emit('message', message)` is run
5. All clients in room `logs:my-app` receive it
#### Frontend Receives Message

```js
socket.on('message', (data) => {
    console.log('Log received:', data);
});
```

---
#### 🐳 Docker Context: Where It Fits In

- Your log-generating app inside Docker **publishes logs** using Redis.
    
- Docker containers can use the host machine Redis endpoint.
    
- No need to open a WebSocket from inside Docker unless you want bi-directional communication.

#### Example Docker Log Publisher (Node.js app in container):

```js
// Docker container code
const redis = require('redis');
const publisher = redis.createClient({ url: 'redis://host.docker.internal:6379' });
await publisher.connect();

publisher.publish('logs:my-app', 'Service inside Docker started');
```

---
### ✅ Summary of Flow

```
Client (WS) connects --> Socket.IO Server (joins room)
                                       ⬇
                          Redis Subscriber listens on `logs:my-app`
                                       ⬇
               Log generator publishes to Redis ➝ `logs:my-app`
                                       ⬇
         Subscriber emits message to room ➝ io.to(channel).emit()
                                       ⬇
                  All WebSocket clients in that room receive message
```

---

### 🛠️ Debug Tips

- **Socket server message not showing?** Ensure you are calling `io.listen()` and not `server.listen()`.
    
- **Can't connect to WebSocket?** Use `ws://localhost:9002` in Postman/WebSocket clients.
    
- **Redis subscribe not working?** Make sure subscriber is `.subscribe()`ing exact channel name, not `pSubscribe`.
    
---












---

### 🧪 Testing Setup (WS Postman or Client)

To test:
- Use a WebSocket client (e.g., Postman or browser).
- Connect to `ws://localhost:9002`
- Listen in  a message event.
- Send a message

```json
Send a message: `logs:wooden-acceptable-microphone` 
Name of event: `subscribe`
```

If the Build Server publishes to `logs:project-123`, the API Server will relay those messages to this client.

---
### 🐳 Docker and Redis Notes

- **Redis was running in Aiven**, so your API and Build servers must connect using correct `REDIS_URL`.
- Aiven Redis does **not support pSubscribe** in Node Redis clients, hence the switch to `subscribe()`.

---
### ✅ Summary

|Component|Role|Technology|
|---|---|---|
|Build Server|Publishes logs|Redis (publish)|
|Redis|Broker (Pub/Sub)|Redis Cloud (Aiven)|
|API Server|Subscribes logs, emits via socket|Redis (subscribe), Socket.IO|
|Client|Receives logs in real-time|Socket.IO|

- Entire flow is **loosely coupled** and **event-driven**.
    
- Real-time log streaming is achieved efficiently and can scale per project with dynamic `logs:<projectSlug>` naming.
    

---

✅ **Next Steps (Optional)**
- Add Redis error handling.
- Add Socket.IO middleware for auth.
- Automatically unsubscribe when no one is watching a log.
- Add expiry or memory control to Redis channels if needed.

---









---



# System Architecture Overview

The project consists of three main parts working together:

- **Build Container (Publisher):** A Docker (Fargate) build server that compiles or builds code. As it runs (e.g. `npm install && npm run build`), it streams log lines. Each log line is **published** to Redis using Pub/Sub. The Redis channel name is derived from the project’s ID (for example, `logs:project-slug`). The build container is the _publisher_ in the pub/sub pattern.
    
- **Redis Pub/Sub:** Redis acts as an in-memory message broker. Channels (like `logs:1234`) are created implicitly—**no pre-creation is needed**. When the publisher calls `PUBLISH`, Redis immediately forwards the message to all current subscribers on that channel and then forgets it (messages are **ephemeral**). Redis Pub/Sub follows _“at-most-once”_ semantics: a message is delivered only to subscribers that are listening at the time it’s published. If no subscriber is listening, the message is simply discarded; Redis does not store or queue it.
    
- **API / Socket.IO Server (Subscriber + WebSocket):** An Express.js API server that does two things: 
1) It triggers the build by running an ECS Fargate task for the given project ID.

2) It **subscribes** to the Redis channel `logs:<PROJECT_ID>` to receive build log messages. When a Redis message arrives, the server immediately forwards it to connected frontend clients via Socket.IO. The server’s Socket.IO instance accepts WebSocket connections from browsers. 

3) Clients **join a “room”** named `logs:<PROJECT_ID>`, so that they receive only the log events for their project. In this setup, the API server is the _subscriber_ in Redis pub/sub and the _emitter_ in the Socket.IO push model.
    





---
---
---























## Redis Pub/Sub Fundamentals

- **No explicit channel setup:** Channels in Redis Pub/Sub are just string names. You **do not need to create** a channel before using it. A publisher can `PUBLISH` to any string, and a subscriber can `SUBSCRIBE` to that string. For example, `publisher.publish("logs:42", message)` and `subscriber.subscribe("logs:42", callback)` instantly establish the channel on-the-fly.
    
- **Ephemeral delivery:** Once published, messages are delivered only to clients currently subscribed. Redis does not retain messages or deliver past messages to new subscribers. This “fire-and-forget” model means if the API server isn’t subscribed yet, those log lines won’t be received later. Conversely, if subscribers exist and publishers send after unsubscribing, those messages go nowhere.
    
- **At-most-once semantics:** Redis makes a “best effort” delivery. The message is published and pushed out; if a subscriber is disconnected or busy, the message is lost. There is no replay or acknowledgment. For persistent or guaranteed delivery one would use Redis Streams or another broker, but for real-time logs Pub/Sub is lightweight and fast.
    












## Build Container (Redis Publisher)

The build container’s job is to run the build and publish log messages. In Node.js, this typically means creating a Redis client and calling `publish`. For example:

```js
const Redis = require('ioredis');
const publisher = new Redis(process.env.AIVEN_REDIS_URL)

const publishLog = async(log) => {
    // logs project Id is our channel name
    // push to this channel
    publisher.publish(`logs:${PROJECT_ID}`, JSON.stringify({log}))
}

```

This uses the official Node Redis client. In this example, each `logLine` (a string or serialized JSON) is sent on the channel `logs:<PROJECT_ID>` so that any subscriber listening on that channel gets it. Note that if no API server is yet subscribed, the message will simply be dropped (per Redis Pub/Sub behavior).


## Log Flow Step-by-Step

1. **Build Start:** Client requests a build via the API for `PROJECT_ID`. The API starts a Docker/Fargate task to run the build.
    
2. **Redis Subscribe:** The API server subscribes to `logs:<PROJECT_ID>` on Redis (if not already subscribed).
    
3. **Container Publishes:** The build container runs the build. As output is generated, it publishes each log line:
    
    ```js
    publisher.publish(`logs:${PROJECT_ID}`, logLine);
    ```
    
    under the hood, this sends the message to the Redis server on channel `logs:<PROJECT_ID>`.
    
4. **Redis Forwards:** Redis immediately forwards that message to all subscribers of `logs:<PROJECT_ID>` (in our case, the API server). If multiple services subscribed, all would get it. If none were subscribed, the message is dropped.
    
5. **Server Emits to Clients:** The API’s Redis subscribe callback runs, receiving the `logLine`. It then calls `io.to(\`logs:${PROJECT_ID}`).emit('buildLog', logLine)`, sending the message over WebSocket to any front-end clients in that room.
    
6. **Client Displays:** Connected clients listening for `'buildLog'` on the socket receive the message and append it to the log display in real time.
    
Because channels and rooms are named with `PROJECT_ID`, logs for different projects stay isolated. A client in room `logs:42` won’t see messages published to `logs:99`, and vice versa.




## Redis Channel & Socket Room Naming

The key that ties Redis channels and Socket.IO rooms together is the **user-defined `PROJECT_ID`**. In code, whenever we publish or subscribe in Redis, we use a channel string like `logs:${PROJECT_ID}`. Likewise, we create/join a Socket.IO room with the same string.

This convention means the project ID “drives” both sides: it scopes the logs in Redis and scopes the WebSocket broadcast in Socket.IO. For example, if `PROJECT_ID = "proj123"`, the channel is `logs:proj123` and the room is also `logs:proj123`. Neither Redis nor Socket.IO requires pre-creating these channels/rooms; they are created on demand.

## Redis Pub/Sub Details

- **No persistence or backlog:** Because Redis Pub/Sub is fire-and-forget, if a subscriber comes online after the build started, it will _not_ see earlier logs. Only real-time messages are delivered. (For a persistent log, you would need to store logs elsewhere as well.)
    
- **Multiple subscribers:** Multiple API instances or services can subscribe to the same Redis channel. All of them will receive the message (fan-out). In a simple single-server setup, only one instance handles it, but in a scaled setup you could have duplicates or use a Redis adapter for Socket.IO.
    
- **When you receive messages:** Subscribers only get messages _after_ they subscribe. In the Redis CLI example, subscribing (`SUBSCRIBE channel`) and then publishing (`PUBLISH channel "msg"`) shows the subscriber receiving `"msg"`. If `PUBLISH` happens first, later subscribers do not get it.
    

## Best Practices

- **One subscriber per channel:** If you will publish on many channels (one per project), you can reuse one Redis client and subscribe to multiple channels, or create new ones as needed. Node Redis allows multiple `subscribe()` calls on one client to different channels. Just be careful to manage which channels are active.
    
- **Separate clients for pub/sub:** In any one process that does both publishing and subscribing (like the container might both run commands and publish), use separate Redis client instances. The Node Redis client cannot do normal commands when in subscribe mode. Using `client.duplicate()` ensures a fresh connection for subscriptions.
    
- **Error handling:** Always handle Redis connection errors or reconnections. If Redis goes down, your subscriber should retry and re-subscribe. Likewise, catch and log Socket.IO errors on emit.
    
- **Room clean-up:** Optionally, unsubscribe from a Redis channel when no clients are listening (e.g. when a build completes and all sockets have left the room). This avoids unnecessary Redis subscriptions. When the last client leaves a room, you can call `subscriber.unsubscribe(channel)`.
    


By combining Redis Pub/Sub for backend messaging and Socket.IO rooms for frontend delivery, the system decouples the build/log generator from the web clients, allowing real-time log streaming across processes and even across servers if scaled.

Each component’s role is clear: the build container **publishes** logs, Redis **routes** them, the API acts as **subscriber and emitter**, and Socket.IO **pushes** them into client browsers. This ensures live build logs are reliably shown to the correct users without manual polling.