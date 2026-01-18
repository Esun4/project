import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

export default function SignIn({ setUser, isDarkMode }) {
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          emailOrUsername: form.identifier,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      
      const userToSet = data.id ? data : data.user; 

      if (userToSet) {
        setSuccess("Success! Redirecting...");
        
        setTimeout(() => {
          setUser(userToSet); 
          // The moment this runs, App.jsx will trigger redirect
        }, 800);
      } else {
        setError("Invalid response from server");
      }

    } catch (err) {
      setError("Server connection failed.");
    }
  }

  return (
    <div className="auth-page">
      <Link to="/" className="auth-logo">mindmap.ai</Link> 

      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your workspace</p>
        
        {error && <div className="message error">{error}</div>}
        {success && <div className="message success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            className="auth-input"
            name="identifier"
            placeholder="Username or Email"
            value={form.identifier}
            onChange={handleChange}
            required
          />
          <input
            className="auth-input"
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button className="auth-btn" type="submit">Sign In</button>
        </form>
        
        <p className="auth-footer">
          Don't have an account? <Link replace to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}