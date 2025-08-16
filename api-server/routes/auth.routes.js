// routes/auth.routes.js
import { Router } from "express";
import { register, login, logout } from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.mw.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", verifyJWT, logout);

export default router;
