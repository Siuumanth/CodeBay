import express from "express";
import {
  getDeployments,
  getDeploymentWithLogs
} from "../controllers/deploy.controller.js";
import { verifyJWT } from "../middlewares/auth.mw.js";

const router = express.Router();

// /api/deployments
router.get("/getall", verifyJWT, getDeployments);
router.get("/:id",verifyJWT, getDeploymentWithLogs);

export default router;
