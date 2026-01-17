import express from "express";
import {
  createStore,
  getAllStores
} from "../controllers/storeController.js";

import { verifyToken, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/",verifyToken,allowRoles("ADMIN"),createStore
);

router.get(
  "/",verifyToken,getAllStores
);

export default router;
