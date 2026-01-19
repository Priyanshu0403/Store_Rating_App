import pool from "../db/index.js";

export const submitRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const { storeId, rating } = req.body;

    if (!storeId || !rating) {
      return res.status(400).json({ message: "Missing fields" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Check if store exists
    const storeResult = await pool.query(
      "SELECT id FROM stores WHERE id = $1",
      [storeId]
    );

    if (storeResult.rows.length === 0) {
      return res.status(404).json({ message: "Store not found" });
    }

    const ratingResult = await pool.query(
      "SELECT id FROM ratings WHERE user_id = $1 AND store_id = $2",
      [userId, storeId]
    );

    if (ratingResult.rows.length === 0) {
      await pool.query(
        "INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)",
        [userId, storeId, rating]
      );

      return res.status(201).json({ message: "Rating submitted successfully" });
    } else {
      await pool.query(
        "UPDATE ratings SET rating = $1 WHERE user_id = $2 AND store_id = $3",
        [rating, userId, storeId]
      );

      return res.json({ message: "Rating updated successfully" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};



export const storeOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Get store owned by this user
    const storeResult = await pool.query(
      "SELECT id, name FROM stores WHERE owner_id = $1",
      [ownerId]
    );

    if (storeResult.rows.length === 0) {
      return res.status(404).json({
        message: "No store assigned to this owner",
      });
    }

    const store = storeResult.rows[0];

    // Get ratings + users
    const ratingResult = await pool.query(
      `
      SELECT 
        u.name,
        u.email,
        r.rating
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = $1
      ORDER BY r.rating DESC
      `,
      [store.id]
    );

    // Average rating
    const avgResult = await pool.query(
      "SELECT ROUND(AVG(rating), 1) AS avg FROM ratings WHERE store_id = $1",
      [store.id]
    );

    res.json({
      store: store.name,
      averageRating: avgResult.rows[0].avg ?? "N/A",
      ratings: ratingResult.rows,
    });
  } catch (error) {
    console.error("Store owner dashboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
};