import bcrypt from "bcrypt";
import pool from "../db/index.js";

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      "SELECT id, name, email, address, role FROM users WHERE id = $1",
      [userId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


export const updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: "Missing fields" });
    }

    const userResult = await pool.query(
      "SELECT password FROM users WHERE id = $1",
      [userId]
    );

    const isMatch = await bcrypt.compare(
      oldPassword,
      userResult.rows[0].password
    );

    if (!isMatch) {
      return res.status(401).json({ message: "Old password incorrect" });
    }

    console.log(newPassword);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE users SET password = $1 WHERE id = $2",
      [hashedPassword, userId]
    );

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message});
  }
};
