export default function Node({ node }) {
  return (
    <div
      style={{
        position: "absolute",
        left: node.x,
        top: node.y,
        padding: "10px 14px",
        background: "#1e293b",
        borderRadius: "8px",
        cursor: "grab",
      }}
    >
      {node.text}
    </div>
  );
}
