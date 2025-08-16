
We are using **Aiven PostgreSQL**, which requires a secure connection using a connection string and a CA certificate.

1. **Save the connection string**
    - Go to Aiven console → PostgreSQL service → _Connection information_.
    - Copy the **`psql` connection URL**.
    - Save it in the `.env` file in the project root:
```env
        DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DBNAME?sslmode=require"
```
        
2. **Link the CA certificate**
    - Download the `ca.pem` file from Aiven’s console.
    - Place it in a secure folder inside the project, e.g. `/certs/ca.pem`.
    - Append the certificate path to the connection URL:
        
        ```env
        DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DBNAME?sslmode=require&sslcert=/path/to/certs/ca.pem"
        ```
        
3. **Prisma integration**
    - Prisma automatically uses `DATABASE_URL` from `.env` in the `datasource db` block.
    - With SSL enabled (`sslmode=require`), Prisma will use Aiven’s CA cert to establish a secure connection.

---



We are using **Prisma ORM** with **PostgreSQL** hosted on **Aiven** for Codeway’s database. The Prisma schema defines our data models, enums, and database connection. The `init` migration creates the initial database structure from this schema.

```sql
generator client {
  provider = "prisma-client-js"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum DeploymentStatus {
  QUEUED
  IN_PROGRESS
  READY
  FAIL
  NOT_STARTED
}

model Project {
  id         String      @id @default(uuid())
  name       String
  gitURL     String      @map("git_url")
  subdomain  String      @map("subdomain")
  Deployment Deployment[]
  createdAt  DateTime    @default(now()) @map("created_at")
  updatedAt  DateTime    @updatedAt      @map("updated_at")
}

model Deployment {
  id         String           @id @default(uuid())
  project    Project          @relation(fields: [projectId], references: [id])
  projectId  String           @map("project_id")
  status     DeploymentStatus @default(NOT_STARTED)
  createdAt  DateTime         @default(now()) @map("created_at")
  updatedAt  DateTime         @updatedAt      @map("updated_at")
}
```

`npx prisma migrate dev --name init` is used to create the initial migration file (`init`) and apply it to the database so the tables and relationships match the schema.







---
