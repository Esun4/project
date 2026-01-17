import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  const mindmaps = [
    { id: "1", title: "Biology Notes", thumb: "https://placehold.co/600x400/fcfcfc/000f000?text=JAJAJAJA" }, //https://placehold.co/
    { id: "2", title: "Startup Ideas", thumb: "https://placehold.co/600x400/fcfcfc/000000?text=JAJAJAJA2" },
  ];

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">My Workspace</h1>
        <button className="create-btn" onClick={() => navigate("/mindmap/new")}> 
          + New Project
        </button>
      </header>

      <ul className="mindmap-grid">
        {mindmaps.map((map) => (
          <li key={map.id} className="mindmap-card" onClick={() => navigate(`/mindmap/${map.id}`)}>
            <div className="card-preview">
              {/* put zoomed-out thumbnail image here */}
              <img src={map.thumb} alt="Map Preview" />
            </div>
            
            <div className="card-info">
              <h3 className="card-title">{map.title}</h3>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}