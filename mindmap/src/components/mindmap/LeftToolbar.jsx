export default function LeftToolbar({
  onAdd,
  onDelete,
  onUndo,
  onRedo,
  canDelete,
  canUndo,
  canRedo,
}) {
  return (
    <div
      style={{
        position: 'absolute',
        left: 10,
        top: 10,
        background: '#fff',
        padding: 10,
        borderRadius: 6,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        fontFamily: "'Quicksand', 'Google Sans Code', sans-serif", 
      }}
    >
      <button onClick={onAdd}>➕ Add Node</button>

        <button 
            onClick={onDelete} 
            disabled={!canDelete}
            style={{
                cursor: canDelete ? 'pointer' : 'not-allowed',
                opacity: canDelete ? 1 : 0.5,
                border: '1px solid #ddd',
                padding: '4px 8px',
                borderRadius: '4px'
            }}
        >
        🗑 Delete Node
        </button>

        <button onClick={onUndo} disabled={!canUndo}>
            ↩ Undo
        </button>

        <button onClick={onRedo} disabled={!canRedo}>
            ↪ Redo
        </button>

        <button
            onClick={() => {
            /*
                AI SUGGESTION PLACEHOLDER

                fetch('http://localhost:8000/ai/suggest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nodes, edges }),
                })
            */
            }}
        >
        AI Suggest
      </button>
    </div>
  );
}
