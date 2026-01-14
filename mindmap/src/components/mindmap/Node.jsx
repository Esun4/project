import { useRef, useState } from "react";

export default function Node({ node, onMove }) {
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const [text, setText] = useState(node.text);

  function onMouseDown(e) {
    e.stopPropagation();
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
  }

  function onMouseMove(e) {
    if (!dragging.current) return;

    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;

    onMove(node.id, dx, dy);
    last.current = { x: e.clientX, y: e.clientY };
  }

  function onMouseUp() {
    dragging.current = false;
  }

  return (
    <div
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      style={{
        position: "absolute",
        left: node.x,
        top: node.y,
        padding: "10px 14px",
        background: "#1e293b",
        borderRadius: "8px",
        color: "white",
        minWidth: "80px",
        cursor: "move",
        userSelect: "none",
      }}
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => setText(e.target.innerText)}
    >
      {text}
    </div>
  );
}
