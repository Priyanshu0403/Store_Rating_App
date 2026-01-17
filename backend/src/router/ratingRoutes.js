import express from "express";
import {
  submitRating,
  storeOwnerDashboard
} from "../controllers/ratingController.js";

import { verifyToken, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/",verifyToken,allowRoles("USER"),submitRating
);

router.get(
  "/store-owner",verifyToken,allowRoles("STORE_OWNER"),storeOwnerDashboard
);

export default router;
