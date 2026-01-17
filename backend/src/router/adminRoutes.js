import express from "express";
import {
  getDashboardStats,
  getAllUsers,
  getAllStores,
  createUser
} from "../controllers/adminController.js";

import { verifyToken, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyToken, allowRoles("ADMIN"));

router.get("/dashboard", getDashboardStats);
router.get("/users", getAllUsers);
router.get("/stores", getAllStores);
router.post("/create-user", createUser);

export default router;
