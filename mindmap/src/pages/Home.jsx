import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      <h1>test</h1>
      <p>hi </p>

      <div className="home-buttons">
        <button onClick={() => navigate("/dashboard")}>sign in</button>
        <button onClick={() => navigate("/signup")}>sign up</button>
      </div>
    </div>
  );
}
