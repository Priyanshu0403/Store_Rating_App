import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./router/authRoutes.js"
import userRoutes from "./router/userRoutes.js"
import storeRoutes from "./router/storeRoutes.js"
import ratingRoutes from "./router/ratingRoutes.js"
import adminRoutes from "./router/adminRoutes.js"

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/admin", adminRoutes);
//test
app.get("/", (req, res) => {
  res.send("Store Rating API");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
