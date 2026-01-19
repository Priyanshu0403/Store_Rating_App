import { useEffect, useState } from "react";
import api from "../api/axios";
import "./AdminDashboard.css";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [userFilters, setUserFilters] = useState({});

  const { logout } = useContext(AuthContext);
const navigate = useNavigate();

const handleLogout = () => {
  logout();
  navigate("/login");
};

  const fetchFilteredUsers = async () => {
    const res = await api.get("/admin/users", {
      params: userFilters,
    });
    setUsers(res.data);
  };

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
    role: "USER",
  });

  const [newStore, setNewStore] = useState({
    name: "",
    email: "",
    address: "",
  });

  const [assignments, setAssignments] = useState({});

  const fetchAll = async () => {
    try {
      const [statsRes, usersRes, storesRes] = await Promise.all([
        api.get("/admin/dashboard"),
        api.get("/admin/users"),
        api.get("/admin/stores"),
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setStores(storesRes.data);
    } catch (err) {
      console.error("Failed to load admin data", err);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const createUser = async () => {
    try {
      await api.post("/admin/create-user", newUser);
      setNewUser({
        name: "",
        email: "",
        address: "",
        password: "",
        role: "USER",
      });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create user");
    }
  };

  const deleteUser = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      fetchAll();
    } catch {
      alert("Failed to delete user");
    }
  };

  const createStore = async () => {
    try {
      await api.post("/stores", newStore);
      setNewStore({ name: "", email: "", address: "" });
      fetchAll();
    } catch {
      alert("Failed to create store");
    }
  };

  const deleteStore = async (id) => {
    try {
      await api.delete(`/admin/stores/${id}`);
      fetchAll();
    } catch {
      alert("Failed to delete store");
    }
  };

  const assignOwner = async (storeId) => {
    const ownerId = Number(assignments[storeId]);

    if (!ownerId) {
      alert("Please select a store owner");
      return;
    }

    try {
      await api.put(`/admin/stores/${storeId}/assign-owner`, {
        ownerId,
      });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to assign store owner");
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
  <h2>Admin Dashboard</h2>
  <button className="btn danger" onClick={handleLogout}>
    Logout
  </button>
</div>


      <div className="stats-grid">
        <div className="stat-card">Users: {stats.total_users}</div>
        <div className="stat-card">Stores: {stats.total_stores}</div>
        <div className="stat-card">Ratings: {stats.total_ratings}</div>
      </div>

      <div className="admin-card">
        <h3>User Management</h3>

        <h5>Filter Users</h5>
        <div className="admin-form">
          <input
            placeholder="Name"
            onChange={(e) =>
              setUserFilters({ ...userFilters, name: e.target.value })
            }
          />
          <input
            placeholder="Email"
            onChange={(e) =>
              setUserFilters({ ...userFilters, email: e.target.value })
            }
          />
          <input
            placeholder="Address"
            onChange={(e) =>
              setUserFilters({ ...userFilters, address: e.target.value })
            }
          />
          <select
            onChange={(e) =>
              setUserFilters({ ...userFilters, role: e.target.value })
            }
          >
            <option value="">All Roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="USER">USER</option>
            <option value="STORE_OWNER">STORE_OWNER</option>
          </select>

          <button className="btn secondary" onClick={fetchFilteredUsers}>
            Apply Filters
          </button>
        </div>

        <div className="admin-form">
          <input
            placeholder="Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          />
          <input
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <input
            placeholder="Address"
            value={newUser.address}
            onChange={(e) =>
              setNewUser({ ...newUser, address: e.target.value })
            }
          />
          <input
            placeholder="Password"
            type="password"
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
          />

          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          >
            <option value="USER">USER</option>
            <option value="STORE_OWNER">STORE_OWNER</option>
            <option value="ADMIN">ADMIN</option>
          </select>

          <button className="btn primary" onClick={createUser}>
            Add User
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Rating</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  {u.role === "STORE_OWNER" ? (
                    <span className="rating">{u.rating ?? "N/A"}</span>
                  ) : (
                    "-"
                  )}
                </td>

                <td>
                  <button
                    className="btn danger"
                    onClick={() => deleteUser(u.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-card">
        <h3>Store Management</h3>

        <div className="admin-form">
          <input
            placeholder="Store Name"
            value={newStore.name}
            onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
          />
          <input
            placeholder="Email"
            value={newStore.email}
            onChange={(e) =>
              setNewStore({ ...newStore, email: e.target.value })
            }
          />
          <input
            placeholder="Address"
            value={newStore.address}
            onChange={(e) =>
              setNewStore({ ...newStore, address: e.target.value })
            }
          />
          <button className="btn primary" onClick={createStore}>
            Add Store
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th>Store</th>
              <th>Email</th>
              <th>Address</th>
              <th>Rating</th>
              <th>Assign Owner</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{s.address}</td>
                <td>{s.average_rating ?? "N/A"}</td>
                <td>
                  <select
                    onChange={(e) =>
                      setAssignments({
                        ...assignments,
                        [s.id]: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Owner</option>
                    {users
                      .filter((u) => u.role === "STORE_OWNER")
                      .map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name}
                        </option>
                      ))}
                  </select>
                  <button
                    className="btn secondary"
                    onClick={() => assignOwner(s.id)}
                  >
                    Assign
                  </button>
                </td>
                <td>
                  <button
                    className="btn danger"
                    onClick={() => deleteStore(s.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
