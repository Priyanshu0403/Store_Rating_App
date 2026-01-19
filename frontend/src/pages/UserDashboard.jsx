import { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./UserDashboard.css";

const UserDashboard = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [stores, setStores] = useState([]);
  const [rating, setRating] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
  });

  const [filters, setFilters] = useState({
    name: "",
    address: "",
  });

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const res = await api.get("/stores", { params: filters });
      setStores(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load stores");
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async () => {
    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
      alert("Please fill all fields");
      return;
    }

    try {
      await api.put("/users/update-password", passwordForm);
      alert("Password updated successfully");
      setPasswordForm({ oldPassword: "", newPassword: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update password");
    }
  };

  const submitRating = async (storeId) => {
    if (!rating[storeId]) {
      setMessage("Please select a rating between 1 and 5");
      return;
    }

    try {
      await api.post("/ratings", {
        storeId,
        rating: rating[storeId],
      });
      setMessage("Rating submitted successfully");
      fetchStores();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to submit rating");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return <div className="user-container">Loading stores...</div>;
  }

  if (error) {
    return <div className="user-container error">{error}</div>;
  }

  return (
    <div className="user-container">
      <div className="user-header">
        <h2>User Dashboard</h2>
        <button className="btn danger" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="user-card">
        <h3>Update Password</h3>
        <input
          type="password"
          placeholder="Old Password"
          value={passwordForm.oldPassword}
          onChange={(e) =>
            setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
          }
        />
        <input
          type="password"
          placeholder="New Password"
          value={passwordForm.newPassword}
          onChange={(e) =>
            setPasswordForm({ ...passwordForm, newPassword: e.target.value })
          }
        />
        <button className="btn primary" onClick={updatePassword}>
          Update Password
        </button>
      </div>

      <div className="user-card">
        <h3>Search Stores</h3>
        <div className="search-row">
          <input
            placeholder="Store Name"
            onChange={(e) =>
              setFilters({ ...filters, name: e.target.value })
            }
          />
          <input
            placeholder="Address"
            onChange={(e) =>
              setFilters({ ...filters, address: e.target.value })
            }
          />
          <button className="btn secondary" onClick={fetchStores}>
            Search
          </button>
        </div>
      </div>

      <h3>All Stores</h3>
      {message && <div className="info">{message}</div>}

      <div className="store-grid">
        {stores.map((store) => (
          <div className="store-card" key={store.id}>
            <h4>{store.name}</h4>
            <p className="address">{store.address}</p>

            <p>
              Overall Rating:{" "}
              <span className="rating-text">
                {store.average_rating ?? "N/A"}
              </span>
            </p>

            <p>
              Your Rating:{" "}
              <strong>{store.user_rating ?? "Not rated"}</strong>
            </p>

            <div className="rating-input">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  className={
                    rating[store.id] === num ? "rate active" : "rate"
                  }
                  onClick={() =>
                    setRating({ ...rating, [store.id]: num })
                  }
                >
                  {num}
                </button>
              ))}
            </div>

            <button
              className="btn primary"
              onClick={() => submitRating(store.id)}
            >
              {store.user_rating ? "Update Rating" : "Submit Rating"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserDashboard;
