import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

export default function SignUp( {isDarkMode} ) {
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
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

    // Validation
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/auth/signup", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(form), // Fixed: using 'form' instead of 'data'
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Account created! Redirecting to login...");
        
        // Wait 1.5 seconds so they can read the success message
        setTimeout(() => {
          navigate("/signin");
        }, 1500);
      } else {
        setError(data.error || "Signup failed");
      }
    } catch (err) {
      setError("Server connection failed.");
      console.error(err);
    }
  }

  return (
    <div className="auth-page">
      <Link to="/" className="auth-logo">mindmap.ai</Link>

      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Start organizing your ideas</p>

        {error && <div className="message error">{error}</div>}
        {success && <div className="message success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <input className="auth-input" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required />
          <input className="auth-input" name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
          <input className="auth-input" name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input className="auth-input" name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
          <input className="auth-input" name="confirmPassword" type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} required />
          
          <button className="auth-btn" type="submit">Create Account</button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link replace to="/signin">Sign In</Link>
        </p>
      </div>
    </div>
  );
}