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
    const { name, address } = req.query;
    const userId = req.user?.id; // comes from verifyToken middleware

    let query = `
      SELECT
        s.id,
        s.name,
        s.address,
        ROUND(AVG(r.rating), 1) AS average_rating,
        ur.rating AS user_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      LEFT JOIN ratings ur 
        ON ur.store_id = s.id AND ur.user_id = $1
      WHERE 1=1
    `;

    const params = [userId];
    let paramIndex = 2;

    if (name) {
      query += ` AND s.name ILIKE $${paramIndex}`;
      params.push(`%${name}%`);
      paramIndex++;
    }

    if (address) {
      query += ` AND s.address ILIKE $${paramIndex}`;
      params.push(`%${address}%`);
      paramIndex++;
    }

    query += `
      GROUP BY s.id, ur.rating
      ORDER BY s.name ASC
    `;

    const result = await pool.query(query, params);

    res.json(result.rows);
  } catch (error) {
    console.error("Get stores error:", error);
    res.status(500).json({ message: "Server error" });
  }
};