// controllers/auth.controller.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import queries from "../queries/auth.queries.json" assert { type: "json" };

const JWT_SECRET = process.env.JWT_SECRET;

// Sigining UP
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await pool.query(queries.findUserByEmail, [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool.query(queries.createUser, [username, email, hashedPassword]);
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    next(err);
  }
};

// Login user and return JWT
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const userRes = await pool.query(queries.findUserByEmail, [email]);
    const user = userRes.rows[0];

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(401).json({ message: "Invalid credentials" });

    // Create JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "3h" });

    res.json({ token });
  } catch (err) {
    next(err);
  }
};

// Logout user
export const logout = async (req, res, next) => {
  try {
    // we are not storing refrest tokens in the database, so we don't need to do anything here
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};


// Get user profile 
export const me = async (req, res, next) => {
  try {
    const userRes = await pool.query(queries.findUserById, [req.user.id]);
    const user = userRes.rows[0];

    res.json({ user });
  } catch (err) {
    next(err);
  }
};
