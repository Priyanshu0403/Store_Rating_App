import pool from "../db/index.js";

export const createStore = async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const result = await pool.query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, email, address, ownerId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllStores = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         s.id,
         s.name,
         s.address,
         ROUND(AVG(r.rating), 1) AS average_rating
       FROM stores s
       LEFT JOIN ratings r ON s.id = r.store_id
       GROUP BY s.id
       ORDER BY s.name ASC`
    );

    if(result.rows.length ===0){
        return res.status(404).json({
            status:"failed",
            message:"No store available"
        })
    }
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
