import { useState, useRef } from "react";
import Node from "./Node";

export default function Canvas() {
  const [nodes, setNodes] = useState([
    { id: "1", x: 200, y: 200, text: "Central Idea" },
  ]);

  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const isPanning = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  /* ---------- PAN ---------- */
  function onMouseDown(e) {
    if (e.target !== e.currentTarget) return;
    isPanning.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  }

  function onMouseMove(e) {
    if (!isPanning.current) return;

    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;

    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
    lastMouse.current = { x: e.clientX, y: e.clientY };
  }

  function onMouseUp() {
    isPanning.current = false;
  }

  /* ---------- ZOOM ---------- */
  function zoomIn() {
    setZoom((z) => Math.min(z + 0.1, 3));
  }

  function zoomOut() {
    setZoom((z) => Math.max(z - 0.1, 0.3));
  }

  /* ---------- NODE MOVE ---------- */
  function moveNode(id, dx, dy) {
    setNodes((nodes) =>
      nodes.map((n) =>
        n.id === id
          ? { ...n, x: n.x + dx / zoom, y: n.y + dy / zoom }
          : n
      )
    );
  }

  return (
    <div
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      style={{
        flex: 1,
        background: "#020617",
        overflow: "hidden",
        position: "relative",
        cursor: isPanning.current ? "grabbing" : "grab",
      }}
    >
      {/* Zoom Controls */}
      <div style={{ position: "absolute", top: 10, right: 10, zIndex: 10 }}>
        <button onClick={zoomIn}>+</button>
        <button onClick={zoomOut}>-</button>
      </div>

      {/* Transform Layer */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
          width: "100%",
          height: "100%",
          position: "absolute",
        }}
      >
        {nodes.map((node) => (
          <Node key={node.id} node={node} onMove={moveNode} />
        ))}
      </div>
    </div>
  );
}
