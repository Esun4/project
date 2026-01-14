export default function ToolBar() {
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
      <button>Add Node</button>
      <button>Connect</button>
      <button>Save</button>
    </div>
  );
}
