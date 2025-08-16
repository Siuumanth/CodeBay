import express from "express";
import {
  getProjectsByUser,
  getProjectById,
  deleteProject
} from "../controllers/project.controller.js";
import { verifyJWT } from "../middlewares/auth.mw.js";


const router = express.Router();

// /api/projects
router.get("/", verifyJWT, getProjectsByUser);
router.get("/:id", verifyJWT,  getProjectById);
router.delete("/:id", verifyJWT, deleteProject);

export default router;
