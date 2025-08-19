// config/db.js
import pkg from "pg";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();
const { Pool } = pkg;

let caFile;

try{
  caFile = fs.readFileSync('/etc/secrets/ca.pem').toString();
} catch(e) {
  caFile = fs.readFileSync('ca.pem').toString()
}

// Create a connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT || 5432,
   ssl: {
    rejectUnauthorized: true, // ensures server certificate is verified
    ca: caFile, // path to your CA cert
  },
});

// Simple test query
pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch((err) => console.error("❌ DB connection error:", err));

export default pool;
