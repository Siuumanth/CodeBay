Using a reverse proxy, we will map the Accessed URL of our website to the S3 files which will be delivered.

` I met with the // in S3 bucket URL cuz my outputs link has // cuz of relative path starting with /`

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