import express from "express";
import {
  getDashboardStats,
  getAllUsers,
  getAllStores,
  createUser,
  deleteUser,
  deleteStore,
  assignStoreOwner,
  getStoreOwnerRating
} from "../controllers/adminController.js";

import { verifyToken, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyToken, allowRoles("ADMIN"));

router.get("/dashboard", getDashboardStats);

router.get("/users", getAllUsers);
router.post("/create-user", createUser);
router.delete("/users/:id", deleteUser);
router.get("/stores", getAllStores);
router.delete("/stores/:id", deleteStore);
router.put("/stores/:id/assign-owner", assignStoreOwner);
router.get("/users/:id/rating", getStoreOwnerRating);


export default router;
