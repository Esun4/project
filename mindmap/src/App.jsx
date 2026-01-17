import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard"; 
import MindMap from "./pages/MindMap"; 

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />

      <Route path="/dashboard" element={<Dashboard />} />
      
      <Route path="/mindmap/:id" element={<MindMap />} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}