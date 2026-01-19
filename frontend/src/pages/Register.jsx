import { useState } from "react";
import { registerUser } from "../api/authApi.js";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Frontend validation
    if (form.name.length < 20 || form.name.length > 60) {
      setError("Name must be between 20 and 60 characters");
      return;
    }

    if (!form.email || !form.password) {
      setError("Email and password are required");
      return;
    }

    if (form.password.length < 8 || form.password.length > 16) {
      setError("Password must be 8–16 characters long");
      return;
    }

    try {
      setLoading(true);
      await registerUser(form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <form className="register-card" onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        <p className="subtitle">Register to rate stores</p>

        {error && <div className="error">{error}</div>}

        <input
          name="name"
          placeholder="Full Name (20–60 characters)"
          value={form.name}
          onChange={handleChange}
        />

        <input
          name="email"
          type="email"
          placeholder="Email address"
          value={form.email}
          onChange={handleChange}
        />

        <input
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
        />

        <input
          name="password"
          type="password"
          placeholder="Password (8–16 characters)"
          value={form.password}
          onChange={handleChange}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="footer-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
