import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard"; //TEMPORARY
import MindMap from "./pages/MindMap"; //TEMPORARY

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/dashboard" element={<Dashboard />} /> //TEMPORARY
      <Route path="/mindmap/:id" element={<MindMap />} /> //TEMPORARY
    </Routes>
  );
}
