Using a reverse proxy, we will map the Accessed URL of our website to the S3 files which will be delivered.

---
### 🔁 **Reverse Proxy (Concept)**

- A **reverse proxy** is a server that sits in front of one or more **backend servers** and forwards client requests to them.
- It hides the identity and internal structure of the backend.
- Used for:
    - **Load balancing**
    - **SSL termination**
    - **Caching**
    - **Security / DDoS protection**
#### 🧠 Example:

Client → Reverse Proxy → Backend Server  
→ Nginx or AWS ALB are common reverse proxies.

---
### 🔄 **Forward Proxy (Concept)**

- A **forward proxy** sits **between the client and the internet**.
- The client sends requests to the proxy, which forwards them to the final destination (e.g., a website).
- The destination server **only sees the proxy**, not the original client.
- Often used in:
    - **Bypassing geo-blocks**
    - **Content filtering**
    - **Corporate firewalling**
    - **Anonymity (VPNs, Tor, etc.)**

---
### 🧭 Flow Diagram

```
Client → Forward Proxy → Target Server
```

- **Client is aware** of the proxy.
- Example: `curl --proxy http://myproxy.com:8080 http://example.com`

---
### 🆚 Summary Table

|Feature|Forward Proxy|Reverse Proxy|
|---|---|---|
|**Proxy for**|Client|Server|
|**Client aware?**|Yes|No|
|**Hides**|Client from server|Server from client|
|**Use cases**|Anonymity, filtering, control|Load balancing, security|

---

### 📦 **http-proxy (Library)**

- `http-proxy` is a Node.js module for creating proxy servers, especially **reverse proxies**.
- Maintained by the [nodejitsu](https://github.com/http-party/node-http-proxy) team.
#### 🔧 Use cases:
- Forwarding API requests to microservices.
- Hiding internal ports or IPs.
- Creating local dev proxies.

#### ✅ Minimal Example:

```js
const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer({});

require('http').createServer((req, res) => {
  proxy.web(req, res, { target: 'http://localhost:5000' });
}).listen(3000);
```

This proxies all requests from `localhost:3000` to `localhost:5000`.

---







# Reverse proxy code:
---

```js
const express = require('express')
const httpProxy = require('http-proxy') // this is for building reverse proxy

const app = express()
const PORT = 8000   // Running reverse proxy on 8000

const BASE_PATH = 'https://codebay-outputs.s3.ap-south-1.amazonaws.com/__outputs'   // S3 bucket folder link

// Typical S3 static file URL is like:
// https://codebay-outputs.s3.ap-south-1.amazonaws.com/__outputs/p1/index.html
const proxy = httpProxy.createProxy()

// Main proxy handler
app.use((req, res) => {
    const hostname = req.hostname; // subdomain + domain
    const subdomain = hostname.split('.')[0];   // 1st string before . is subdomain

    // Rewrite "/" to "/index.html", default behaviour
    if (req.url === '/') {
        req.url = '/index.html';
    }
    const url = req.url;
    // The incoming URL will be resolved to THIS URL by the reverse proxy
    const resolvesTo = `${BASE_PATH}/${subdomain}`

    // Actual function which resolves and maps the proxy request
    proxy.web(req, res, {
        target: resolvesTo,
        changeOrigin: true // Change origin header to match target
    })
  
    console.log(`Path resolved from ${url} to ${resolvesTo}`)
})

app.listen(PORT, () => console.log(`Reverse Proxy Running..${PORT}`))
```
## 🧠 **Reverse Proxy: Quick Intro**

A **reverse proxy** sits in front of a server (or multiple servers) and **forwards client requests** to those backend servers. It **hides the backend logic** and can **modify or reroute** requests before passing them on.

In your case:

- You're acting as a reverse proxy for static sites stored in **AWS S3**.
- You map subdomains (e.g., `p1.localhost`) to folders (`__outputs/p1`) in the S3 bucket.
- The proxy intercepts the request, figures out which site to serve, then pulls the HTML file from S3.

---
## 🔧 **Your Reverse Proxy Code: Detailed Breakdown**

### ✅ 1. **Dependencies**

```js
const express = require('express')
const httpProxy = require('http-proxy')
```

- `express`: Web server framework for handling HTTP requests.
- `http-proxy`: Allows you to forward (proxy) HTTP requests to another server.

---
### ✅ 2. **Initialization**
    

```js
const BASE_PATH = 'https://codebay-outputs.s3.ap-south-1.amazonaws.com/__outputs'
```

- This is the **base URL of your S3 bucket**. Each project (like `p1`, `p2`) is stored under this base.
    
---
### ✅ 3. **Creating the Proxy Instance**

```js
const proxy = httpProxy.createProxy()
```

- Creates a proxy server instance to forward requests.
---
### ✅ 4. **Main Proxy Handler Middleware**

```js
app.use((req, res) => {
```

This is a **catch-all middleware** for all incoming requests.

---
### 🔍 a. **Extracting the Subdomain**

```js
const hostname = req.hostname
const subdomain = hostname.split('.')[0]
```

- `req.hostname` might be `p1.localhost`.
- `subdomain` becomes `p1`.

This helps determine **which folder in S3** the files should be served from.

---
### 🔍 b. **Default Route Rewrite**

```js
if (req.url === '/') {
    req.url = '/index.html';
}
```

- If user hits root (`/`), you default to loading `index.html`, which is how SPAs work.

---
### 🔍 c. **Final URL Resolution**

```js
const url = req.url;
const resolvesTo = `${BASE_PATH}/${subdomain}`
```

- Combines the base path with the subdomain to create the **final target** to proxy to, like:

```
https://codebay-outputs.s3.ap-south-1.amazonaws.com/__outputs/p1
```

- The `req.url` (e.g., `/index.html`) will get **appended automatically** to the `target` by the proxy.

So, full resolved URL becomes:

```
https://codebay-outputs.s3.ap-south-1.amazonaws.com/__outputs/p1/index.html
```

---
### 🔍 d. **Proxying the Request**

```js
proxy.web(req, res, { 
    target: resolvesTo, 
    changeOrigin: true
})
```

- Forwards the request to the S3 path.
- `changeOrigin: true`: Sets the `Host` header to the target’s host (S3), which avoids CORS or 

---
## 🔁 Final Flow Summary

Here’s the step-by-step request flow:
1. You open browser → visit: `http://p1.localhost:8000`
2. Express receives request → extracts `p1` as subdomain
3. It checks if `url === '/'` → rewrites to `/index.html`
4. Resolves S3 target:  
    `https://codebay-outputs.s3.ap-south-1.amazonaws.com/__outputs/p1/index.html`
5. Proxies the request using `http-proxy`
6. Browser receives the file → rendered as a page (if MIME is correct)

---
## ⚠️ Common Issues to Be Aware Of

| Issue                      | Cause                                  | Fix                                       |
| -------------------------- | -------------------------------------- | ----------------------------------------- |
| **Browser downloads file** | Wrong `Content-Type` (not `text/html`) | Ensure S3 sets correct MIME type          |
| **404 from S3**            | Folder or file doesn't exist           | Ensure `${subdomain}/index.html` exists   |
| **Opera GX specific bug**  | Very strict on headers or redirects    | Test on other browsers or inspect headers |
| **CORS errors**            | Origin headers blocked                 | Use `changeOrigin: true` in proxy config  |

---














---
## 🌐 Domain Structure Notes

### 🔹 1. **Domain**

- The **main address** registered for your site.
- Example: `codebay.com` or `codebay.in`
- You buy this from a domain provider (e.g., GoDaddy, Namecheap, Route53).
### 🔹 2. **Subdomain**
- A **prefix** to your domain that helps divide functionality.
- Examples:
    - `www.codebay.com` → website homepage.
    - `admin.codebay.com` → admin dashboard (could serve Next.js SSR or backend).
    - `api.codebay.com` → backend API (Node.js/Express/Golang server).
    - `challenges.codebay.com` → hosts static HTML challenges (from `public/assets`).

⚠️ Subdomains are configured via **DNS records** (type A or CNAME) in your domain provider or Route53.

### 🔹 3. **Hostname**

- The complete part that identifies the server:  
    **`<subdomain>.<domain>`**
    
- Examples:
    - `api.codebay.com`
    - `codebay.in`
    - `localhost` (when testing locally)
- Used by browsers and tools to resolve DNS to IP.
### 🔹 4. **Port (if any)**

- Not part of hostname, but often appears during dev.
- Examples:
    - `http://localhost:3000` → hostname = `localhost`, port = `3000`
    - `http://127.0.0.1:5000` → hostname = `127.0.0.1`, port = `5000`

You generally avoid exposing ports in production — handled by load balancers or HTTPS defaults (443).

---
## ✅ How This Relates to Codebay (Deployment Plan)

|Component|Example URL|Purpose|
|---|---|---|
|Frontend (Next.js)|`https://codebay.com`|Main website & challenge list UI|
|Challenge files (HTML)|`https://codebay.com/challenges`|Served from `public/assets/`|
|Backend API|`https://api.codebay.com`|Express/Golang backend for user/auth/db|
|Admin panel (optional)|`https://admin.codebay.com`|Admin-only panel if needed|

---
## 🛠️ Behind the Scenes (AWS / Hosting)

- **S3 or Vercel** → For hosting static content or frontend.
- **ECS + Fargate** → For backend API (served at `api.codebay.com`).
- **Route53 / DNS** → To manage subdomain routing (via A/ALIAS/CNAME records).
- **HTTPS** → Issued via ACM (AWS Certificate Manager) or auto by Vercel.

---

Let me know if you want a visual diagram or to expand this for actual Route53 + ECS setup.