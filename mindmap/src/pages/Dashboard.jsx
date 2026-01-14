import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const mindmaps = [
    { id: "1", title: "Biology Notes" },
    { id: "2", title: "Startup Ideas" },
  ];

  return (
    <div>
      <h1>Your Dashboard</h1>

      <button onClick={() => navigate("/mindmap/new")}>
        + New Mind Map
      </button>

      <ul>
        {mindmaps.map((map) => (
          <li key={map.id}>
            <button onClick={() => navigate(`/mindmap/${map.id}`)}>
              {map.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
