export default function Toolbar({ addNode }) {
  return (
    <div
      style={{
        height: "50px",
        background: "#020617",
        display: "flex",
        alignItems: "center",
        padding: "0 1rem",
        gap: "1rem",
      }}
    >
      <button onClick={() => addNode(200, 200)}>
        Add Node
      </button>

      <button>Connect</button>
      <button>Save</button>
    </div>
  );
}
