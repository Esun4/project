// import { Routes, Route, Navigate } from "react-router-dom";
// import Home from "./pages/Home";
// import SignIn from "./pages/SignIn";
// import SignUp from "./pages/SignUp";
// import Dashboard from "./pages/Dashboard"; 
// import MindMap from "./pages/MindMap"; 

// export default function App() {
//   return (
//     <Routes>
//       <Route path="/" element={<Home />} />
//       <Route path="/signin" element={<SignIn />} />
//       <Route path="/signup" element={<SignUp />} />

//       <Route path="/dashboard" element={<Dashboard />} />

//       <Route path="/mindmap/:id" element={<MindMap />} />

//       <Route path="*" element={<Navigate to="/" />} />
//     </Routes>
//   );
// }

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

  console.log("Security Check - User is:", user ? "Logged In" : "Logged Out");

  useEffect(() => {
    async function loadMe() {
      try {
        const res = await fetch("http://localhost:3000/auth/me", {
          credentials: "include",
        });

        if (!res.ok) {
          setUser(null);
          return;
        }

        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error("Failed to load session:", err);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    }

    loadMe();
  }, []);

  if (authLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/signin"
        element={user ? <Navigate to="/dashboard" /> : <SignIn setUser={setUser} />}
      />

      <Route path="/signup" element={<SignUp />} />

      <Route
        path="/dashboard"
        element={user ? <Dashboard user={user} /> : <Navigate to="/signin" />}
      />

      <Route
        path="/mindmap/:id"
        element={user ? <MindMap user={user} /> : <Navigate to="/signin" />}
      />


      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}