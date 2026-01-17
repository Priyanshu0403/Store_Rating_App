import express from "express";
import { getProfile, updatePassword } from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", verifyToken, getProfile);
router.put("/update-password", verifyToken, updatePassword);

export default router;
