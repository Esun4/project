import { useState } from "react";

export default function SignIn() {
  const [form, setForm] = useState({
    identifier: "", // username OR email
    password: "",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

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
      // data error returns "Invalid credentials"
      alert(data.error || "Login failed");
      return;
    }

    console.log("Logged in user:", data);

  }

  return (
    <div className="auth-container">
      <h2>sign in</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="identifier"
          placeholder="Username or Email"
          value={form.identifier}
          onChange={handleChange}
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button type="submit">Sign In</button>
      </form>
    </div>
  );
}
