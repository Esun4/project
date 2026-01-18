import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import MindMap from "./pages/MindMap";
import { useEffect, useState } from "react";

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // 1. GLOBAL THEME STATE
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  // 2. APPLY THEME TO BODY & STORAGE
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  useEffect(() => {
    async function loadMe() {
      try {
        const res = await fetch("http://localhost:3000/auth/me", { credentials: "include" });
        if (!res.ok) { setUser(null); return; }
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    }
    loadMe();
  }, []);

  if (authLoading) return <div>Loading...</div>;

  return (
    <Routes>
      <Route path="/" element={<Home isDarkMode={isDarkMode} toggleTheme={toggleTheme} />} />
      <Route
        path="/signin"
        element={user ? <Navigate to="/dashboard" /> : <SignIn setUser={setUser} isDarkMode={isDarkMode} />}
      />
      <Route path="/signup" element={<SignUp isDarkMode={isDarkMode} />} />
      <Route
        path="/dashboard"
        element={user ? <Dashboard user={user} isDarkMode={isDarkMode} toggleTheme={toggleTheme} /> : <Navigate to="/signin" />}
      />
      <Route
        path="/mindmap/:id"
        element={user ? <MindMap user={user} isDarkMode={isDarkMode} toggleTheme={toggleTheme} /> : <Navigate to="/signin" />}
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}