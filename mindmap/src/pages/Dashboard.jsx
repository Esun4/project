import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Dashboard.css";

export default function Dashboard({ setUser }) {
  const navigate = useNavigate();

  const [mindmaps, setMindmaps] = useState([]);
  const [menuPos, setMenuPos] = useState(null); 
  const [isRenaming, setIsRenaming] = useState(null);
  const [editTitle, setEditTitle] = useState("");    
  const [deleteConfirm, setDeleteConfirm] = useState({ visible: false, mapId: null });
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleContextMenu = (e, map) => {
    e.preventDefault();
    setMenuPos({ x: e.pageX, y: e.pageY, mapId: map.id, currentTitle: map.title });
  };

  const loadMindmaps = async () => {
    try {
      const res = await fetch("http://localhost:3000/mindmaps", { credentials: "include" });
      const data = await res.json();
      if (res.ok) setMindmaps(data.mindmaps);
    } catch (err) {
      console.error("Failed to fetch mindmaps:", err);
    }
  };

  useEffect(() => { loadMindmaps(); }, []);

  const promptDelete = (id) => {
    setDeleteConfirm({ visible: true, mapId: id });
    setMenuPos(null); 
  };

  const confirmDelete = async () => {
    const { mapId } = deleteConfirm;
    try {
      const res = await fetch(`http://localhost:3000/mindmaps/${mapId}`, { 
        method: 'DELETE', 
        credentials: "include" 
      });
      
      if (res.ok) {
        setMindmaps(prev => prev.filter(m => m.id !== mapId));
      }
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setDeleteConfirm({ visible: false, mapId: null });
    }
  };

  const handleDuplicate = async (mapId) => {
    const mapToCopy = mindmaps.find(m => m.id === mapId);
    const payload = {
      title: `${mapToCopy.title} (Copy)`,
      data: mapToCopy.data,
      thumbnail: mapToCopy.thumbnail
    };
    const res = await fetch("http://localhost:3000/mindmaps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (res.ok) loadMindmaps();
    setMenuPos(null);
  };

  const handleRenameSubmit = async (id) => {
    if (!editTitle.trim()) {
      setIsRenaming(null);
      return;
    }

    const mapToUpdate = mindmaps.find(m => m.id === id);
    try {
      await fetch("http://localhost:3000/mindmaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: id,
          title: editTitle,
          data: mapToUpdate.data,
          thumbnail: mapToUpdate.thumbnail
        }),
      });
      setMindmaps(prev => prev.map(m => m.id === id ? { ...m, title: editTitle } : m));
    } catch (err) {
      console.error("Rename failed", err);
    } finally {
      setIsRenaming(null);
    }
  };

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      const res = await fetch("http://localhost:3000/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        console.error("Failed to sign out");
        return;
      }

      setUser?.(null);
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Sign out failed:", err);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">My Workspace</h1>
        <div className="dashboard-actions">
          <button className="create-btn" onClick={() => navigate("/mindmap/new")}>
            + New Project
          </button>
          <button
            className="signout-btn"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            {isSigningOut ? "Signing Out..." : "Sign Out"}
          </button>
        </div>
      </header>

      {mindmaps.length === 0 ? (
        <p>No saved mindmaps yet — click “New Project”.</p>
      ) : (
        <ul className="mindmap-grid">
          {mindmaps.map((map) => (
            <li 
              key={map.id} 
              className="mindmap-card" 
              // Only navigate if we aren't currently renaming this specific card
              onClick={() => isRenaming !== map.id && navigate(`/mindmap/${map.id}`)}
              onContextMenu={(e) => handleContextMenu(e, map)}
            >
              <div className="card-preview">
                {map.thumbnail ? (
                  <img src={map.thumbnail} alt={map.title} />
                ) : (
                  <div style={{ color: '#ccc', fontSize: '12px' }}>No preview yet</div>
                )}
              </div>

              <div className="card-info" onClick={(e) => e.stopPropagation()}>
                {isRenaming === map.id ? (
                  <input
                    autoFocus
                    className="inline-rename-input"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => handleRenameSubmit(map.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameSubmit(map.id);
                      if (e.key === 'Escape') setIsRenaming(null);
                    }}
                  />
                ) : (
                  <h3 className="card-title">{map.title}</h3>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {menuPos && (
        <div 
          className="dashboard-ctx-menu" 
          style={{ top: menuPos.y, left: menuPos.x }}
          onMouseLeave={() => setMenuPos(null)}
        >
          <div className="ctx-item" onClick={() => {
            setIsRenaming(menuPos.mapId);
            setEditTitle(menuPos.currentTitle);
            setMenuPos(null);
          }}>Rename</div>
          
          <div className="ctx-item" onClick={() => handleDuplicate(menuPos.mapId)}>Duplicate</div>
          
          {/* CHANGE: Call promptDelete instead of handleDelete */}
          <div className="ctx-item ctx-delete" onClick={() => promptDelete(menuPos.mapId)}>
            Delete
          </div>
        </div>
      )}

      {deleteConfirm.visible && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm({ visible: false, mapId: null })}>
          {/* stopPropagation prevents clicking the modal itself from closing it */}
          <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Mindmap?</h3>
            <p>This action cannot be undone. All your nodes and edges will be lost forever.</p>
            <div className="modal-actions">
              <button 
                className="modal-btn cancel-btn" 
                onClick={() => setDeleteConfirm({ visible: false, mapId: null })}
              >
                Cancel
              </button>
              <button 
                className="modal-btn delete-confirm-btn" 
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
