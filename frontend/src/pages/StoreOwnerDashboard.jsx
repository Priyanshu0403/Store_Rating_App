import { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./StoreOwnerDashboard.css";

const StoreOwnerDashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // 🔐 Change password state
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/ratings/store-owner");
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard");
    }
  };

  const updatePassword = async () => {
    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
      setMessage("Please fill both password fields");
      return;
    }

    try {
      await api.put("/users/update-password", passwordForm);
      setMessage("Password updated successfully");
      setPasswordForm({ oldPassword: "", newPassword: "" });
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update password");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (error) {
    return <div className="owner-container error">{error}</div>;
  }

  if (!data) {
    return <div className="owner-container">Loading dashboard...</div>;
  }

  return (
    <div className="owner-container">
      <div className="owner-header">
        <h2>Store Owner Dashboard</h2>
        <button className="btn danger" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {message && <div className="info">{message}</div>}
      <div className="owner-card">
        <h3>Change Password</h3>
        <input
          type="password"
          placeholder="Old Password"
          value={passwordForm.oldPassword}
          onChange={(e) =>
            setPasswordForm({
              ...passwordForm,
              oldPassword: e.target.value,
            })
          }
        />
        <input
          type="password"
          placeholder="New Password"
          value={passwordForm.newPassword}
          onChange={(e) =>
            setPasswordForm({
              ...passwordForm,
              newPassword: e.target.value,
            })
          }
        />
        <button className="btn primary" onClick={updatePassword}>
          Update Password
        </button>
      </div>

<h3>Store</h3>
      <div className="owner-card">
        <h3>{data.store}</h3>
        <p>
          Average Rating:{" "}
          <strong className="rating">{data.averageRating}</strong>
        </p>
      </div>

      <div className="owner-card">
        <h3>Customer Ratings</h3>

        {data.ratings.length === 0 ? (
          <p>No ratings submitted yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>User Name</th>
                <th>Email</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {data.ratings.map((r, i) => (
                <tr key={i}>
                  <td>{r.name}</td>
                  <td>{r.email}</td>
                  <td className="rating">{r.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StoreOwnerDashboard;
