import bcrypt from "bcrypt";
import pool from "../db/index.js";

export const getDashboardStats = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM stores) AS total_stores,
        (SELECT COUNT(*) FROM ratings) AS total_ratings
    `);

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
const { name, email, role, address } = req.query;

    let query = `
      SELECT id, name, email, address, role
      FROM users
      WHERE 1=1
    `;
    const params = [];

    if (name) {
      params.push(`%${name}%`);
      query += ` AND name ILIKE $${params.length}`;
    }

    if (email) {
      params.push(`%${email}%`);
      query += ` AND email ILIKE $${params.length}`;
    }

    if (role) {
      params.push(role);
      query += ` AND role = $${params.length}`;
    }
    if (address) {
  params.push(`%${address}%`);
  query += ` AND address ILIKE $${params.length}`;
}


    query += " ORDER BY name ASC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, address, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Missing fields" });
    }

    if (name.length < 20 || name.length > 60) {
      return res.status(400).json({
        status: "failed",
        message: "Name must be between 20 and 60 characters",
      });
    }

    const validRoles = ["ADMIN", "USER", "STORE_OWNER"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, address, password, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role`,
      [name, email, address, hashedPassword, role]
    );

    res.status(201).json({
      message: "User created successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (!userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      [userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllStores = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.owner_id,
        ROUND(AVG(r.rating), 1) AS average_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      GROUP BY s.id
      ORDER BY s.name ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Get stores error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteStore = async (req, res) => {
  try {
    const storeId = Number(req.params.id);

    if (!storeId) {
      return res.status(400).json({ message: "Invalid store ID" });
    }

    const result = await pool.query(
      "DELETE FROM stores WHERE id = $1 RETURNING id",
      [storeId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Store not found" });
    }

    res.json({ message: "Store deleted successfully" });
  } catch (error) {
    console.error("Delete store error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const assignStoreOwner = async (req, res) => {
  try {
    const storeId = Number(req.params.id);
    const ownerId = Number(req.body.ownerId);

    if (!storeId || !ownerId) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const ownerCheck = await pool.query(
      "SELECT id FROM users WHERE id = $1 AND role = 'STORE_OWNER'",
      [ownerId]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid store owner",
      });
    }

    const result = await pool.query(
      "UPDATE stores SET owner_id = $1 WHERE id = $2 RETURNING *",
      [ownerId, storeId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Store not found" });
    }

    res.json({
      message: "Store owner assigned successfully",
      store: result.rows[0],
    });
  } catch (error) {
    console.error("Assign store owner error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getStoreOwnerRating = async (req, res) => {
  const ownerId = req.params.id;

  const result = await pool.query(
    `
    SELECT ROUND(AVG(r.rating), 1) AS rating
    FROM stores s
    LEFT JOIN ratings r ON s.id = r.store_id
    WHERE s.owner_id = $1
    `,
    [ownerId]
  );

  res.json({ rating: result.rows[0].rating || "N/A" });
};
